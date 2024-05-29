const Class = require('../../Models/Class');
const Assignment = require('../../Models/Assignment');
const User = require('../../Models/User');
const Post = require('../../Models/Post');

exports.getClass = async(req , res) => {
    try{
        const id = req.params.id;
        if(!id){
            return res.status(401).json({
                success: false,
                message: "Class Id is required"
            });
        }
        const findClass = await Class.findById(id)?.populate("admin").populate("student").populate("teacher").populate("addedAssignment").populate("addedPost").exec();
        if(!findClass){
            return res.status(401).json({
                success: false,
                message: "Class Not Found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Class Found",
            data: findClass
        });

    }catch(err){
        return res.status(401).json({
            success: false,
            message: err.message
        });
    }
} 