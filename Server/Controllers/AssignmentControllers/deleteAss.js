const mongoose = require('mongoose');
const Assignment = require('../../Models/Assignment');
const User = require('../../Models/User');
const Class = require('../../Models/Class');
const Category = require('../../Models/Category');
const Comment = require('../../Models/Comment');
const submittedAss = require('../../Models/SubmitAssignment');
const { getIO } = require('../../socket');

exports.deleteAss = async (req, res, next) => {
    try {
        const assId = req.params.id;

        // 1. Validate Assignment ID format
        if (!assId || !mongoose.Types.ObjectId.isValid(assId)) {
            return res.status(400).json({
                success: false,
                message: "Valid Assignment ID is required",
            });
        }

        // 2. Find assignment first
        const assignment = await Assignment.findById(assId);
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found",
            });
        }

        // 3. Find the associated class
        const currClass = await Class.findOne({ addedAssignment: assId });

        // 4. Authorization check: Author, Class Admin, or Class Teacher
        const isOwner = assignment.teacher && assignment.teacher.toString() === req.user.id;
        const isClassAdmin = currClass?.admin && currClass.admin.toString() === req.user.id;
        const isClassTeacher = currClass?.teacher && currClass.teacher.some(t => t.toString() === req.user.id);

        if (!isOwner && !isClassAdmin && !isClassTeacher) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this assignment",
            });
        }

        // 5. Remove the assignment from the class
        if (currClass) {
            await Class.findByIdAndUpdate(currClass._id, {
                $pull: { addedAssignment: assId },
            });
        }

        // 6. Remove assignment from any categories
        await Category.updateMany(
            { assignment: assId },
            { $pull: { assignment: assId } }
        );

        // 7. Batch delete submissions
        if (assignment.submission && assignment.submission.length > 0) {
            await submittedAss.deleteMany({ _id: { $in: assignment.submission } });
        }
        await submittedAss.deleteMany({ assignmentId: assId });

        // 8. Batch delete comments
        if (assignment.comment && assignment.comment.length > 0) {
            await Comment.deleteMany({ _id: { $in: assignment.comment } });
        }
        await Comment.deleteMany({ commentOn: "Assignment", id: assId });

        // 9. Delete the assignment document
        const deletedAssignment = await Assignment.findByIdAndDelete(assId);

        // 10. Broadcast deletion event via Socket.IO
        if (currClass) {
            getIO().to(`room:${currClass._id.toString()}`).emit('assignment:deleted', { assignmentId: assId });
        }

        return res.status(200).json({
            success: true,
            message: "Assignment deleted successfully",
            data: deletedAssignment,
        });
    } catch (err) {
        next(err);
    }
};
