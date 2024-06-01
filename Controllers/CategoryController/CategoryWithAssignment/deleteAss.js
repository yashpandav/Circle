const Category = require('../../../Models/Category');
const Assignment = require('../../../Models/Assignment');

exports.deleteAssFromCategory = async (req , res) => {
    try{
        const name = req.body.name;
        const assId = req.body.assId;

        if(!name || !assId){
            return res.status(401).json({
                success: false,
                message: "Name and assId are required"
            })
        }

        const findCategory = await Category.findOneAndUpdate({name} , {
            $pull : {
                assignment : assId
            }
        });
        const findAss = await Assignment.findByIdAndUpdate(assId , {
            $pull : {
                category : findCategory.id
            }
        });

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
            data : "Error while deleting assignment from Category"
        })
    }
}