const Class = require('../../Models/Class');
const User = require('../../Models/User');
const { sendMail } = require('../../Utils/mailSender');

exports.joinClass = async (req, res) => {
    try {
        const { entryCode, entryUrl, joinAs } = req.body;

        if (!entryCode && !entryUrl) {
            return res.status(400).json({
                success: false,
                message: "Entry code or URL is required"
            });
        }

        if(joinAs !== "Teacher" && joinAs !== "Student"){
            return res.status(401).json({
                success: false,
                message: "Invalid Join As"
            });
        }

        let findClass = await Class.findOne({ entryCode }) || await Class.findOne({ entryUrl });

        if (!findClass) {
            return res.status(404).json({
                success: false,
                message: "Class Not Found"
            });
        }

        const user = await User.findById(req.user.id);

        if (user.createdClasses.includes(findClass.id) || user.joinedClassAsAteacher.includes(findClass.id) || user.joinedClassAsStudent.includes(findClass.id)) {
            return res.status(400).json({
                success: false,
                message: "You are already enrolled in this class"
            });
        }

        if (joinAs === "Teacher") {
            findClass.teacher.push(user.id);
            user.joinedClassAsAteacher.push(findClass.id);
        } else if (joinAs === "Student") {
            findClass.student.push(user.id);
            user.joinedClassAsStudent.push(findClass.id);
        }

        await Promise.all([findClass.save(), user.save()]);

        await sendMail(
            user.email,
            "Class Joined",
            `You have successfully joined ${findClass.name}`
        );

        return res.status(200).json({
            success: true,
            message: "Class Joined Successfully",
            findClass,
            user
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Error while joining class",
            error: err.message
        });
    }
};
