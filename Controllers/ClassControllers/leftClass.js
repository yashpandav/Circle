const Class = require('../../Models/Class');
const User = require('../../Models/User')

exports.leftClass = async (req , res) => {
    try{
        const userId = req.user.id;
        const {classId} = req.body;

        const classDetails = await Class.findById(classId);
        if(!classDetails){
            return res.status(401).json({
                success: false,
                message: "Class not found"
            })
        }

        const userDetails = await User.findById(userId);
        if(!userDetails){
            return res.status(401).json({
                success: false,
                message: "User not found"
            })
        }
        if(userDetails.createdClasses.includes(classId)){
            return res.status(403).json({
                success: false,
                message: "Admin Can not unEnroll"
            });
        }

        if(userDetails.joinedClassAsAteacher.includes(classId)){
            userDetails.joinedClassAsAteacher.pull(classId);
            classDetails.teacher.pull(userDetails.id);
        }
        else if(userDetails.joinedClassAsStudent.includes(classId)){
            userDetails.joinedClassAsStudent.pull(classId);
            classDetails.student.pull(userDetails.id);
        }
        userDetails.save();
        classDetails.save();

        return res.status(200).json({
            success: true,
            message: "Class left successfully",
            classDetails,
            userDetails,
        })
    }catch(err){
        console.log(err);
        return res.status(401).json({
            success: false,
            message: err.message,
            data: "Error while lefting class"
        })
    }
}