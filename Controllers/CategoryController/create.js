const Class = require('../../Models/Class');
const Category = require('../../Models/Category');

exports.createCategory = async (req , res) => {
    try{
        const name = req.body.name;
        const classId = req.body.classId;

        if(!name || !classId){
            return res.status(401).json({
                success: false,
                message: "Name and ClassId are required"
            })
        }

        const findClass = await Class.findById(classId);
        if(!findClass){
            return res.status(401).json({
                success: false,
                message: "Class not found"
            })
        }

        const findCategory = await Category.findOne({name});
        if(findCategory){
            return res.status(401).json({
                success: false,
                message: "Category already exists"
            })
        }

        const newCategory = new Category({
            name,
        })

        await newCategory.save();

        findClass.addedCategory.push(newCategory.id);
        await findClass.save();

        return res.status(200).json({
            success: true,
            message: "Category created successfully",
            data: newCategory
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