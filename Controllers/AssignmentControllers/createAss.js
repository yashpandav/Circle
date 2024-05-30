const Assignment = require('../../Models/Assignment');
const {uploadImage} = require('../../Utils/imageUpload');
const User = require('../../Models/User');
const Class = require('../../Models/Class');
require('dotenv').config();

exports.createAss = async (req , res) => {
    try{
        const {
            currClassId,
            name,
            description,
            category,
            // uploadDate,
            dueDate,
            status,
            acceptAfterDue
        } = req.body;

        if(dueDate < Date.now()) {
            return res.status(401).json({
                success : false,
                message : "Due Date should be greater than current date"
            })
        }

        let file = req.files?.file;

        if(!currClassId || !name || !file || !description){
            return res.status(401).json({
                success : false,
                message : "All Fields are Required"
            })
        }

        const fileUrl = await uploadImage(file , process.env.FOLDER_NAME);
        file = fileUrl.secure_url;

        const teacher = req.user.id;
        console.log("TEACHER => " , teacher);
        const newAss = new Assignment({
            name,
            description,
            file,
            category : category || null,
            teacher,
            dueDate,
            status,
            acceptAfterDue
        })
        await newAss.save();

        if(newAss.status === 'Published'){
            await Class.findByIdAndUpdate(currClassId , {
                $push : {
                    addedAssignment : newAss.id
                }
            })

            const students = await User.find({ joinedClassAsStudent: currClassId }, 'id');
            console.log("STUDENTS => " , students)
            const studentIds = students.map(student => student.id);
            console.log("STUDENTS ID => " , studentIds)
            await Assignment.findByIdAndUpdate(newAss.id, {
                $push: { pendingStudent: studentIds }
            });

            return res.status(200).json({
                success : true,
                message : "Assignment Created Successfully",
                newAss
            })
        }
        else{
            return res.status(200).json({
                success : true,
                message : "Assignment Drafted Successfully",
                newAss
            })
        }

    }catch(err){
        console.log(err);
        return res.status(400).json({
            success : false,
            message : err.message
        })
    }
}