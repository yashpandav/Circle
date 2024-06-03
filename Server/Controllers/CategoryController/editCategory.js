const Category = require('../../Models/Category');
const Class = require('../../Models/Class');

exports.editCategory = async (req, res) => {
    try {
        const { name, classId, categoryId } = req.body;

        if (!name || !classId || !categoryId) {
            return res.status(400).json({
                success: false,
                message: "Name, ClassId, and CategoryId are required"
            });
        }

        const findClass = await Class.findById(classId);
        if (!findClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }

        const isAuthorized = findClass.teacher.includes(req.user.id) || findClass.admin.toString() === req.user.id;
        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to edit this category"
            });
        }

        const findCategory = await Category.findByIdAndUpdate(categoryId, 
            { name }, 
            { new: true });
            
        if (!findCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Category edited successfully",
            data: findCategory
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Error while editing category",
            error: err.message
        });
    }
};
