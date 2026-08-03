const ToDo = require('../../Models/ToDo');
const Assignment = require('../../Models/Assignment');
const User = require('../../Models/User');
const Class = require('../../Models/Class');
const cron = require('node-cron');

/**
 * Fetch and categorize all assignments for a user in a given class.
 */
async function fetchClassAssignments(classId, userId) {
    try {
        const currClass = await Class.findById(classId).populate({
            path: "addedAssignment",
            populate: [
                { path: "category", select: "name" },
                { path: "teacher", select: "firstName lastName image email" },
                { path: "submission", select: "_id student submitDate data file" }
            ]
        }).exec();

        if (!currClass || !currClass.addedAssignment) return null;

        const assigned = [];
        const missing = [];
        const completed = [];

        currClass.addedAssignment.forEach((currAssignment) => {
            if (!currAssignment || currAssignment.status === 'Draft') return;

            const submission = currAssignment.submission?.find(sub => {
                if (!sub) return false;
                if (sub.student && sub.student._id) return sub.student._id.toString() === userId.toString();
                if (sub.student) return sub.student.toString() === userId.toString();
                return sub.toString() === userId.toString();
            });

            if (submission) {
                completed.push(currAssignment._id);
            } else {
                if (!currAssignment.dueDate || new Date(currAssignment.dueDate).toString() === 'Invalid Date') {
                    assigned.push(currAssignment._id);
                } else if (new Date(currAssignment.dueDate).getTime() >= Date.now()) {
                    assigned.push(currAssignment._id);
                } else {
                    missing.push(currAssignment._id);
                }
            }
        });

        return { classId, assigned, missing, completed };
    } catch (err) {
        console.error(`Error in fetchClassAssignments for class ${classId}:`, err);
        return null;
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

        let user = await User.findById(userId).populate('todo').exec();
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const claId = req.params?.classId || req.query?.classId || req.body?.classId || 'all';

        // Collect all classes the student is enrolled in
        const joinedClasses = user.joinedClassAsStudent ? user.joinedClassAsStudent.map(c => c.toString()) : [];
        const enrolledClasses = await Class.find({ student: userId }).select('_id');
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

        const allAssignments = await Promise.all(classIds.map(classId => fetchClassAssignments(classId, userId)));
        const assignmentsByClass = allAssignments.filter(Boolean);

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
        user.todo = toDo._id;
        await user.save();

        const populatedToDo = await ToDo.findById(toDo._id)
            .populate('byClass.classId', 'name className subject classTheme')
            .populate({
                path: 'byClass.assigned',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'teacher', select: 'firstName lastName image email' },
                    { path: 'submission', select: '_id student submitDate data file' }
                ]
            })
            .populate({
                path: 'byClass.missing',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'teacher', select: 'firstName lastName image email' },
                    { path: 'submission', select: '_id student submitDate data file' }
                ]
            })
            .populate({
                path: 'byClass.completed',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'teacher', select: 'firstName lastName image email' },
                    { path: 'submission', select: '_id student submitDate data file' }
                ]
            })
            .exec();

        // If specific classId requested, filter the response byClass array
        let responseData = populatedToDo;
        if (claId && claId !== 'all' && populatedToDo && populatedToDo.byClass) {
            const filteredByClass = populatedToDo.byClass.filter(
                c => c.classId && c.classId._id.toString() === claId.toString()
            );
            responseData = {
                ...populatedToDo.toObject(),
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

// Nightly cron job to refresh ToDos for all users
cron.schedule('0 0 * * *', async () => {
    try {
        const users = await User.find({}).select('_id email').exec();
        for (const user of users) {
            const req = {
                user: {
                    id: user._id,
                    email: user.email
                },
                params: {
                    classId: 'all'
                },
                query: {},
                body: {}
            };
            const res = {
                status: () => ({ json: () => { } })
            };
            await updateToDo(req, res, (err) => {
                if (err) console.error("Cron updateToDo error for user:", user._id, err);
            });
        }
    } catch (err) {
        console.error("Cron schedule error in ToDo:", err);
    }
});

module.exports = { updateToDo };
