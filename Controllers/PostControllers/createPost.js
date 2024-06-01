const Post = require("../../Models/Post");
const { uploadImage } = require("../../Utils/imageUpload");
const User = require("../../Models/User");
const Class = require("../../Models/Class");
const Category = require("../../Models/Category");
require("dotenv").config();

exports.createPost = async (req, res) => {
    try {
        const { currClassId, title, postBody, category, uploadDate, status } =
            req?.body;

        let postFile = req.files?.postFile;

        if (!currClassId || !title || !postBody) {
            return res.status(401).json({
                success: false,
                message: "All Fields are Required",
            });
        }

        if (postFile) {
            const fileUrl = await uploadImage(postFile, process.env.FOLDER_NAME);
            postFile = fileUrl.secure_url;
        }

        const teacher = req.user.id;
        console.log("TEACHER => ", teacher);

        //* ADDED POST
        const newPost = new Post({
            title,
            postBody,
            postFile: postFile || "",
            teacher,
            category: category || null,
            status,
        });
        await newPost.save();

        if (newPost.status === "Published") {
            //* ADDED POST INTO THE CLASS

            newPost.uploadDate = uploadDate;

            await Class.findByIdAndUpdate(currClassId, {
                $push: {
                    addedPost: newPost.id,
                },
            });

            if (category) {
                const currCategory = await Category.findOne({ category });
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
                newAss,
            });
        } else {
            return res.status(200).json({
                success: true,
                message: "Post Drafted Successfully",
                newAss,
            });
        }
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            success: false,
            message: "Something went wrong while posting",
        });
    }
};
