const Post = require("../../Models/Post");
const { uploadImage } = require("../../Utils/imageUpload");
const User = require("../../Models/User");
const Class = require("../../Models/Class");
const Category = require("../../Models/Category");
require("dotenv").config();
exports.createPost = async (req, res) => {
    try {
        const { currClassId, title, category, status, links, youtubeLinks } =
            req.body;
        const postBody = req.body.text;
        const postFiles = req.files?.files;

        if (!currClassId || !title || !postBody) {
            return res.status(401).json({
                success: false,
                message: "All Fields are Required",
            });
        }

        let fileUrls = [];
        if (postFiles) {
            if (postFiles?.length > 0) {
                for (const file of postFiles) {
                    const fileUrl = await uploadImage(file, process.env.FOLDER_NAME);
                    console.log(fileUrl);
                    const fileDetails = {
                        fileName : fileUrl.original_filename,
                        fileType : fileUrl.format,
                        fileUrl : fileUrl.secure_url
                    }
                    fileUrls.push(fileDetails);
                }
            } else {
                const fileUrl = await uploadImage(postFiles, process.env.FOLDER_NAME);
                const fileDetails = {
                    fileType : fileUrl.format,
                    fileUrl : fileUrl.secure_url
                }
                fileUrls.push(fileDetails);
            }
        }

        const uploadDate = new Date().toLocaleString();
        const teacher = req.user.id;

        const newPost = new Post({
            title,
            postBody,
            postFiles: fileUrls || [],
            links: links || [],
            youtubeLinks: youtubeLinks || [],
            teacher,
            category: category || null,
            status,
            uploadDate,
        });

        await newPost.save();

        // if (newPost.status === "Published") {

        await Class.findByIdAndUpdate(currClassId, {
            $push: {
                addedPost: newPost.id,
            },
        });

        if (category) {
            const currCategory = await Category.findOne({ name: category });
            if (currCategory) {
                await Category.findByIdAndUpdate(currCategory.id, {
                    $push: {
                        post: newPost.id,
                    },
                });

                await Post.findByIdAndUpdate(newPost.id, {
                    $push: { category: currCategory.id },
                });
            }
        }
        await newPost.save();
        return res.status(200).json({
            success: true,
            message: "Post Created Successfully",
            data: newPost,
        });
        // } else {
        //     return res.status(200).json({
        //         success: true,
        //         message: "Post Drafted Successfully",
        //         data: newPost,
        //     });
        // }
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            success: false,
            message: "Something went wrong while posting",
        });
    }
};
