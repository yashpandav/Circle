const Post = require('../../Models/Post');
const Assignment = require('../../Models/Assignment');
const Class = require('../../Models/Class');

exports.getAllComment = async (req, res, next) => {
    try {
        const { commentOn } = req.query;
        const id = req.params.id;

        if (!commentOn) {
            return res.status(400).json({
                success: false,
                message: "commentOn is required",
            });
        }

        const tempModel = {
            Post: Post,
            Assignment: Assignment,
        };

        if (!tempModel[commentOn]) {
            return res.status(400).json({
                success: false,
                message: "Invalid commentOn value",
            });
        }

        const response = await tempModel[commentOn].findById(id)
                        ?.populate({
                            path: 'comment',
                            populate: {
                                path: 'user',
                                select: 'firstName lastName image email'
                            }
                        })
                        .exec();

        if (!response) {
            return res.status(404).json({
                success: false,
                message: `${commentOn} not found`,
            });
        }

        const queryField = commentOn === 'Post' ? { addedPost: id } : { addedAssignment: id };
        const parentClass = await Class.findOne(queryField);

        if (parentClass) {
            const isAuthorized = (parentClass.admin && parentClass.admin.toString() === req.user.id) ||
                parentClass.teacher?.some(t => t.toString() === req.user.id) ||
                parentClass.student?.some(s => s.toString() === req.user.id);

            if (!isAuthorized) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to view comments for this item",
                });
            }
        }

        return res.status(200).json({
            success: true,
            data: response,
        });

    } catch (err) {
        next(err);
    }
};
