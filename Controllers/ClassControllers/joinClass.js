const Class = require('../../Models/Class');
const User = require('../../Models/User');
const { sendMail } = require('../../Utils/mailSender');

exports.joinClass = async (req, res) => {
    try {
        const entryCode = req.body?.entryCode;
        const entryUrl = req.body?.entryUrl;
        const joinAs = req.body.joinAs;

        if (!entryCode && !entryUrl) {
            return res.status(401).json({
                success: false,
                message: "Fields are required"
            });
        }

        if(joinAs !== "Teacher" && joinAs !== "Student"){
            return res.status(401).json({
                success: false,
                message: "Invalid Join As"
            });
        }

        let findClass = await Class.findOne({ entryCode: entryCode }) || await Class.findOne({ entryUrl: entryUrl });
        console.log(findClass);
        if (!findClass) {
            return res.status(401).json({
                success: false,
                message: "Class Not Found"
            });
        }
        let user = await User.findById(req.user.id);
        if(req.createdClasses.includes(findClass.id) ||req.joinedClassAsAteacher.includes(findClass.id) || req.joinedClassAsStudent.includes(findClass.id)){
            return res.status(401).json({
                success: false,
                message: "You are already enrolled in this class"
            });
        }

        if(joinAs === "Teacher"){
            // TODO: Admin Authentication
            findClass.teacher.push(user.id);
            user.joinedClassAsAteacher.push(findClass.id);
        }else if(joinAs === "Student"){
            findClass.student.push(user.id);
            user.joinedClassAsStudent.push(findClass.id);
        }

        // if (findClass.student.includes(req.user.id) || findClass.admin.toString() === req.user.id) {
        //     return res.status(401).json({
        //         success: false,
        //         message: "You are already enrolled in this class"
        //     });
        // }

        findClass = await findClass.save();
        user = await user.save();

        await sendMail(
            user.email,
            "Class Joined",
            `You have successfully joined ${findClass.name}`
        ).then(() => {
            console.log("Joined Class => ", findClass);
            console.log("Joined User => ", user);
            return res.status(200).json({
                success: true,
                message: "Class Joined",
                findClass,
                user
            })
        }).catch((err) => {
            return res.status(500).json({
                success: false,
                message: err.message,
                data: "Error while sending class mail"
            });
        });
    } catch(err){
        console.log(err)
        return res.status(500).json({
            success: false,
            message: err,
            data: "Error while joining class"
        })
    }
}