const Assignment = require('../../Models/Assignment');
const User = require('../../Models/User');
const Category = require('../../Models/Category');
const {uploadImage} = require('../../Utils/imageUpload');
require('dotenv').config();

exports.editAss = async (req , res) => {
    try{

        const assId = req.params.assId; 

        const{
            name ,
            description ,
            category ,
            dueDate ,
        } = req.body;

        let file = req?.files?.file;

        if(!assId){
            return res.status(401).json({
                success : false,
                message : "Please Enter Assignment Id"
            })
        }

        let findAss = await Assignment.findById(assId);
        if(!findAss){
            return res.status(401).json({
                success : false,
                message : "Assignment Not Found"
            })
        }

        if(findAss.teacher !== req.user.id){
            return res.status(401).json({
                success : false,
                message : "You are not authorized to edit this assignment"
            })
        }

        if(dueDate < findAss.uploadDate){
            return res.status(401).json({
                success : false,
                message : "Due Date Should be Greater than Upload Date"
            })
        }

        if(category){
            let currCategory = await Category.findOne({ category});
            if(!currCategory){
                return res.status(404).json({
                    success : false,
                    message : "Category Not Found"
                });
            }
            let prevCategory = await Category.findById(findAss.category);
            prevCategory.assignment.pull(assId);
            currCategory.assignment.push(assId);
            prevCategory.save();
            currCategory.save();
            findAss.category = currCategory.id;
        }
        else{
            findAss.category = findAss.category;
        }

        if(file){
            const image = await uploadImage(file , process.env.FOLDER_NAME);
            file = image.secure_url;
        }

        findAss.name = name || findAss.name;
        findAss.description = description || findAss.description;
        findAss.dueDate = dueDate || findAss.dueDate;
        findAss.file = file || findAss.file;
        await findAss.save();

        return res.status(200).json({
            success : true,
            message : "Assignment Edited Successfully",
            findAss
        })

    }catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while editing the assignment"
        });
    }
}