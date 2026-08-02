const Category = require('../../../Models/Category');
const Assignment = require('../../../Models/Assignment');
const Class = require('../../../Models/Class');

exports.addAssIntoCategory = async (req, res, next) => {
    try {
        const { name, assId, classId } = req.body;

        if (!name || !assId || !classId) {
            return res.status(400).json({
                success: false,
                message: "Name, assId, and classId are required"
            });
        }

        let findAss = await Assignment.findById(assId);
        if (!findAss) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found"
            });
        }
        
        const findClass = await Class.findById(classId);
        if (!findClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }

        const isAuthorized = findAss.teacher.toString() === req.user.id || 
                             (findClass.admin && findClass.admin.toString() === req.user.id) ||
                             findClass.teacher.some(t => t.toString() === req.user.id);
        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to add this assignment to the category"
            });
        }

        let findCategory = await Category.findOne({ name, classId });
        if (!findCategory) {
            return res.status(404).json({
                success: false,
                message: "Category does not exist"
            });
        }

        if (findCategory.assignment.some(id => id.toString() === assId.toString())) {
            return res.status(400).json({
                success: false,
                message: "Assignment already exists in the category"
            });
        }

        if (findAss.category && findAss.category.toString() !== findCategory._id.toString()) {
            await Category.findByIdAndUpdate(findAss.category, {
                $pull: { assignment: assId }
            });
        }

        findCategory.assignment.push(assId);
        findAss.category = findCategory.id;

        await findCategory.save();
        await findAss.save();

        return res.status(200).json({
            success: true,
            message: "Assignment added to category successfully",
            data: {
                category: findCategory,
                assignment: findAss
            }
        });

    } catch (err) {
        next(err);
    }
};