const Post = require('../../Models/Post');
const User = require('../../Models/User');
const Category = require('../../Models/Category');
const { uploadImage } = require('../../Utils/imageUpload');
require('dotenv').config();

exports.editPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const { title, postBody, category } = req.body;
        let postFile = req.files?.postFile;

        if (!postId) {
            return res.status(400).json({
                success: false,
                message: "Please provide a Post Id",
            });
        }

        const findPost = await Post.findById(postId);
        if (!findPost) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        const isAuthorized = findPost.teacher.toString() === req.user.id;
        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to edit this post",
            });
        }

        if (category) {
            const currCategory = await Category.findOne({ category });
            if (!currCategory) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found",
                });
            }
            const prevCategory = await Category.findById(findPost.category);
            if (prevCategory) {
                prevCategory.post.pull(postId);
                await prevCategory.save();
            }
            currCategory.post.push(postId);
            await currCategory.save();
            findPost.category = currCategory.id;
        }

        if (postFile) {
            const image = await uploadImage(postFile, process.env.FOLDER_NAME);
            postFile = image.secure_url;
        }

        findPost.title = title || findPost.title;
        findPost.postBody = postBody || findPost.postBody;
        findPost.postFile = postFile || findPost.postFile;
        await findPost.save();

        return res.status(200).json({
            success: true,
            message: "Post edited successfully",
            data : findPost,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while editing the post",
        });
    }
};
