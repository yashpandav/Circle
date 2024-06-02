const Assignment = require('../../Models/Assignment');
const User = require('../../Models/User');
const Class = require('../../Models/Class');
const Category = require('../../Models/Category');
const Comment = require('../../Models/Comment');
const submittedAss = require('../../Models/SubmitAssignment');

exports.deleteAss = async (req, res) => {
    try {
        const assId = req.params.assId;
        const classId = req.body.classId;

        if (!assId || !classId) {
            return res.status(400).json({
                success: false,
                message: "Assignment ID and Class ID are required",
            });
        }

        //* AUTHORIZING TEACHER || ADMIN
        const currClass = await Class.findById(classId);
        if (!currClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found",
            });
        }

        const assignment = await Assignment.findById(assId);
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found",
            });
        }

        const isAuthorized = currClass.admin.toString() === req.user.id || assignment.teacher.toString() === req.user.id;
        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this assignment",
            });
        }

        //* Remove the assignment from the class
        await Class.findByIdAndUpdate(classId, {
            $pull: { addedAssignment: assId },
        });

        //* Remove the assignment from all categories
        await Category.updateMany({}, {
            $pull: { assignment: assId },
        });

        //* Delete the assignment and its submissions
        if (assignment.submission && assignment.submission.length > 0) {
            await Promise.all(assignment.submission.map(async submittedId => (
                await submittedAss.findByIdAndDelete(submittedId)
            )));
        }

        //* Delete the assignment and its comments
        if (assignment.comment && assignment.comment.length > 0) {
            await Promise.all(assignment.comment.map(async commentId => (
                await Comment.findByIdAndDelete(commentId)
            )));
        }

        //* Finally, delete the assignment
        await Assignment.findByIdAndDelete(assId);

        return res.status(200).json({
            success: true,
            message: "Assignment deleted successfully",
            data: assignment
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while deleting the assignment",
        });
    }
};
