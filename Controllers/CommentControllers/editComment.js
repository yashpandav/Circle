const Comment = require('../../Models/Comment');
const Post = require('../../Models/Post');
const Assignment = require('../../Models/Assignment');

exports.editComment = async (req, res) => {
    try {
        const commentId = req.params.commentId;

        if (!commentId) {
            return res.status(400).json({
                success: false,
                message: "Comment Id is required"
            });
        }

        const { 
            name,
            commentBody,
        } = req.body;

        let findComment = await Comment.findById(commentId);

        if (!findComment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        if (findComment.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to edit this comment"
            });
        }

        findComment.name = name || findComment.name;
        findComment.commentBody = commentBody || findComment.commentBody;

        await findComment.save();

        return res.status(200).json({
            success: true,
            message: "Comment Edited",
            findComment
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while editing the comment",
        });
    }
};
