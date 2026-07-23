const Post = require('../../Models/Post');

exports.getPostDetails = async (req, res) => {
    try {
        const postId = req.params.id;

        if (!postId) {
            return res.status(400).json({
                success: false,
                message: "Post ID is required",
            });
        }

        const currPost = await Post.findById(postId)
            ?.populate("teacher")
            .populate("category")
            .populate("comment");

        if (!currPost) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        const parentClass = await require('../../Models/Class').findOne({ addedPost: postId });
        if (!parentClass) {
            return res.status(404).json({
                success: false,
                message: "Parent class not found",
            });
        }

        const isAuthorized = parentClass.admin.toString() === req.user.id || 
                             parentClass.teacher.includes(req.user.id) || 
                             parentClass.student.includes(req.user.id);
        
        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this post",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Post found",
            data: currPost,
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Error while getting details of post",
        });
    }
};
