const ToDo = require('../../Models/ToDo');
const Assignment = require('../../Models/Assignment');
const User = require('../../Models/User');
const Class = require('../../Models/Class');
const cron = require('cron');
const SubmitAssignment = require('../../Models/SubmitAssignment');

async function updateToDo (req , res) {
    try {
        const userId = req.user.id;
        const joinedClasses = req.joinedClassAsStudent;

        if (!joinedClasses || joinedClasses.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No classes joined by the student"
            });
        }

        const user = await User.findById(userId).populate('todo');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        let assigned = [];
        let missing = [];
        let completed = [];

        console.log(joinedClasses);

        await Promise.all(joinedClasses
            .map((
                async (classId) => {
                    const currClass = await Class.findById(classId).populate("addedAssignment").exec();

                    if(currClass && currClass.addedAssignment){

                        await Promise.all(currClass.addedAssignment.map(
                            async (assignment) => {
                                const currAssignment = await Assignment.findById(assignment.id).populate("submission");

                                const submission = currAssignment.submission.find(sub => sub.student.equals(userId))

                                if(!submission && new Date(currAssignment.dueDate) > new Date()){
                                    assigned.push(currAssignment.id);   
                                }
                                else if(!submission && new Date(currAssignment.dueDate) < new Date()){
                                    missing.push(currAssignment.id);
                                }
                                else if(submission){
                                    completed.push(currAssignment.id);
                                }
                            }
                        ))
                    }
                }
            ))
        );

        let toDo = await ToDo.findById(user.todo);
        if(!toDo){
            toDo = new ToDo({
                assigned,
                missing,
                completed,
            });
        }else {
            toDo.assigned = assigned;
            toDo.missing = missing;
            toDo.completed = completed;
        }

        await toDo.save();

        return res.status(200).json({
            success: true,
            message: "ToDo list updated successfully",
            toDo
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while updating the todo"
        });
    }
}

cron.schedule('0 0 * * *', updateToDo);

module.exports = { updateToDo };