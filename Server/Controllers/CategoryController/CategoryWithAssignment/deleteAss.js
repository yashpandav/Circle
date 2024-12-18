const Category = require('../../../Models/Category');
const Assignment = require('../../../Models/Assignment');
const Class = require('../../../Models/Class');

exports.deleteAssFromCategory = async (req, res) => {
    try {
        const assId = req.params.id;
        const { categoryId, classId } = req.body;

        if (!categoryId || !assId || !classId) {
            return res.status(400).json({
                success: false,
                message: "Category ID , assId ,classId are required"
            });
        }

        const findClass = await Class.findById(classId);
        if (!findClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }

        const findAss = await Assignment.findById(assId);
        if (!findAss) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found"
            });
        }

        const isAuthorized = findClass.admin.toString() === req.user.id || findAss.teacher.toString() === req.user.id;
        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this assignment from the category"
            });
        }

        const findCategory = await Category.findById(categoryId);
        if (!findCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }


        //* Remove assignment from category
        await Category.findByIdAndUpdate(categoryId, {
            $pull: { assignment: assId }
        });

        //* Remove category from assignment
        await Assignment.findByIdAndUpdate(assId, {
            $pull: { category: categoryId }
        });

        return res.status(200).json({
            success: true,
            message: "Assignment deleted from category successfully"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Error while deleting assignment from category",
            error: err.message
        });
    }
};
