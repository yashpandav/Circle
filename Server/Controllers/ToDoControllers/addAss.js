const ToDo = require('../../Models/ToDo');
const Assignment = require('../../Models/Assignment');
const SubmitAssignment = require('../../Models/SubmitAssignment');
const User = require('../../Models/User');
const Class = require('../../Models/Class');
const cron = require('node-cron');

/**
 * Fetch and categorize all assignments for a user across multiple classes in a single batch.
 */
async function fetchBatchClassAssignments(classIds, userId) {
    try {
        const classes = await Class.find({ _id: { $in: classIds } })
            .select('_id addedAssignment')
            .lean();

        if (!classes || classes.length === 0) return [];

        const allAssIds = classes.flatMap(c => (Array.isArray(c.addedAssignment) ? c.addedAssignment : []));
        if (allAssIds.length === 0) {
            return classes.map(c => ({ classId: c._id, assigned: [], missing: [], completed: [] }));
        }

        const [assignments, userSubmissions] = await Promise.all([
            Assignment.find({
                _id: { $in: allAssIds },
                status: { $ne: 'Draft' }
            }).select('_id dueDate status').lean(),
            SubmitAssignment.find({
                student: userId,
                assignment: { $in: allAssIds }
            }).select('_id assignment').lean()
        ]);

        const submittedAssSet = new Set(userSubmissions.map(s => s.assignment ? s.assignment.toString() : ''));
        const assMap = new Map(assignments.map(a => [a._id.toString(), a]));
        const now = Date.now();

        return classes.map(currClass => {
            if (!currClass || !Array.isArray(currClass.addedAssignment)) {
                return { classId: currClass?._id, assigned: [], missing: [], completed: [] };
            }

            const assigned = [];
            const missing = [];
            const completed = [];

            currClass.addedAssignment.forEach((assId) => {
                const aIdStr = assId.toString();
                const currAssignment = assMap.get(aIdStr);
                if (!currAssignment) return; // Not published or not found

                if (submittedAssSet.has(aIdStr)) {
                    completed.push(currAssignment._id);
                } else {
                    if (!currAssignment.dueDate || isNaN(new Date(currAssignment.dueDate).getTime())) {
                        assigned.push(currAssignment._id);
                    } else if (new Date(currAssignment.dueDate).getTime() >= now) {
                        assigned.push(currAssignment._id);
                    } else {
                        missing.push(currAssignment._id);
                    }
                }
            });

            return {
                classId: currClass._id,
                assigned,
                missing,
                completed
            };
        });
    } catch (err) {
        console.error("Error in fetchBatchClassAssignments:", err);
        return [];
    }
}

/**
 * Controller to fetch/update To-Do list for the authenticated student.
 */
async function updateToDo(req, res, next) {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User identification missing"
            });
        }

        const [user, enrolledClasses] = await Promise.all([
            User.findById(userId).populate('todo'),
            Class.find({ student: userId }).select('_id').lean()
        ]);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const claId = req.params?.classId || req.query?.classId || req.body?.classId || 'all';

        // Collect all classes the student is enrolled in
        const joinedClasses = user.joinedClassAsStudent ? user.joinedClassAsStudent.map(c => c.toString()) : [];
        enrolledClasses.forEach(c => {
            const cId = c._id.toString();
            if (!joinedClasses.includes(cId)) {
                joinedClasses.push(cId);
            }
        });

        if (!joinedClasses || joinedClasses.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No enrolled classes found",
                data: { byClass: [] }
            });
        }

        const classIds = (claId && claId !== 'all') ? [claId] : joinedClasses;

        // Batch fetch and process all classes in a single DB query
        const assignmentsByClass = await fetchBatchClassAssignments(classIds, userId);

        let toDo = await ToDo.findById(user.todo);
        if (!toDo) {
            toDo = new ToDo({
                user: userId,
                byClass: assignmentsByClass,
            });
        } else {
            if (!claId || claId === 'all') {
                toDo.byClass = assignmentsByClass;
            } else {
                assignmentsByClass.forEach(newClassData => {
                    const existingIndex = toDo.byClass.findIndex(c => c.classId && c.classId.toString() === newClassData.classId.toString());
                    if (existingIndex !== -1) {
                        toDo.byClass[existingIndex] = newClassData;
                    } else {
                        toDo.byClass.push(newClassData);
                    }
                });
            }
        }

        await toDo.save();
        if (!user.todo || user.todo.toString() !== toDo._id.toString()) {
            user.todo = toDo._id;
            await user.save();
        }

        const populatedToDo = await ToDo.findById(toDo._id)
            .populate('byClass.classId', 'name className subject classTheme')
            .populate({
                path: 'byClass.assigned',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'teacher', select: 'firstName lastName image email' },
                    { 
                        path: 'submission', 
                        match: { student: userId },
                        select: '_id student submitDate data file status marks maxMarks feedback reviewedAt reviewedBy',
                        populate: { path: "reviewedBy", select: "firstName lastName image email" }
                    }
                ]
            })
            .populate({
                path: 'byClass.missing',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'teacher', select: 'firstName lastName image email' },
                    { 
                        path: 'submission', 
                        match: { student: userId },
                        select: '_id student submitDate data file status marks maxMarks feedback reviewedAt reviewedBy',
                        populate: { path: "reviewedBy", select: "firstName lastName image email" }
                    }
                ]
            })
            .populate({
                path: 'byClass.completed',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'teacher', select: 'firstName lastName image email' },
                    { 
                        path: 'submission', 
                        match: { student: userId },
                        select: '_id student submitDate data file status marks maxMarks feedback reviewedAt reviewedBy',
                        populate: { path: "reviewedBy", select: "firstName lastName image email" }
                    }
                ]
            })
            .lean()
            .exec();

        // If specific classId requested, filter the response byClass array
        let responseData = populatedToDo;
        if (claId && claId !== 'all' && populatedToDo && populatedToDo.byClass) {
            const filteredByClass = populatedToDo.byClass.filter(
                c => c.classId && (c.classId._id?.toString() === claId.toString() || c.classId.toString() === claId.toString())
            );
            responseData = {
                ...populatedToDo,
                byClass: filteredByClass
            };
        }

        return res.status(200).json({
            success: true,
            message: "ToDo list updated successfully",
            data: responseData
        });
    } catch (err) {
        console.error("Error in updateToDo:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error updating To-Do list",
            error: err.message
        });
    }
}

// Nightly cron job to refresh ToDos for all users in chunks of 10
cron.schedule('0 0 * * *', async () => {
    try {
        const users = await User.find({}).select('_id email').lean();
        const chunkSize = 10;
        for (let i = 0; i < users.length; i += chunkSize) {
            const chunk = users.slice(i, i + chunkSize);
            await Promise.all(chunk.map(async (user) => {
                const req = {
                    user: { id: user._id, email: user.email },
                    params: { classId: 'all' },
                    query: {},
                    body: {}
                };
                const res = {
                    status: () => ({ json: () => { } })
                };
                await updateToDo(req, res, (err) => {
                    if (err) console.error("Cron updateToDo error for user:", user._id, err);
                });
            }));
        }
    } catch (err) {
        console.error("Cron schedule error in ToDo:", err);
    }
});

module.exports = { updateToDo };
