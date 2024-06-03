const Category = require('../../../Models/Category');
const Post = require('../../../Models/Post');
const Class = require('../../../Models/Class');

exports.addPostIntoCategory = async (req, res) => {
    try {
        const { name, postId, classId } = req.body;

        if (!name || !postId) {
            return res.status(400).json({
                success: false,
                message: "Name and postId are required"
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

        const isAuthorized = findPost.teacher.toString() === req.user.id || findClass.admin.toString() === req.user.id;

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to add a post to the category"
            });
        }

        const findCategory = await Category.findOne({ name });
        if (!findCategory) {
            return res.status(404).json({
                success: false,
                message: "Category does not exist"
            });
        }

        if (findCategory.post.includes(postId)) {
            return res.status(400).json({
                success: false,
                message: "Post already exists in the category"
            });
        }

        findCategory.post.push(postId);
        findPost.category = findCategory.id;

        await findCategory.save();
        await findPost.save();

        return res.status(200).json({
            success: true,
            message: "Post added to the category successfully",
            data: {
                category: findCategory,
                post: findPost
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Error while adding post to category",
            error: err.message
        });
    }
};