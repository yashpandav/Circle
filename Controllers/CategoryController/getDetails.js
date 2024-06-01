const Category = require('../../Models/Category')
const Assignment = require('../../Models/Assignment')
const Post = require('../../Models/Post')

exports.getDetails = async (req , res) => {
    try{
        const categoryId = req.params.categorId;
        if(!categoryId){
            return res.status(401).json({
                success: false,
                message: "Category Id is required"
            });
        }

        const category = await Category.findById(categoryId)?.populate("assignment").populate("post");

        if(!category){
            return res.status(401).json({
                success: false,
                message: "Category not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: category
        });

    }catch(err){
        console.log(err);
        return res.status(401).json({
            success: false,
            message: "Something went wrong while getting details"
        });
    }
}