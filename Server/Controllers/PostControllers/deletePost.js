const Post = require("../../Models/Post");
const User = require("../../Models/User");
const Class = require("../../Models/Class");
const Category = require("../../Models/Category");
const Comment = require("../../Models/Comment");
const { getIO } = require("../../socket");

exports.deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        if (!postId) {
            return res.status(400).json({
                success: false,
                message: "postId is required",
            });
        }

        const findClass = await Class.findOne({ addedPost: postId });
        if (!findClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found for this post",
            });
        }
        const classId = findClass._id;

        const findPost = await Post.findById(postId);
        if (!findPost) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        const isAuthorized = (findClass.admin && findClass.admin.toString() === req.user.id) || (findPost.teacher && findPost.teacher.toString() === req.user.id);
        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this post",
            });
        }

        //* Remove the post from the class
        await Class.findByIdAndUpdate(classId, {
            $pull: { addedPost: postId },
        });

        //* Remove the post from all categories
        await Category.updateMany({}, {
            $pull: { post: postId },
        });

        //* Delete associated comments
        if (findPost.comment && findPost.comment.length > 0) {
            await Promise.all(findPost.comment.map(async commentId => (
                await Comment.findByIdAndDelete(commentId)
            )));
        }

        //* Delete the post
        const response = await Post.findByIdAndDelete(postId);

        getIO().to(`room:${classId.toString()}`).emit('post:deleted', { postId });

        return res.status(200).json({
            success: true,
            message: "Post deleted successfully",
            data: response,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while deleting the post",
        });
    }
};