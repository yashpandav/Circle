const Category = require('../../Models/Category');
const Assignment = require('../../Models/Assignment');
const Post = require('../../Models/Post');

exports.getDetails = async (req, res) => {
    try {
        const categoryId = req.params.id;

        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: "Category Id is required"
            });
        }

        const category = await Category.findById(categoryId)
            ?.populate("assignments")
            .populate("posts");

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: category
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while getting details"
        });
    }
};