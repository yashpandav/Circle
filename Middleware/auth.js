const JWT = require("jsonwebtoken");
const User = require('../Models/User');
const Class = require('../Models/Class');
require("dotenv").config();

exports.auth = async (req , res , next) => {
    try{
        console.log("entered Auth");
        const token = req.cookies.token || req.header("Authorization").replace("Bearer " , "") || req.body.token;
        console.log(token);
        if(!token){
            return res.status(401).json({
                success : false,
                message: "Could Not Find Token",
            })
        }

        try{
            const verifyToken = JWT.verify(token , process.env.JWT_SECRET)
            console.log(verifyToken);
            // console.log("User In Auth Before addign Token " , req.user)
            // console.log(req.user)
            req.user = verifyToken;
            console.log("User In Auth After addign Token " , req.user)


            //Classes created and joined by this user
            let user = await User.findById(req.user.id);

            let createdClasses = user.createdClasses || [];
            console.log("Creadted Classes by this user => " , createdClasses);
            req.createdClasses = createdClasses

            let joinedClassAsAteacher = user.joinedClassAsAteacher || [];
            console.log("Joined Classes As a Teacher by this user => " , joinedClassAsAteacher);
            req.joinedClassAsAteacher = joinedClassAsAteacher;

            let joinedClassAsStudent = user.joinedClassAsStudent || [];
            console.log("Joined Classes As a Studnet by this user => " , joinedClassAsStudent);
            req.joinedClassAsStudent = joinedClassAsStudent;
            
            next();
        }catch(err){
            return res.status(401).json({
                success : false,
                message : "INVALID TOKEN",
            });
        }
    }catch(err){
        res.status(400).json({
            success : false,
            message: err.message,
            data : "Error during auth"
        })
    }
}

exports.isStudnet = async (req , res , next) => {
    try{
        const studentClass = await Class.findOne({student: req.user.id});
        if(req.joinedClassAsStudent.includes(studentClass.id)){
            console.log("STUDENT: " + req.joinedClassAsStudent)
            next();
        }
        else{
            return res.status(403).json({
                success: false,
                message: "User is not associated with student class",
                data: null
            });
        }
    }catch(err){
        res.status(400).json({
            success : false,
            message: err.message,
            data : "Error during auth of isStudent: "
        })
    }
}

exports.isTeacher = async (req , res , next) => {
    try{
        const teacherClass = await Class.findOne({teacher: req.user.id});
        const adminClass = await Class.findOne({admin: req.user.id});
        if(teacherClass && req.joinedClassAsAteacher.includes(teacherClass.id) || adminClass || req.createdClasses.includes(adminClass?.id)){
            console.log("TEACHER: " + req.joinedClassAsAteacher)
            next();
        }
        else{
            return res.status(403).json({
                success: false,
                message: "User is not associated with Teacher class",
            });
        }
    }catch(err){
        res.status(400).json({
            success : false,
            message: err.message,
            data : "Error during auth of isTeacher"
        })
    }
}

exports.isAdmin = async (req , res , next) => {
    try{
        // console.log("Requested class admin => " , req.createdClasses)
        // console.log("Admin => " , req.user.id)

        const adminClass = await Class.findOne({ admin : req.user.id });
        
        // console.log("Class Id => ",adminClass)
        // console.log("Created Class => ", req.createdClasses);
        // console.log("Admin ID => ", adminClass.id);
        // console.log("Is Include => " , req.createdClasses.includes(adminClass.id))
        if(!adminClass || !req.createdClasses.includes(adminClass.id)){
            return res.status(401).json({
                success : false,
                message : "PROTECTED ROUTE FOR ADMIN"
            })
        }
        console.log("ADMIN")
        next();
    }catch(err){
        res.status(400).json({
            success : false,
            message: err.message,
            data : "Error during auth of isAdmin"
        })
    }
}