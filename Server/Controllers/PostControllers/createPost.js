const Post = require("../../Models/Post");
const { uploadImage } = require("../../Utils/imageUpload");
const Class = require("../../Models/Class");
const Category = require("../../Models/Category");
const { getIO } = require("../../socket");
require("dotenv").config();

exports.createPost = async (req, res, next) => {
    try {
        const { currClassId, title, category, status, links, youtubeLinks } = req.body;
        const postBody = req.body.text;
        const postFiles = req.files?.files;

        if (!currClassId || !title || !postBody) {
            return res.status(400).json({ success: false, message: "All Fields are Required" });
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
            const filesArray = Array.isArray(postFiles) ? postFiles : [postFiles];
            const uploadResults = await Promise.all(
                filesArray.map(async (file) => {
                    const originalFileName = file.name;
                    if (!originalFileName) return null;
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E4);
                    const newFileName = `${originalFileName.split('.')[0]}|${uniqueSuffix}.${originalFileName.split('.').pop()}`;
                    const fileUrl = await uploadImage(file, process.env.FOLDER_NAME, newFileName);
                    if (fileUrl && fileUrl.secure_url) {
                        return {
                            fileName: newFileName,
                            fileType: fileUrl.format,
                            fileUrl: fileUrl.secure_url,
                        };
                    }
                    return null;
                })
            );
            fileUrls = uploadResults.filter(Boolean);
        }

        const teacher = req.user.id;

        const newPost = new Post({
            title,
            postBody,
            postFiles: fileUrls,
            links: links || [],
            youtubeLinks: youtubeLinks || [],
            teacher,
            category: category || null,
            status,
        });

        await newPost.save();

        const updateOps = [
            Class.findByIdAndUpdate(currClassId, { $addToSet: { addedPost: newPost.id } })
        ];

        if (category) {
            updateOps.push(
                Category.findByIdAndUpdate(category, { $addToSet: { post: newPost.id } })
            );
        }

        await Promise.all(updateOps);

        // Populate before broadcasting so clients get full data
        const populatedPost = await Post.findById(newPost.id).populate('teacher', 'firstName lastName image');

        getIO().to(`room:${currClassId}`).emit('post:new', { data: populatedPost });

        return res.status(200).json({ success: true, message: "Post Created Successfully", data: populatedPost });
    } catch (err) {
        next(err);
    }
};
