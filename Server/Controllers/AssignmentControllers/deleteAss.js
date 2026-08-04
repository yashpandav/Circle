const mongoose = require('mongoose');
const Assignment = require('../../Models/Assignment');
const User = require('../../Models/User');
const Class = require('../../Models/Class');
const Category = require('../../Models/Category');
const Comment = require('../../Models/Comment');
const SubmitAssignment = require('../../Models/SubmitAssignment');
const { getIO } = require('../../socket');
const { deleteFromCloudinary } = require('../../Utils/cloudinaryDelete');

exports.deleteAss = async (req, res, next) => {
    try {
        const assId = req.params.id;

        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User identification missing"
            });
        }

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
        const isOwner = assignment.teacher && assignment.teacher.toString() === userId.toString();
        const isClassAdmin = currClass?.admin && currClass.admin.toString() === userId.toString();
        const isClassTeacher = currClass?.teacher && currClass.teacher.some(t => t.toString() === userId.toString());

        if (!isOwner && !isClassAdmin && !isClassTeacher) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this assignment",
            });
        }

        // 5. Gather and delete Cloudinary files (assignment file + submission files)
        const submissions = await SubmitAssignment.find({
            $or: [
                { assignment: assId },
                { _id: { $in: assignment.submission || [] } }
            ]
        });

        const filesToDelete = [];
        if (assignment.file) filesToDelete.push(assignment.file);
        submissions.forEach(sub => {
            if (sub.file) filesToDelete.push(sub.file);
        });

        if (filesToDelete.length > 0) {
            await deleteFromCloudinary(filesToDelete);
        }

        // 6. Remove the assignment from the class
        if (currClass) {
            await Class.findByIdAndUpdate(currClass._id, {
                $pull: { addedAssignment: assId },
            });
        }

        // 7. Remove assignment from any categories
        await Category.updateMany(
            { assignment: assId },
            { $pull: { assignment: assId } }
        );

        // 8. Batch delete all associated submissions
        await SubmitAssignment.deleteMany({
            $or: [
                { assignment: assId },
                { _id: { $in: assignment.submission || [] } }
            ]
        });

        // 9. Batch delete all associated comments
        await Comment.deleteMany({
            $or: [
                { _id: { $in: assignment.comment || [] } },
                { commentOn: "Assignment", id: assId }
            ]
        });

        // 10. Clean up references in Review and ToDo models
        try {
            const Review = require('../../Models/review');
            const ToDo = require('../../Models/ToDo');
            await Review.updateMany(
                {},
                { 
                    $pull: { 
                        "byClass.$[].reviewdAss": assId,
                        "byClass.$[].notReviedAss": assId
                    } 
                }
            );
            await ToDo.updateMany(
                {},
                {
                    $pull: {
                        "byClass.$[].assigned": assId,
                        "byClass.$[].missing": assId,
                        "byClass.$[].completed": assId
                    }
                }
            );
        } catch (cleanupErr) {
            console.error("Non-fatal error cleaning up review/todo refs:", cleanupErr);
        }

        // 11. Delete the assignment document
        const deletedAssignment = await Assignment.findByIdAndDelete(assId);

        // 12. Broadcast deletion event via Socket.IO
        if (currClass) {
            getIO().to(`room:${currClass._id.toString()}`).emit('assignment:deleted', { assignmentId: assId });
            getIO().to(`room:${currClass._id.toString()}`).emit('todo:updated', { classId: currClass._id.toString(), assignmentId: assId });
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
