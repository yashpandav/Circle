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

        const currClass = await Class.findById(currClassId);
        if (!currClass) {
            return res.status(404).json({ success: false, message: "Class not found" });
        }

        const isTeacherOrAdmin = (currClass.admin && currClass.admin.toString() === req.user.id) || 
                                 (currClass.teacher && currClass.teacher.some(t => t.toString() === req.user.id));
        const isStudent = currClass.student && currClass.student.some(s => s.toString() === req.user.id);

        if (!isTeacherOrAdmin && !isStudent) {
            return res.status(403).json({ success: false, message: "You are not part of this class" });
        }

        if (isStudent && !isTeacherOrAdmin && currClass.studentCanPost === false) {
            return res.status(403).json({ success: false, message: "Students are not allowed to post in this class" });
        }

        let fileUrls = [];
        if (postFiles) {
            if (postFiles?.length > 0) {
                for (const file of postFiles) {
                    const originalFileName = file.name;
                    if (originalFileName) {
                        const uniqueSuffix = Date.now();
                        const newFileName = `${originalFileName.split('.')[0]}|${uniqueSuffix}.${originalFileName.split('.').pop()}`;

                        const fileUrl = await uploadImage(file, process.env.FOLDER_NAME, newFileName);
                        const fileDetails = {
                            fileName: newFileName,
                            fileType: fileUrl.format,
                            fileUrl: fileUrl.secure_url,
                        };
                        fileUrls.push(fileDetails);
                    }
                }
            } else {
                const originalFileName = postFiles.name;
                if (originalFileName) {
                    const uniqueSuffix = Date.now(); 
                    const newFileName = `${originalFileName.split('.')[0]}|${uniqueSuffix}.${originalFileName.split('.').pop()}`;

                    const fileUrl = await uploadImage(postFiles, process.env.FOLDER_NAME, newFileName);
                    const fileDetails = {
                        fileName: newFileName,
                        fileType: fileUrl.format,
                        fileUrl: fileUrl.secure_url,
                    };
                    fileUrls.push(fileDetails);
                }
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
            const currCategory = await Category.findById(category);
            if (currCategory) {
                await Category.findByIdAndUpdate(currCategory.id, {
                    $push: {
                        post: newPost.id,
                    },
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
