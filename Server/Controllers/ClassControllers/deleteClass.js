const mongoose = require('mongoose');
const Class = require('../../Models/Class');
const User = require('../../Models/User');
const Assignment = require('../../Models/Assignment');
const Post = require('../../Models/Post');
const Category = require('../../Models/Category');
const Comment = require('../../Models/Comment');
const SubmitAssignment = require('../../Models/SubmitAssignment');
const Review = require('../../Models/review');
const ToDo = require('../../Models/ToDo');
const { getIO } = require('../../socket');
const { deleteFromCloudinary } = require('../../Utils/cloudinaryDelete');

exports.deleteClass = async (req, res, next) => {
    try {
        const classId = req.params.id;

        if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
            return res.status(400).json({
                success: false,
                message: "Valid Class ID is required"
            });
        }

        const currClass = await Class.findById(classId);

        if (!currClass) {
            return res.status(404).json({
                success: false,
                message: "Class Not Found"
            });
        }

        // Authorize Admin
        const userId = req.user?.id || req.user?._id;
        if (!currClass.admin || currClass.admin.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this class"
            });
        }

        // 1. Collect all child IDs
        const assignmentIds = currClass.addedAssignment || [];
        const postIds = currClass.addedPost || [];
        const categoryIds = currClass.addedCategory || [];

        // 2. Fetch all child documents to gather Cloudinary files and nested comments/submissions
        const [assignments, posts, submissions] = await Promise.all([
            Assignment.find({ _id: { $in: assignmentIds } }),
            Post.find({ _id: { $in: postIds } }),
            SubmitAssignment.find({ assignment: { $in: assignmentIds } })
        ]);

        const cloudinaryUrlsToDelete = [];

        // (a) Class banner thumbnail (if custom uploaded)
        if (currClass.thumbnail) {
            cloudinaryUrlsToDelete.push(currClass.thumbnail);
        }

        // (b) Assignment attachments
        for (const ass of assignments) {
            if (ass.file) {
                cloudinaryUrlsToDelete.push(ass.file);
            }
        }

        // (c) Submission attachments
        for (const sub of submissions) {
            if (sub.file) {
                cloudinaryUrlsToDelete.push(sub.file);
            }
        }

        // (d) Post attachments
        for (const post of posts) {
            if (Array.isArray(post.postFiles)) {
                for (const pf of post.postFiles) {
                    if (pf?.fileUrl) {
                        cloudinaryUrlsToDelete.push(pf.fileUrl);
                    }
                }
            }
        }

        // 3. Clean up Cloudinary assets
        if (cloudinaryUrlsToDelete.length > 0) {
            await deleteFromCloudinary(cloudinaryUrlsToDelete);
        }

        // 4. Remove class references from all Users
        await User.updateMany(
            {
                $or: [
                    { joinedClassAsStudent: classId },
                    { joinedClassAsAteacher: classId },
                    { createdClasses: classId }
                ]
            },
            {
                $pull: {
                    joinedClassAsStudent: classId,
                    joinedClassAsAteacher: classId,
                    createdClasses: classId
                }
            }
        );

        // 5. Clean up ToDo and Review models
        try {
            await Promise.all([
                Review.updateMany(
                    {},
                    { $pull: { byClass: { classId: classId } } }
                ),
                ToDo.updateMany(
                    {},
                    { $pull: { byClass: { classId: classId } } }
                )
            ]);
        } catch (cleanupErr) {
            console.error("Non-fatal error cleaning up review/todo records:", cleanupErr);
        }

        // 6. Delete all Submissions, Comments, Assignments, Posts, and Categories
        const allCommentObjectIds = [];
        assignments.forEach(a => {
            if (Array.isArray(a.comment)) allCommentObjectIds.push(...a.comment);
        });
        posts.forEach(p => {
            if (Array.isArray(p.comment)) allCommentObjectIds.push(...p.comment);
        });

        await Promise.all([
            SubmitAssignment.deleteMany({ assignment: { $in: assignmentIds } }),
            Comment.deleteMany({
                $or: [
                    { _id: { $in: allCommentObjectIds } },
                    { id: { $in: [...assignmentIds, ...postIds] } }
                ]
            }),
            Assignment.deleteMany({ _id: { $in: assignmentIds } }),
            Post.deleteMany({ _id: { $in: postIds } }),
            Category.deleteMany({ _id: { $in: categoryIds } })
        ]);

        // 7. Delete the Class itself
        const deletedClass = await Class.findByIdAndDelete(classId);

        // 8. Broadcast deletion event via Socket.IO to room AND globally
        try {
            const io = getIO();
            const payload = { classId: classId.toString() };
            io.to(`room:${classId}`).emit('class:deleted', payload);
            io.emit('class:deleted', payload);
        } catch (socketErr) {
            console.error("Socket emit failed on class deletion:", socketErr);
        }

        return res.status(200).json({
            success: true,
            message: "Class and all associated data deleted successfully",
            response: deletedClass
        });
    } catch (err) {
        next(err);
    }
};