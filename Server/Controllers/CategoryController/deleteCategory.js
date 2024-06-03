const Category = require('../../Models/Category');
const Class = require('../../Models/Class');
const Assignment = require('../../Models/Assignment');
const Post = require('../../Models/Post');

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { classId } = req.body;

        if (!id || !classId) {
            return res.status(400).json({
                success: false,
                message: "Category ID and Class ID are required"
            });
        }

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        const findClass = await Class.findById(classId);
        if (!findClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }

        const isAuthorized = findClass.admin.toString() === req.user.id;
        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this category"
            });
        }

        //* Remove the category from the class
        await Class.findByIdAndUpdate(classId, {
            $pull: { addedCategory: id }
        });

        //* Remove the category from assignments
        await Assignment.updateMany(
            { category: id },
            { $pull: { category: id } }
        );

        //* Remove the category from posts
        await Post.updateMany(
            { category: id },
            { $pull: { category: id } }
        );

        //* Delete the category
        await Category.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while deleting the category"
        });
    }
};