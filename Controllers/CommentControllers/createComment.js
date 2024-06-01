const Comment = require('../../Models/Comment');
const Post = require('../../Models/Post');
const Assignment = require('../../Models/Assignment');

exports.createComment = async (req, res) => {
    try {
        const { 
            name,
            commentBody,
            commentOn,
            id
        } = req.body;

        if (!name || !commentBody) {
            return res.status(400).json({
                success: false,
                message: "Name and commentBody are required",
            });
        }

        const tempModel = {
            Post: Post,
            Assignment: Assignment
        };

        if (!tempModel[commentOn]) {
            return res.status(400).json({
                success: false,
                message: "Invalid commentOn value",
            });
        }

        const commentOnWhich = await tempModel[commentOn].findById(id);
        if (!commentOnWhich) {
            return res.status(404).json({
                success: false,
                message: `${commentOn} not found`,
            });
        }

        const createdComment = await Comment.create({
            name,
            commentBody,
            user: req.user.id
        });

        commentOnWhich.comments.push(createdComment.id);
        await commentOnWhich.save();

        return res.status(201).json({
            success: true,
            message: "Comment added",
            createdComment
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while creating the comment",
        });
    }
};

        // if(commentOn === "Post"){
        //     const findPost = await Post.findById(id);
        //     if(!findPost){
        //         return res.status(401).json({
        //             success: false,
        //             message: "Post not found"
        //         })
        //     }
        // }else if(commentOn === "Assignment"){
        //     const findAss = await Assignment.findById(id);
        //     if(!findAss){
        //         return res.status(401).json({
        //             success: false,
        //             message: "Assignment not found"
        //         })
        //     }
        // }