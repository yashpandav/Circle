const Comment = require('../../Models/Comment');
const Post = require('../../Models/Post');
const Assignment = require('../../Models/Assignment');

exports.deleteComment = async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const { commentOn, id } = req.body;

        if (!commentId || !id || !commentOn) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const tempModel = {
            Post: Post,
            Assignment: Assignment,
        };

        if (!tempModel[commentOn]) {
            return res.status(400).json({
                success: false,
                message: "Invalid commentOn value",
            });
        }

        const commentOnWhich = await tempModel[commentOn].findById(id);
        if (!commentOnWhich) {
            return res.status(404).json({
                success: false,
                message: `${commentOn} not found`,
            });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found",
            });
        }

        if (comment.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to delete this comment",
            });
        }

        await Comment.findByIdAndDelete(commentId);
        commentOnWhich.comment.pull(commentId);
        await commentOnWhich.save();

        return res.status(200).json({
            success: true,
            message: "Comment deleted",
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while deleting the comment",
        });
    }
};
