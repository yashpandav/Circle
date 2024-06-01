const Category = require('../../Models/Category');

exports.createCategory = async (req , res) => {
    try{
        const name = req.body.name;
        if(!name){
            return res.status(401).json({
                success: false,
                message: "Name and ClassId are required"
            })
        }

        const findCategory = await Category.findOneAndUpdate({name} , {
            name : name
        } , {
            new : true
        });

        if(!findCategory){
            return res.status(401).json({
                success: false,
                message: "Category Doesn't exists"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Category Edited successfully",
            findCategory
        })

    }catch(err){
        console.log(err);
        return res.status(401).json({
            success : false,
            message : err.message,
            data : "Error while creating Category"
        })
    }
}