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

        let file = req.files?.file;
        let fileUrl = '';
        if (file) {
            const uploaded = await uploadImage(file, process.env.FOLDER_NAME);
            fileUrl = uploaded.secure_url;
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
            file: fileUrl,
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
            //* Add assignment reference to class
            await Class.findByIdAndUpdate(currClassId, {
                $addToSet: {
                    addedAssignment: newAss._id
                }
            });

            //* Add to category if provided
            if (validCategoryId) {
                await Category.findByIdAndUpdate(validCategoryId, {
                    $addToSet: {
                        assignment: newAss._id
                    }
                });
            }
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