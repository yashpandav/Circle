const Class = require('../../Models/Class');
const Assignment = require('../../Models/Assignment');
const User = require('../../Models/User');
const Post = require('../../Models/Post');

exports.getClass = async (req, res, next) => {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Class Id is required"
            });
        }

        const findClass = await Class.findById(id)
            ?.populate("admin")
            .populate("student")
            .populate("teacher")
            .populate("addedAssignment")
            .populate("addedCategory")
            .populate("addedPost")
            .populate({
                path: 'addedPost',
                populate: [
                    {
                        path: 'teacher',
                        select: 'firstName lastName image'
                    },
                    {
                        path: 'comment',
                        populate: {
                            path: 'user',
                            select: 'firstName lastName image'
                        },
                        select: 'commentBody user'
                    }
                ]
            })
            .populate({
                path: 'addedAssignment',
                populate: [
                    {
                        path: 'teacher',
                        select: 'firstName lastName image'
                    },
                    {
                        path: 'comment',
                        populate: {
                            path: 'user',
                            select: 'firstName lastName image'
                        },
                        select: 'commentBody user'
                    }
                ]
            })
            .exec();

        if (!findClass) {
            return res.status(404).json({
                success: false,
                message: "Class Not Found"
            });
        }

        const isMember = findClass.admin?._id?.toString() === req.user.id ||
            findClass.teacher?.some(t => t._id?.toString() === req.user.id) ||
            findClass.student?.some(s => s._id?.toString() === req.user.id);

        if (!isMember) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this class"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Class Found",
            data: findClass
        });

    } catch (err) {
        next(err);
    }
};