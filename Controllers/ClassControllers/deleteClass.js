const Class = require('../../Models/Class');
const User = require('../../Models/User');

exports.deleteClass = async (req, res) => {
    try {
        const { classId } = req.body;

        if (!classId) {
            return res.status(401).json({
                success: false,
                message: "Class Id is required"
            })
        }

        let response = await Class.findById(classId);

        if (!response) {
            return res.status(404).json({
                success: false,
                message: "Class Not Found"
            })
        }

        //* AUTHORIZIG ADMIN
        if (response.admin.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: "You are not authorized to delete this class"
            })
        }

        let allUsers = await User.find({});

        await Promise.all(allUsers.map(async user => {
            user.joinedClassAsStudent.pull(classId);
            user.joinedClassAsAteacher.pull(classId);
            user.createdClasses.pull(classId);
            await user.save();
        }));
        allUsers = await User.find();
        response = await Class.findByIdAndDelete(classId);

        return res.status(200).json({
            success: true,
            message: "Class Deleted Successfully",
            response,
            allUsers
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: err.message,
            data: "Something went wrong While Deleting Class"
        })
    }
}   