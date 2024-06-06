const Class = require('../../Models/Class');
const Assignment = require('../../Models/Assignment');
const User = require('../../Models/User');
const Post = require('../../Models/Post');

exports.getAllClass = async (req, res) => {
    try {

        const findClass = await Class.find({})
            ?.populate("admin")
            .populate("student")
            .populate("teacher")
            .populate("addedAssignment")
            .populate("addedCategory")
            .populate("addedPost")
            .exec();

        if (!findClass) {
            return res.status(404).json({
                success: false,
                message: "Class Not Found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Class Found",
            data: findClass
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message
        });
    }
};