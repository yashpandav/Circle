const mongoose = require('mongoose');
const Class = require('../../Models/Class');
const User = require('../../Models/User');
const { getIO } = require('../../socket');

exports.leftClass = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { classId } = req.body;

        if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
            return res.status(400).json({
                success: false,
                message: "Valid Class ID is required"
            });
        }

        const classDetails = await Class.findById(classId);
        if (!classDetails) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }

        const userDetails = await User.findById(userId);
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (userDetails.createdClasses.some(id => id.toString() === classId)) {
            return res.status(403).json({
                success: false,
                message: "Admin cannot leave the class"
            });
        }

        userDetails.joinedClassAsAteacher.pull(classId);
        userDetails.joinedClassAsStudent.pull(classId);
        classDetails.teacher.pull(userDetails.id);
        classDetails.student.pull(userDetails.id);

        await Promise.all([userDetails.save(), classDetails.save()]);

        getIO().to(`room:${classId}`).emit('class:member_left', { userId: userId });

        return res.status(200).json({
            success: true,
            message: "Class left successfully",
            data: {
                classDetails,
                userDetails
            }
        });
    } catch (err) {
        next(err);
    }
};