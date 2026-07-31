const Comment = require('../../Models/Comment');
const Post = require('../../Models/Post');
const Assignment = require('../../Models/Assignment');
const Class = require('../../Models/Class');
const { getIO } = require('../../socket');

exports.createComment = async (req, res, next) => {
    try {
        const {
            commentBody,
            commentOn,
            id
        } = req?.body;

        if (!commentBody) {
            return res.status(400).json({
                success: false,
                message: "commentBody is required",
            });
        }

        const tempModel = {
            Post: Post,
            Assignment: Assignment
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

        const createdComment = await Comment.create({
            commentBody,
            user: req.user.id
        });

        commentOnWhich.comment.push(createdComment.id);
        await commentOnWhich.save();

        const populatedComment = await Comment.findById(createdComment.id).populate('user', 'firstName lastName image');

        const classForComment = await Class.findOne({ $or: [{ addedPost: id }, { addedAssignment: id }] });
        if (classForComment) {
            getIO().to(`room:${classForComment._id.toString()}`).emit('comment:new', { data: populatedComment, parentId: id, commentOn });
        }

        return res.status(201).json({
            success: true,
            message: "Comment added",
            data: populatedComment
        });

    } catch (err) {
        next(err);
    }
};