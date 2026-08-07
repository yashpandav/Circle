const Category = require('../../Models/Category');
const Class = require('../../Models/Class');
const Assignment = require('../../Models/Assignment');
const Post = require('../../Models/Post');
const { getIO } = require('../../socket');

exports.deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { classId } = req.body;

        if (!id || !classId) {
            return res.status(400).json({
                success: false,
                message: "Category ID and Class ID are required"
            });
        }

        const [category, findClass] = await Promise.all([
            Category.findById(id),
            Class.findById(classId)
        ]);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        if (!findClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }

        const isAuthorized = (findClass.admin && findClass.admin.toString() === req.user.id) || findClass.teacher.some(t => t.toString() === req.user.id);
        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this category"
            });
        }

        //* Concurrently unlink category from class, assignments, and posts
        await Promise.all([
            Class.findByIdAndUpdate(classId, {
                $pull: { addedCategory: id }
            }),
            Assignment.updateMany(
                { category: id },
                { $set: { category: null } }
            ),
            Post.updateMany(
                { category: id },
                { $set: { category: null } }
            ),
            Category.findByIdAndDelete(id)
        ]);

        getIO().to(`room:${classId}`).emit('category:deleted', { categoryId: id, classId });

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });
    } catch (err) {
        next(err);
    }
};