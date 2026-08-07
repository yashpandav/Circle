const Category = require('../../Models/Category');
const Assignment = require('../../Models/Assignment');
const Post = require('../../Models/Post');
const Class = require('../../Models/Class');

exports.getDetails = async (req, res, next) => {
    try {
        const categoryId = req.params.id;

        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: "Category Id is required"
            });
        }

        const category = await Category.findById(categoryId)
            ?.populate("assignment")
            .populate("post")
            .lean();

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        const parentClass = await Class.findById(category.classId)
            .select('_id admin teacher student')
            .lean();
        if (!parentClass) {
            return res.status(404).json({
                success: false,
                message: "Parent class not found"
            });
        }

        const isAuthorized = (parentClass.admin && parentClass.admin.toString() === req.user.id) || 
                             parentClass.teacher?.some(t => t.toString() === req.user.id) || 
                             parentClass.student?.some(s => s.toString() === req.user.id);
        
        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this category"
            });
        }

        return res.status(200).json({
            success: true,
            data: category
        });

    } catch (err) {
        next(err);
    }
};