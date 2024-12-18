const ToDo = require('../../Models/ToDo');
const Assignment = require('../../Models/Assignment');
const User = require('../../Models/User');
const Class = require('../../Models/Class');
const cron = require('node-cron');

async function fetchClassAssignments(classId, userId) {
    const currClass = await Class.findById(classId).populate("addedAssignment").exec();
    if (!currClass || !currClass.addedAssignment) return null;

    const assigned = [];
    const missing = [];
    const completed = [];

    await Promise.all(currClass.addedAssignment.map(async (assignment) => {
        const currAssignment = await Assignment.findById(assignment.id).populate("submission").exec();
        if (!currAssignment) return;

        const submission = currAssignment.submission.find(sub => sub.student.equals(userId));

        if (!submission && new Date(currAssignment.dueDate) > new Date()) {
            assigned.push(currAssignment.id);
        } else if (!submission && new Date(currAssignment.dueDate) < new Date()) {
            missing.push(currAssignment.id);
        } else if (submission) {
            completed.push(currAssignment.id);
        }
    }));

    return { classId, assigned, missing, completed };
}

async function updateToDo(req, res) {
    try {
        const userId = req.user.id;

        let user = await User.findById(userId).populate('todo').exec();
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const joinedClasses = user.joinedClassAsStudent;
        const claId = req.params.classId;

        if (!joinedClasses || joinedClasses.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No classes joined by the student"
            });
        }

        const classIds = claId ? [claId] : joinedClasses;

        const allAssignments = await Promise.all(classIds.map(classId => fetchClassAssignments(classId, userId)));
        const assignmentsByClass = allAssignments.filter(Boolean); // Removes null values

        let toDo = await ToDo.findById(user.todo);
        if (!toDo) {
            toDo = new ToDo({
                user: userId,
                byClass: assignmentsByClass,
            });
        } else {
            toDo.byClass = assignmentsByClass;
        }

        await toDo.save();
        user.todo = toDo.id;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "ToDo list updated successfully",
            data : toDo
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while updating the todo"
        });
    }
}

cron.schedule('0 0 * * *', async () => {
    try {
        //* NOTE: SINCE WE MAY NOT HAVE REQ.USER IN MIDNIGHT , NEED TO GET ALL USER
        const users = await User.find({}).exec();
        for (const user of users) {
            const req = {
                user: {
                    id: user.id,
                    email: user.email
                }
            };
            const res = {
                status: (code) => ({
                    json: (data) => console.log(`Status: ${code}, Data: ${JSON.stringify(data)}`)
                })
            };
            await updateToDo(req, res);
        }
    } catch (err) {
        console.error('Error updating ToDo lists in cron job:', err);
    }
});

module.exports = { updateToDo };
