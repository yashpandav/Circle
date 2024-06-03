const Comment = require('../../Models/Comment');

exports.editComment = async (req, res) => {
    try {
        const commentId = req.params.id;

        if (!commentId) {
            return res.status(400).json({
                success: false,
                message: "Comment Id is required"
            });
        }

        const { name, commentBody } = req.body;

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

        findComment.name = name || findComment.name;
        findComment.commentBody = commentBody || findComment.commentBody;

        await findComment.save();

        return res.status(200).json({
            success: true,
            message: "Comment edited",
            data : findComment
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while editing the comment",
            error: err.message
        });
    }
};
