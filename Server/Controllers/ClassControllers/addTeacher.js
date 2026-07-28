const Class = require('../../Models/Class');
const User = require('../../Models/User');
const { getIO } = require('../../socket');

exports.addTeacher = async (req, res) => {
    try {
        const { classId, email } = req.body;

        if (!classId || !email) {
            return res.status(400).json({
                success: false,
                message: "Class ID and Email are required"
            });
        }

        const currClass = await Class.findById(classId);
        if (!currClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }

        // Only Admin can add teachers
        if (currClass.admin.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to add teachers to this class"
            });
        }

        const targetUser = await User.findOne({ email });
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: "User with this email does not exist"
            });
        }

        // Check if user is already enrolled
        const alreadyEnrolled =
            targetUser.createdClasses.some(id => id.toString() === classId) ||
            targetUser.joinedClassAsAteacher.some(id => id.toString() === classId) ||
            targetUser.joinedClassAsStudent.some(id => id.toString() === classId);

        if (alreadyEnrolled) {
            return res.status(400).json({
                success: false,
                message: "User is already enrolled in this class"
            });
        }

        // Add user as Teacher
        currClass.teacher.push(targetUser._id);
        targetUser.joinedClassAsAteacher.push(currClass._id);

        await Promise.all([currClass.save(), targetUser.save()]);

        const populatedUser = await User.findById(targetUser._id).select('firstName lastName email image');

        getIO().to(`room:${classId}`).emit('class:teacher_added', { user: populatedUser });

        return res.status(200).json({
            success: true,
            message: "Teacher added successfully",
            data: currClass
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Error while adding teacher",
            error: err.message
        });
    }
};
