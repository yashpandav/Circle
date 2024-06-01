const Post = require("../../Models/Post");
const User = require("../../Models/User");
const Class = require("../../Models/Class");
const Category = require("../../Models/Category");

exports.deletePost = async (req, res) => {
    try {
        const postId = req.params.postId;
        const classId = req.body.classId;

        if (!postId || !classId) {
            return res.status(401).json({
                success: false,
                message: "All fields are required",
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

        //* Delete the post
        const response = await Post.findByIdAndDelete(postId);

        return res.status(200).json({
            success: true,
            message: "Post deleted successfully",
            response,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while deleting",
        });
    }
};
