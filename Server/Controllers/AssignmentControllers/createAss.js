const mongoose = require('mongoose');
const Assignment = require('../../Models/Assignment');
const { uploadImage } = require('../../Utils/imageUpload');
const User = require('../../Models/User');
const Class = require('../../Models/Class');
const Category = require('../../Models/Category');
const { getIO } = require('../../socket');
require('dotenv').config();

exports.createAss = async (req, res, next) => {
    try {
        const {
            currClassId,
            name,
            description,
            category,
            dueDate,
            status = 'Published',
            totalMarks = 100,
            acceptAfterDue
        } = req.body;

        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User identification missing"
            });
        }

        if (!currClassId || !name || !description) {
            return res.status(400).json({
                success: false,
                message: "Class ID, Assignment Title, and Description are required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(currClassId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Class ID format"
            });
        }

        if (dueDate && typeof dueDate === 'string' && dueDate.trim() !== '' && dueDate !== 'null') {
            const dueTime = new Date(dueDate).getTime();
            if (isNaN(dueTime)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid due date format"
                });
            }
            if (dueTime < Date.now()) {
                return res.status(400).json({
                    success: false,
                    message: "Due Date should be greater than current date"
                });
            }
        }

        let currClass = await Class.findById(currClassId);
        if (!currClass) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }

        //* Authorizing teacher or admin
        const isTeacherOrAdmin = (currClass.admin && currClass.admin.toString() === userId.toString()) ||
            (currClass.teacher && currClass.teacher.some(t => t.toString() === userId.toString()));

        if (!isTeacherOrAdmin) {
            return res.status(403).json({
                success: false,
                message: "Only teachers and admins are authorized to create assignments in this class"
            });
        }

        //* Process Files in parallel
        let uploadedFiles = [];
        const rawFiles = req.files?.files || req.files?.file;
        if (rawFiles) {
            const filesArray = Array.isArray(rawFiles) ? rawFiles : [rawFiles];
            uploadedFiles = await Promise.all(
                filesArray.map(async (item) => {
                    const originalFileName = item.name || "attachment";
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E4);
                    const fileExt = originalFileName.split('.').pop();
                    const baseName = originalFileName.split('.')[0];
                    const newFileName = `${baseName}|${uniqueSuffix}.${fileExt}`;

                    const uploadedResult = await uploadImage(item, process.env.FOLDER_NAME, newFileName);
                    if (uploadedResult && uploadedResult.secure_url) {
                        return {
                            fileName: newFileName,
                            fileType: uploadedResult.format || fileExt || 'unknown',
                            fileUrl: uploadedResult.secure_url,
                        };
                    }
                    return null;
                })
            );
            uploadedFiles = uploadedFiles.filter(Boolean);
        }

        //* Process Web Links
        let parsedLinks = [];
        if (req.body.links !== undefined) {
            if (Array.isArray(req.body.links)) {
                parsedLinks = req.body.links;
            } else if (typeof req.body.links === 'string') {
                try {
                    parsedLinks = JSON.parse(req.body.links);
                } catch {
                    parsedLinks = [req.body.links];
                }
            }
            parsedLinks = Array.isArray(parsedLinks) ? parsedLinks.filter(l => l && typeof l === 'string' && l.trim() !== '') : [];
        }

        //* Process YouTube Links
        let parsedYouTube = [];
        if (req.body.youtubeLinks !== undefined) {
            if (Array.isArray(req.body.youtubeLinks)) {
                parsedYouTube = req.body.youtubeLinks;
            } else if (typeof req.body.youtubeLinks === 'string') {
                try {
                    parsedYouTube = JSON.parse(req.body.youtubeLinks);
                } catch {
                    parsedYouTube = [req.body.youtubeLinks];
                }
            }

            parsedYouTube = (Array.isArray(parsedYouTube) ? parsedYouTube : [])
                .map(link => {
                    if (!link || typeof link !== 'string') return null;
                    if (link.includes('youtube.com') || link.includes('youtu.be')) {
                        const match = link.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
                        return (match && match[2].length === 11) ? match[2] : link;
                    }
                    return link.trim();
                })
                .filter(Boolean);
        }

        const teacher = userId;
        const allowLate = acceptAfterDue === 'true' || acceptAfterDue === true || acceptAfterDue === 'on';

        //* Validate category if supplied
        let validCategoryId = null;
        if (category && category !== '' && category !== 'null') {
            if (mongoose.Types.ObjectId.isValid(category)) {
                const checkCategory = await Category.findById(category);
                if (checkCategory) {
                    validCategoryId = checkCategory._id;
                }
            }
        }

        //* Gather all enrolled students for pendingStudent list
        const studentsFromUsers = await User.find({ joinedClassAsStudent: currClassId }).select('_id');
        const studentIdSet = new Set(studentsFromUsers.map(s => s._id.toString()));
        if (currClass.student && Array.isArray(currClass.student)) {
            currClass.student.forEach(s => studentIdSet.add(s.toString()));
        }
        const pendingStudentIds = Array.from(studentIdSet);

        const parsedDueDate = (dueDate && typeof dueDate === 'string' && dueDate.trim() !== '' && dueDate !== 'null' && !isNaN(new Date(dueDate).getTime()))
            ? new Date(dueDate)
            : undefined;

        //* Create Assignment
        const newAss = new Assignment({
            name: name.trim(),
            description: description.trim(),
            file: uploadedFiles.length > 0 ? uploadedFiles[0].fileUrl : '',
            files: uploadedFiles,
            links: parsedLinks,
            youtubeLinks: parsedYouTube,
            totalMarks: !isNaN(Number(totalMarks)) ? Number(totalMarks) : 100,
            teacher,
            category: validCategoryId,
            dueDate: parsedDueDate,
            status,
            acceptAfterDue: allowLate,
            pendingStudent: pendingStudentIds,
            submission: []
        });

        await newAss.save();

        if (newAss.status === 'Published') {
            //* Concurrently add assignment reference to class and category (if provided)
            const updateOps = [
                Class.findByIdAndUpdate(currClassId, {
                    $addToSet: {
                        addedAssignment: newAss._id
                    }
                })
            ];

            if (validCategoryId) {
                updateOps.push(
                    Category.findByIdAndUpdate(validCategoryId, {
                        $addToSet: {
                            assignment: newAss._id
                        }
                    })
                );
            }

            await Promise.all(updateOps);
        }

        const populatedAss = await Assignment.findById(newAss._id)
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

        if (newAss.status === 'Published') {
            getIO().to(`room:${currClassId}`).emit('assignment:new', { data: populatedAss });
            getIO().to(`room:${currClassId}`).emit('todo:updated', { classId: currClassId, assignmentId: newAss._id });
            return res.status(201).json({
                success: true,
                message: "Assignment Created Successfully",
                newAss: populatedAss,
                data: populatedAss
            });
        } else {
            return res.status(201).json({
                success: true,
                message: "Assignment Drafted Successfully",
                newAss: populatedAss,
                data: populatedAss
            });
        }

    } catch (err) {
        next(err);
    }
};