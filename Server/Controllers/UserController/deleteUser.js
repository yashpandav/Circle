const User = require('../../Models/User');
const Profile = require('../../Models/Profile');
const Class = require('../../Models/Class');
const ToDo = require('../../Models/ToDo');
const Review = require('../../Models/review');
const { getIO } = require('../../socket');
const { deleteFromCloudinary } = require('../../Utils/cloudinaryDelete');

exports.deleteUser = async (req, res, next) => {
    try {
        const id = req.user.id;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "USER NOT FOUND",
            });
        }

        if (user?.image) {
            await deleteFromCloudinary(user.image);
        }

        await Profile.findByIdAndDelete(user?.additionalDetails);

        await ToDo.findByIdAndDelete(user?.todo);

        await Review.findByIdAndDelete(user?.reviewList);

        const allClasses = await Class.find({});

        await Promise.all(allClasses.map(async (classes) => {
            let wasMember = false;
            if(classes.admin && classes.admin.toString() === user.id){
                classes.admin = null;
                wasMember = true;
            }
            if (classes.teacher.some(t => t.toString() === user.id)) {
                classes.teacher.pull(user.id);
                wasMember = true;
            }
            if (classes.student.some(s => s.toString() === user.id)) {
                classes.student.pull(user.id);
                wasMember = true;
            }
            if (wasMember) {
                await classes.save();
                getIO().to(`room:${classes._id.toString()}`).emit('class:member_left', { userId: user.id });
            }
        }));

        await User.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "USER DELETED SUCCESSFULLY",
        });

    } catch (err) {
        next(err);
    }
};