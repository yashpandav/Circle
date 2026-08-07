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

        // 4. Authorization check: Teacher who created or Class Admin can delete
        const isOwner = assignment.teacher && assignment.teacher.toString() === userId.toString();
        const isClassAdmin = currClass && currClass.admin && currClass.admin.toString() === userId.toString();

        if (!isOwner && !isClassAdmin) {
            return res.status(403).json({
                success: false,
                message: "Only the teacher who uploaded this assignment or the class admin is authorized to delete it",
            });
        }

        // 5. Gather and delete Cloudinary files (assignment files + submission files)
        const submissions = await SubmitAssignment.find({
            $or: [
                { assignment: assId },
                { _id: { $in: assignment.submission || [] } }
            ]
        });

        const filesToDelete = [];
        if (assignment.file) filesToDelete.push(assignment.file);
        if (Array.isArray(assignment.files)) {
            assignment.files.forEach(f => {
                if (f?.fileUrl) filesToDelete.push(f.fileUrl);
            });
        }
        submissions.forEach(sub => {
            if (sub.file) filesToDelete.push(sub.file);
            if (Array.isArray(sub.files)) {
                sub.files.forEach(sf => {
                    if (sf?.fileUrl) filesToDelete.push(sf.fileUrl);
                });
            }
        });

        if (filesToDelete.length > 0) {
            await deleteFromCloudinary(filesToDelete);
        }

        // 6. Concurrently clean up Class, Categories, Submissions, Comments, Review, and ToDo references
        const Review = require('../../Models/review');
        const ToDo = require('../../Models/ToDo');

        await Promise.all([
            currClass ? Class.findByIdAndUpdate(currClass._id, { $pull: { addedAssignment: assId } }) : Promise.resolve(),
            Category.updateMany({ assignment: assId }, { $pull: { assignment: assId } }),
            SubmitAssignment.deleteMany({
                $or: [
                    { assignment: assId },
                    { _id: { $in: assignment.submission || [] } }
                ]
            }),
            Comment.deleteMany({
                $or: [
                    { _id: { $in: assignment.comment || [] } },
                    { commentOn: "Assignment", id: assId }
                ]
            }),
            Review.updateMany(
                {},
                { 
                    $pull: { 
                        "byClass.$[].reviewdAss": assId,
                        "byClass.$[].notReviedAss": assId
                    } 
                }
            ).catch(err => console.error("Non-fatal Review cleanup error:", err)),
            ToDo.updateMany(
                {},
                {
                    $pull: {
                        "byClass.$[].assigned": assId,
                        "byClass.$[].missing": assId,
                        "byClass.$[].completed": assId
                    }
                }
            ).catch(err => console.error("Non-fatal ToDo cleanup error:", err))
        ]);

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
