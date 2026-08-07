const mongoose = require("mongoose");
const Post = require("../../Models/Post");
const User = require("../../Models/User");
const Class = require("../../Models/Class");
const Category = require("../../Models/Category");
const Comment = require("../../Models/Comment");
const { getIO } = require("../../socket");
const { deleteFromCloudinary } = require("../../Utils/cloudinaryDelete");

exports.deletePost = async (req, res, next) => {
    try {
        const postId = req.params.id;

        // 1. Validate Post ID format
        if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                success: false,
                message: "Valid Post ID is required",
            });
        }

        // 2. Find the post first
        const findPost = await Post.findById(postId);
        if (!findPost) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        // 3. Find the associated class
        const findClass = await Class.findOne({ addedPost: postId });

        // 4. Authorization check: Author, Class Admin, or Class Teacher
        const isOwner = findPost.teacher && findPost.teacher.toString() === req.user.id;
        const isClassAdmin = findClass?.admin && findClass.admin.toString() === req.user.id;
        const isClassTeacher = findClass?.teacher && findClass.teacher.some(t => t.toString() === req.user.id);

        if (!isOwner && !isClassAdmin && !isClassTeacher) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this post",
            });
        }

        // 5. Clean up associated Cloudinary files
        if (Array.isArray(findPost.postFiles) && findPost.postFiles.length > 0) {
            const urls = findPost.postFiles.map(pf => pf?.fileUrl).filter(Boolean);
            if (urls.length > 0) {
                await deleteFromCloudinary(urls);
            }
        }

        // 6. Concurrently clean up Class, Categories, and Comments
        await Promise.all([
            findClass ? Class.findByIdAndUpdate(findClass._id, { $pull: { addedPost: postId } }) : Promise.resolve(),
            Category.updateMany(
                { post: postId },
                { $pull: { post: postId } }
            ),
            Comment.deleteMany({
                $or: [
                    { _id: { $in: findPost.comment || [] } },
                    { commentOn: "Post", id: postId }
                ]
            })
        ]);

        // 9. Delete the post document
        const deletedPost = await Post.findByIdAndDelete(postId);

        // 10. Broadcast deletion event to circle members via Socket.IO
        if (findClass) {
            getIO().to(`room:${findClass._id.toString()}`).emit('post:deleted', { postId });
        }

        return res.status(200).json({
            success: true,
            message: "Post deleted successfully",
            data: deletedPost,
        });
    } catch (err) {
        next(err);
    }
};