const Class = require('../../Models/Class');
const Category = require('../../Models/Category');

exports.createCategory = async (req, res) => {
    try {
        const { name, classId } = req.body;

        if (!name || !classId) {
            return res.status(400).json({
                success: false,
                message: "Name and ClassId are required"
            });
        }

        const findClass = await Class.findById(classId);
        if (!findClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }

        const isAuthorized = findClass.admin.toString() === req.user.id || findClass.teacher.includes(req.user.id);
        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to create a category"
            });
        }

        const findCategory = await Category.findOne({ name });
        if (findCategory) {
            return res.status(409).json({
                success: false,
                message: "Category already exists"
            });
        }

        const newCategory = new Category({ name });
        await newCategory.save();

        findClass.addedCategory.push(newCategory.id);
        await findClass.save();

        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: newCategory
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Error while creating Category",
            error: err.message
        });
    }
};