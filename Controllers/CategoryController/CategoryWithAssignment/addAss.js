const Category = require('../../../Models/Category');
const Assignment = require('../../../Models/Assignment');

exports.addAssIntoCategory = async (req , res) => {
    try{
        const name = req.body.name;
        const assId = req.body.assId;

        if(!name || !assId){
            return res.status(401).json({
                success: false,
                message: "Name and assId are required"
            })
        }

        const findAss = await Assignment.findById(assId);
        if(!findAss){
            return res.status(401).json({
                success: false,
                message: "Assignment not found"
            })
        }

        const findCategory = await Category.findOne({name});
        if(!findCategory){
            return res.status(401).json({
                success: false,
                message: "Category Not exists"
            })
        }
s
        if(findCategory.assignment.includes(assId)){
            return res.status(401).json({
                success: false,
                message: "Assignment already exists into category"
            });
        }
        findCategory.assignment.push(assId);
        findAss.category = findCategory.id;
        findCategory.save();
        findAss.save();

        return res.status(200).json({
            success: true,
            message: "Assignment Added Into Category successfully",
            findCategory,
            findAss
        })

    }catch(err){
        console.log(err);
        return res.status(401).json({
            success : false,
            message : err.message,
            data : "Error while adding assignment into Category"
        })
    }
}