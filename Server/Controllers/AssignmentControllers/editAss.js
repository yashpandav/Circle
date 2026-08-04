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
            removeFile,
            currClassId
        } = req.body;

        let file = req?.files?.file;

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

        //* Authorizing teacher or admin
        const isAuthorized = (findAss.teacher && findAss.teacher.toString() === userId.toString()) ||
            (parentClass && parentClass.admin && parentClass.admin.toString() === userId.toString()) ||
            (parentClass && parentClass.teacher && parentClass.teacher.some(t => t.toString() === userId.toString()));

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to edit this assignment",
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

        //* Uploading new file or removing existing
        if (file) {
            const oldFile = findAss.file;
            const image = await uploadImage(file, process.env.FOLDER_NAME);
            if (oldFile) {
                await deleteFromCloudinary(oldFile);
            }
            findAss.file = image.secure_url;
        } else if (removeFile === 'true' || removeFile === true) {
            if (findAss.file) {
                await deleteFromCloudinary(findAss.file);
            }
            findAss.file = '';
        }

        //* Updating standard fields
        if (name !== undefined && name.trim()) findAss.name = name.trim();
        if (description !== undefined) findAss.description = description;
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