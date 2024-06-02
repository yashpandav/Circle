const Category = require('../../../Models/Category');
const Post = require('../../../Models/Post');
const Class = require('../../../Models/Class'); 

exports.deletePostFromCategory = async (req, res) => {
    try {
        const postId = req.params.postId;
        const { categoryId, classId } = req.body;

        if (!categoryId || !postId || !classId) {
            return res.status(400).json({
                success: false,
                message: "Category ID, postId, classId are required"
            });
        }

        const findClass = await Class.findById(classId);
        if (!findClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }

        const findPost = await Post.findById(postId);
        if (!findPost) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        const isAuthorized = findClass.admin.toString() === req.user.id || findPost.teacher.toString() === req.user.id;
        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this post from the category"
            });
        }

        const findCategory = await Category.findById(categoryId);
        if (!findCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        //* Remove post from category
        await Category.findByIdAndUpdate(categoryId, {
            $pull: { post: postId }
        });

        //* Remove category from post
        await Post.findByIdAndUpdate(postId, {
            $pull: { category: categoryId }
        });

        return res.status(200).json({
            success: true,
            message: "Post deleted from category successfully"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Error while deleting post from category",
            error: err.message
        });
    }
};