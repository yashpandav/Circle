const mongoose = require('mongoose');
const Post = require('../../Models/Post');
const User = require('../../Models/User');
const Category = require('../../Models/Category');
const Class = require('../../Models/Class');
const { uploadImage } = require('../../Utils/imageUpload');
const { getIO } = require('../../socket');
require('dotenv').config();

exports.editPost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const { title, category, status } = req.body;
        const postBody = req.body.text || req.body.postBody;
        const newFiles = req.files?.files || req.files?.postFiles;

        // 1. Validate Post ID format
        if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid Post ID",
            });
        }

        // 2. Retrieve existing post
        const findPost = await Post.findById(postId);
        if (!findPost) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        // 3. Find associated class to verify membership & permissions
        const currClass = await Class.findOne({ addedPost: postId });
        if (!currClass) {
            return res.status(404).json({
                success: false,
                message: "Associated class not found for this post",
            });
        }

        const isOwner = findPost.teacher.toString() === req.user.id;
        const isClassAdmin = currClass.admin && currClass.admin.toString() === req.user.id;
        const isClassTeacher = currClass.teacher && currClass.teacher.some(t => t.toString() === req.user.id);

        if (!isOwner && !isClassAdmin && !isClassTeacher) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to edit this post",
            });
        }

        // 4. Validate Title & Body if provided
        if (title !== undefined) {
            if (typeof title !== 'string' || title.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Post title cannot be empty",
                });
            }
            findPost.title = title.trim();
        }

        if (postBody !== undefined) {
            const strippedBody = postBody.replace(/<[^>]*>/g, '').trim();
            if (typeof postBody !== 'string' || (strippedBody.length === 0 && !postBody.includes('<img'))) {
                return res.status(400).json({
                    success: false,
                    message: "Post content cannot be empty",
                });
            }
            findPost.postBody = postBody.trim();
        }

        // 5. Category Synchronization
        if (category !== undefined) {
            const targetCategoryId = category && category.trim() !== "" ? category : null;

            if (targetCategoryId) {
                if (!mongoose.Types.ObjectId.isValid(targetCategoryId)) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid category ID provided",
                    });
                }

                const newCategory = await Category.findById(targetCategoryId);
                if (!newCategory) {
                    return res.status(404).json({
                        success: false,
                        message: "Specified category does not exist",
                    });
                }

                // If moving from another category, pull from old category
                if (findPost.category && findPost.category.toString() !== targetCategoryId) {
                    await Category.findByIdAndUpdate(findPost.category, { $pull: { post: postId } });
                }

                // Push to new category if not already present
                await Category.findByIdAndUpdate(targetCategoryId, { $addToSet: { post: postId } });
                findPost.category = targetCategoryId;
            } else {
                // Clearing category
                if (findPost.category) {
                    await Category.findByIdAndUpdate(findPost.category, { $pull: { post: postId } });
                }
                findPost.category = null;
            }
        }

        // 6. Handle Retained / Existing Files
        let updatedFiles = [];
        if (req.body.existingFiles !== undefined) {
            try {
                const parsedExisting = typeof req.body.existingFiles === 'string'
                    ? JSON.parse(req.body.existingFiles)
                    : req.body.existingFiles;

                if (Array.isArray(parsedExisting)) {
                    updatedFiles = parsedExisting.filter(
                        f => f && typeof f === 'object' && f.fileUrl && f.fileName
                    );
                }
            } catch (parseErr) {
                console.error("Error parsing existingFiles JSON:", parseErr);
            }
        } else {
            // If existingFiles not specified in request, keep currently stored files
            updatedFiles = findPost.postFiles || [];
        }

        // 7. Upload and Append New Files (Images, PDFs, etc.)
        if (newFiles) {
            const filesArray = Array.isArray(newFiles) ? newFiles : [newFiles];
            for (const file of filesArray) {
                const originalFileName = file.name || "attachment";
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E4);
                const fileExt = originalFileName.split('.').pop();
                const baseName = originalFileName.split('.')[0];
                const newFileName = `${baseName}|${uniqueSuffix}.${fileExt}`;

                const uploadedResult = await uploadImage(file, process.env.FOLDER_NAME, newFileName);
                if (uploadedResult && uploadedResult.secure_url) {
                    updatedFiles.push({
                        fileName: newFileName,
                        fileType: uploadedResult.format || fileExt || 'unknown',
                        fileUrl: uploadedResult.secure_url,
                    });
                }
            }
        }
        findPost.postFiles = updatedFiles;

        // 8. Update Web Links
        if (req.body.links !== undefined) {
            let parsedLinks = [];
            if (Array.isArray(req.body.links)) {
                parsedLinks = req.body.links;
            } else if (typeof req.body.links === 'string') {
                try {
                    parsedLinks = JSON.parse(req.body.links);
                } catch {
                    parsedLinks = [req.body.links];
                }
            }
            findPost.links = Array.isArray(parsedLinks) ? parsedLinks.filter(l => l && l.trim() !== '') : [];
        }

        // 9. Update YouTube Links
        if (req.body.youtubeLinks !== undefined) {
            let parsedYouTube = [];
            if (Array.isArray(req.body.youtubeLinks)) {
                parsedYouTube = req.body.youtubeLinks;
            } else if (typeof req.body.youtubeLinks === 'string') {
                try {
                    parsedYouTube = JSON.parse(req.body.youtubeLinks);
                } catch {
                    parsedYouTube = [req.body.youtubeLinks];
                }
            }

            // Extract YouTube IDs if full URLs were provided
            const cleanedYouTube = (Array.isArray(parsedYouTube) ? parsedYouTube : [])
                .map(link => {
                    if (!link) return null;
                    if (link.includes('youtube.com') || link.includes('youtu.be')) {
                        const match = link.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
                        return (match && match[2].length === 11) ? match[2] : link;
                    }
                    return link.trim();
                })
                .filter(Boolean);

            findPost.youtubeLinks = cleanedYouTube;
        }

        // 10. Update Status if specified
        if (status && ["Draft", "Published"].includes(status)) {
            findPost.status = status;
        }

        // 11. Save changes to DB
        await findPost.save();

        // 12. Populate and Broadcast via Socket.IO
        const populatedPost = await Post.findById(findPost._id)
            .populate('teacher', 'firstName lastName image')
            .populate({
                path: 'comment',
                populate: {
                    path: 'user',
                    select: 'firstName lastName image'
                }
            });

        getIO().to(`room:${currClass._id.toString()}`).emit('post:updated', { data: populatedPost });

        return res.status(200).json({
            success: true,
            message: "Post updated successfully",
            data: populatedPost,
        });
    } catch (err) {
        next(err);
    }
};
