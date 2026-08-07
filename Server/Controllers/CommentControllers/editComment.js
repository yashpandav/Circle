const Comment = require('../../Models/Comment');
const Post = require('../../Models/Post');
const Assignment = require('../../Models/Assignment');
const Class = require('../../Models/Class');
const { getIO } = require('../../socket');

exports.editComment = async (req, res, next) => {
    try {
        const commentId = req.params.id;

        if (!commentId) {
            return res.status(400).json({
                success: false,
                message: "Comment Id is required"
            });
        }

        const { commentBody } = req.body;

        let findComment = await Comment.findById(commentId);

        if (!findComment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        const isAuthorized = findComment.user.toString() === req.user.id;
        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to edit this comment"
            });
        }

        if (commentBody === undefined || typeof commentBody !== 'string' || commentBody.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "Comment body cannot be empty"
            });
        }

        findComment.commentBody = commentBody.trim();
        await findComment.save();

        const { id, commentOn } = req.body;
        if (id && commentOn) {
            const classForComment = await Class.findOne({ $or: [{ addedPost: id }, { addedAssignment: id }] });
            if (classForComment) {
                getIO().to(`room:${classForComment._id.toString()}`).emit('comment:updated', { data: findComment, parentId: id, commentOn });
            }
        }

        return res.status(200).json({
            success: true,
            message: "Comment edited",
            data: findComment
        });

    } catch (err) {
        next(err);
    }
};
