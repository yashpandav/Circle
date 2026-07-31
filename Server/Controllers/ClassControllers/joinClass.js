const Class = require('../../Models/Class');
const User = require('../../Models/User');
const { sendMail } = require('../../Utils/mailSender');
const { getIO } = require('../../socket');

exports.joinClass = async (req, res, next) => {
    try {
        const { entryCode, entryUrl } = req.body;

        if (!entryCode && !entryUrl) {
            return res.status(400).json({
                success: false,
                message: "Entry code or URL is required"
            });
        }

        let findClass = (await Class.findOne({ entryCode })) || (await Class.findOne({ entryUrl }));

        if (!findClass) {
            return res.status(404).json({
                success: false,
                message: "Class Not Found"
            });
        }

        if (findClass.isCodeActive === false) {
            return res.status(403).json({
                success: false,
                message: "Invitations for this class have been turned off by the admin."
            });
        }

        const user = await User.findById(req.user.id);

        const alreadyEnrolled =
            user.createdClasses.some(id => id.toString() === findClass.id) ||
            user.joinedClassAsAteacher.some(id => id.toString() === findClass.id) ||
            user.joinedClassAsStudent.some(id => id.toString() === findClass.id);

        if (alreadyEnrolled) {
            return res.status(400).json({
                success: false,
                message: "You are already enrolled in this class"
            });
        }

        // Add to class and user as Student
        findClass.student.push(user.id);
        user.joinedClassAsStudent.push(findClass.id);

        await Promise.all([findClass.save(), user.save()]);

        /* await sendMail(
            user.email,
            "Class Joined",
            `You have successfully joined ${findClass.name}`
        ); */

        const populatedUser = await User.findById(user._id).select('firstName lastName email image');

        getIO().to(`room:${findClass._id.toString()}`).emit('class:member_joined', { user: populatedUser });

        return res.status(200).json({
            success: true,
            message: "Class Joined Successfully",
            findClass,
            user
        });
    } catch (err) {
        next(err);
    }
};
