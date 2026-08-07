const mongoose = require('mongoose');
const Assignment = require('../../Models/Assignment');
const User = require('../../Models/User');
const Category = require('../../Models/Category');
const Class = require('../../Models/Class');
const { uploadImage } = require('../../Utils/imageUpload');
const { deleteFromCloudinary } = require('../../Utils/cloudinaryDelete');
const { getIO } = require('../../socket');
require('dotenv').config();

exports.editAss = async (req, res, next) => {
    try {
        const assId = req.params.id;

        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User identification missing"
            });
        }

        const {
            name,
            description,
            category,
            dueDate,
            acceptAfterDue,
            status,
            totalMarks,
            removeFile,
            currClassId
        } = req.body;

        const newFiles = req.files?.files || req.files?.file;

        if (!assId || !mongoose.Types.ObjectId.isValid(assId)) {
            return res.status(400).json({
                success: false,
                message: "Valid Assignment ID is required",
            });
        }

        let findAss = await Assignment.findById(assId);
        if (!findAss) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found",
            });
        }

        let parentClass = await Class.findOne({ addedAssignment: assId });
        if (!parentClass && currClassId && mongoose.Types.ObjectId.isValid(currClassId)) {
            parentClass = await Class.findById(currClassId);
        }
        if (!parentClass) {
            parentClass = await Class.findOne({
                $or: [
                    { admin: userId },
                    { teacher: userId }
                ]
            });
        }

        //* Authorizing teacher (only the teacher who created this assignment can edit it)
        const isAuthorTeacher = findAss.teacher && findAss.teacher.toString() === userId.toString();

        if (!isAuthorTeacher) {
            return res.status(403).json({
                success: false,
                message: "Only the teacher who uploaded this assignment is authorized to edit it",
            });
        }

        //* Validating due date if provided
        if (dueDate !== undefined) {
            if (dueDate && typeof dueDate === 'string' && dueDate.trim() !== '' && dueDate !== 'null') {
                const parsedDueDate = new Date(dueDate);
                if (isNaN(parsedDueDate.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid due date format",
                    });
                }
                findAss.dueDate = parsedDueDate;
            } else if (dueDate === null || dueDate === '' || dueDate === 'null') {
                findAss.dueDate = undefined;
            }
        }

        //* Updating category if provided or cleared
        if (category !== undefined) {
            if (category && category !== "" && category !== "null" && mongoose.Types.ObjectId.isValid(category)) {
                let currCategory = await Category.findById(category);
                if (currCategory) {
                    if (findAss.category && findAss.category.toString() !== category.toString()) {
                        let prevCategory = await Category.findById(findAss.category);
                        if (prevCategory) {
                            prevCategory.assignment.pull(assId);
                            await prevCategory.save();
                        }
                    }
                    if (!currCategory.assignment.includes(assId)) {
                        currCategory.assignment.push(assId);
                        await currCategory.save();
                    }
                    findAss.category = currCategory._id;
                }
            } else if (category === "" || category === null || category === "null") {
                if (findAss.category) {
                    let prevCategory = await Category.findById(findAss.category);
                    if (prevCategory) {
                        prevCategory.assignment.pull(assId);
                        await prevCategory.save();
                    }
                    findAss.category = null;
                }
            }
        }

        //* Handle Retained / Existing Files & Cleanup of Removed Files
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
                console.error("Error parsing existingFiles JSON in editAss:", parseErr);
            }

            // Detect and delete removed Cloudinary files from files array and legacy file field
            const oldFiles = findAss.files || [];
            const removedFiles = oldFiles.filter(
                oldF => oldF?.fileUrl && !updatedFiles.some(uF => uF.fileUrl === oldF.fileUrl)
            );
            if (removedFiles.length > 0) {
                const urlsToDelete = removedFiles.map(f => f.fileUrl).filter(Boolean);
                await deleteFromCloudinary(urlsToDelete);
            }

            if (findAss.file && !updatedFiles.some(uF => uF.fileUrl === findAss.file)) {
                await deleteFromCloudinary(findAss.file);
            }
        } else {
            // Keep currently stored files if existingFiles not passed
            updatedFiles = findAss.files || [];
        }

        //* Upload and Append New Files (Images, PDFs, Docs, etc.)
        if (newFiles) {
            const filesArray = Array.isArray(newFiles) ? newFiles : [newFiles];
            for (const item of filesArray) {
                const originalFileName = item.name || "attachment";
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E4);
                const fileExt = originalFileName.split('.').pop();
                const baseName = originalFileName.split('.')[0];
                const newFileName = `${baseName}|${uniqueSuffix}.${fileExt}`;

                const uploadedResult = await uploadImage(item, process.env.FOLDER_NAME, newFileName);
                if (uploadedResult && uploadedResult.secure_url) {
                    updatedFiles.push({
                        fileName: newFileName,
                        fileType: uploadedResult.format || fileExt || 'unknown',
                        fileUrl: uploadedResult.secure_url,
                    });
                }
            }
        }

        if (removeFile === 'true' || removeFile === true) {
            if (findAss.file) {
                await deleteFromCloudinary(findAss.file);
                findAss.file = '';
            }
            if (updatedFiles.length > 0) {
                const urlsToDelete = updatedFiles.map(f => f.fileUrl).filter(Boolean);
                await deleteFromCloudinary(urlsToDelete);
                updatedFiles = [];
            }
        }

        findAss.files = updatedFiles;
        findAss.file = updatedFiles.length > 0 ? updatedFiles[0].fileUrl : (findAss.file || '');

        //* Update Web Links
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
            findAss.links = Array.isArray(parsedLinks) ? parsedLinks.filter(l => l && typeof l === 'string' && l.trim() !== '') : [];
        }

        //* Update YouTube Links
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

            const cleanedYouTube = (Array.isArray(parsedYouTube) ? parsedYouTube : [])
                .map(link => {
                    if (!link || typeof link !== 'string') return null;
                    if (link.includes('youtube.com') || link.includes('youtu.be')) {
                        const match = link.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
                        return (match && match[2].length === 11) ? match[2] : link;
                    }
                    return link.trim();
                })
                .filter(Boolean);

            findAss.youtubeLinks = cleanedYouTube;
        }

        //* Updating standard fields
        if (name !== undefined && typeof name === 'string' && name.trim()) findAss.name = name.trim();
        if (description !== undefined) findAss.description = description;
        if (totalMarks !== undefined && !isNaN(Number(totalMarks))) {
            findAss.totalMarks = Number(totalMarks);
        }
        if (acceptAfterDue !== undefined) {
            findAss.acceptAfterDue = (acceptAfterDue === 'true' || acceptAfterDue === true || acceptAfterDue === 'on');
        }

        const wasDraft = findAss.status === 'Draft';
        if (status !== undefined) findAss.status = status;

        //* If status changed from Draft to Published, ensure class references and pending students are synced
        if (wasDraft && findAss.status === 'Published' && parentClass) {
            await Class.findByIdAndUpdate(parentClass._id, {
                $addToSet: { addedAssignment: findAss._id }
            });

            if (!findAss.pendingStudent || findAss.pendingStudent.length === 0) {
                const studentsFromUsers = await User.find({ joinedClassAsStudent: parentClass._id }).select('_id');
                const studentIdSet = new Set(studentsFromUsers.map(s => s._id.toString()));
                if (parentClass.student && Array.isArray(parentClass.student)) {
                    parentClass.student.forEach(s => studentIdSet.add(s.toString()));
                }
                findAss.pendingStudent = Array.from(studentIdSet);
            }
        }

        await findAss.save();

        const populatedAss = await Assignment.findById(findAss._id)
            .populate('teacher', 'firstName lastName image email')
            .populate('category', 'name')
            .populate('pendingStudent', 'firstName lastName image email')
            .populate({
                path: 'submission',
                populate: {
                    path: 'student',
                    select: 'firstName lastName image email'
                }
            })
            .populate({
                path: 'comment',
                populate: {
                    path: 'user',
                    select: 'firstName lastName image'
                }
            });

        if (parentClass) {
            getIO().to(`room:${parentClass._id.toString()}`).emit('assignment:updated', { data: populatedAss });
            getIO().to(`room:${parentClass._id.toString()}`).emit('todo:updated', { classId: parentClass._id.toString(), assignmentId: findAss._id });
            if (wasDraft && findAss.status === 'Published') {
                getIO().to(`room:${parentClass._id.toString()}`).emit('assignment:new', { data: populatedAss });
            }
        }

        return res.status(200).json({
            success: true,
            message: "Assignment edited successfully",
            data: populatedAss,
        });
    } catch (err) {
        next(err);
    }
};