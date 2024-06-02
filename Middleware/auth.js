const JWT = require("jsonwebtoken");
const User = require('../Models/User');
const Class = require('../Models/Class');
require("dotenv").config();

exports.auth = async (req, res, next) => {
    try {
        console.log("Entered Auth");
        const token = req.cookies.token || req.header("Authorization").replace("Bearer ", "") || req.body.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Could Not Find Token",
            });
        }

        const verifyToken = JWT.verify(token, process.env.JWT_SECRET);
        console.log(verifyToken);

        req.user = verifyToken;
        console.log("User In Auth After adding Token ", req.user);

        // const user = await User.findById(req.user.id);

        // req.createdClasses = user.createdClasses || [];
        // req.joinedClassAsAteacher = user.joinedClassAsAteacher || [];
        // req.joinedClassAsStudent = user.joinedClassAsStudent || [];

        // console.log("Created Classes: ", req.createdClasses);
        // console.log("Joined Classes As Teacher: ", req.joinedClassAsAteacher);
        // console.log("Joined Classes As Student: ", req.joinedClassAsStudent);

        next();
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
            data: "Error during auth"
        });
    }
};

// exports.isStudent = async (req, res, next) => {
//     try {
//         const studentClass = await Class.findOne({ student: req.user.id });
//         if (req.joinedClassAsStudent.includes(studentClass.id)) {
//             console.log("STUDENT: " + req.joinedClassAsStudent);
//             next();
//         } else {
//             res.status(403).json({
//                 success: false,
//                 message: "User is not associated with any class as a student",
//             });
//         }
//     } catch (err) {
//         res.status(400).json({
//             success: false,
//             message: err.message,
//             data: "Error during auth of isStudent"
//         });
//     }
// };

// exports.isTeacher = async (req, res, next) => {
//     try {
//         const teacherClass = await Class.findOne({ teacher: req.user.id });
//         const adminClass = await Class.findOne({ admin: req.user.id });
        
//         if ((teacherClass && req.joinedClassAsAteacher.includes(teacherClass.id)) || adminClass && req.createdClasses.includes(adminClass?.id)) {
//             console.log("TEACHER: " + req.joinedClassAsAteacher);
//             next();
//         } else {
//             res.status(403).json({
//                 success: false,
//                 message: "User is not associated with any class as a teacher",
//             });
//         }
//     } catch (err) {
//         res.status(400).json({
//             success: false,
//             message: err.message,
//             data: "Error during auth of isTeacher"
//         });
//     }
// };

// exports.isAdmin = async (req, res, next) => {
//     try {
//         const adminClass = await Class.findOne({ admin: req.user.id });

//         if (!adminClass || !req.createdClasses.includes(adminClass.id)) {
//             return res.status(401).json({
//                 success: false,
//                 message: "PROTECTED ROUTE FOR ADMIN"
//             });
//         }

//         console.log("ADMIN");
//         next();
//     } catch (err) {
//         res.status(400).json({
//             success: false,
//             message: err.message,
//             data: "Error during auth of isAdmin"
//         });
//     }
// };