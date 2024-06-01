const Category = require('../../Models/Category');
const Class = require('../../Models/Class');
const Assignment = require('../../Models/Assignment');
const Post = require('../../Models/Post');

exports.deleteCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const category = await Category.findById(id);
        const classId = req.body.classId;

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        //* Remove the category from the class
        await Class.findByIdAndUpdate(classId, {
            $pull: { addedCategory: id }
        });

        // await Class.updateMany(
        //     {
        //         addedCategory : id,
        //     },
        //     {
        //         $pull: { addedCategory: id }
        //     }
        // )

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
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Something went wrong while deleting the category"
        });
    }
};
