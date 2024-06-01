const Post = require('../../Models/Post');

exports.getPostDetails = async (req, res) => {
    try {
        const postId = req.params.postId;

        if (!postId) {
            return res.status(400).json({
                success: false,
                message: "Post ID is required",
            });
        }

        const currPost = await Post.findById(postId)
            .populate("teacher")
            .populate("category")
            .populate("comment");

        if (!currPost) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
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
