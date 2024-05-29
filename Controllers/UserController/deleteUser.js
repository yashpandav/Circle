const User = require('../../Models/User');
const Profile = require('../../Models/Profile');
const Class = require('../../Models/Class');
const ToDo = require('../../Models/ToDo');
const Review = require('../../Models/review');

exports.deleteUser = async (req, res) => {
    try {
        const id = req.user.id;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "USER NOT FOUND",
            });
        }

        await Profile.findByIdAndDelete(user.additionalDetails);

        await ToDo.deleteMany({ id: user.todo });

        await Review.deleteMany({ id: user.reviewList });

        const allClasses = await Class.find();
        await Promise.all(allClasses.map(async (classes) => {
            if(classes.admin === user.id){
                classes.admin = null;
            }
            classes.teacher.pull(user._id);
            classes.student.pull(user._id);
            await classes.save();
        }));

        await User.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "USER DELETED SUCCESSFULLY",
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: err.message,
            data: "Something went wrong while deleting user"
        });
    }
};
