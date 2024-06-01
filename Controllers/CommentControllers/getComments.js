const Post = require('../../Models/Post');
const Assignment = require('../../Models/Assignment');
const Comment = require('../../Models/Comment');

exports.getAllComment = async (req, res) => {
    try {
        const { commentOn } = req.body;
        const { id } = req.params;

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
                            ?.populate('comments')
                            .exec();

        if (!response) {
            return res.status(404).json({
                success: false,
                message: `${commentOn} not found`,
            });
        }

        return res.status(200).json({
            success: true,
            data: response,
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Error during getting all comments",
        });
    }
};
