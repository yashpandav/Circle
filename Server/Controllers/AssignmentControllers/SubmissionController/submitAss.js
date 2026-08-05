const mongoose = require('mongoose');
const User = require('../../../Models/User');
const Assignment = require('../../../Models/Assignment');
const SubmitAssignment = require('../../../Models/SubmitAssignment');
const Class = require('../../../Models/Class');
const { uploadImage } = require('../../../Utils/imageUpload');
const { deleteFromCloudinary } = require('../../../Utils/cloudinaryDelete');
const { getIO } = require('../../../socket');
require('dotenv').config();

exports.submitAss = async (req, res, next) => {
    try {
        const assId = req.params.id;
        const { data, submittedID, overwrite } = req.body;
        let file = req.files?.file;

        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User identification missing"
            });
        }

        if (!assId || !mongoose.Types.ObjectId.isValid(assId)) {
            return res.status(400).json({
                success: false,
                message: "Valid Assignment ID is required"
            });
        }

        if (!file && (!data || !data.trim())) {
            return res.status(400).json({
                success: false,
                message: "A file attachment or text note is required to submit"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const assDetails = await Assignment.findById(assId);
        if (!assDetails) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found"
            });
        }

        const classForAss = await Class.findOne({ addedAssignment: assId });
        if (classForAss) {
            const isStudentEnrolled = classForAss.student && classForAss.student.some(s => s.toString() === userId.toString());
            const isClassAdmin = classForAss.admin && classForAss.admin.toString() === userId.toString();
            const isClassTeacher = classForAss.teacher && classForAss.teacher.some(t => t.toString() === userId.toString());

            if (!isStudentEnrolled && !isClassAdmin && !isClassTeacher) {
                return res.status(403).json({
                    success: false,
                    message: "You are not enrolled in this Circle to submit assignments."
                });
            }
        }

        // Check due date & late submission policy
        if (assDetails.dueDate && Date.now() > new Date(assDetails.dueDate).getTime() && !assDetails.acceptAfterDue) {
            return res.status(403).json({
                success: false,
                message: "Assignment due date has passed. Late submissions are not accepted."
            });
        }

        // Find existing submission
        let currSubmitted = null;
        if (submittedID && mongoose.Types.ObjectId.isValid(submittedID)) {
            currSubmitted = await SubmitAssignment.findById(submittedID);
        } else {
            currSubmitted = await SubmitAssignment.findOne({
                assignment: assId,
                student: userId
            });
        }

        const isOverwriteConfirmed = overwrite === true || overwrite === 'true';

        //* If assignment was already submitted
        if (currSubmitted) {
            if (currSubmitted.student.toString() !== userId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to modify this submission"
                });
            }

            if (!isOverwriteConfirmed) {
                return res.status(409).json({
                    success: false,
                    overwriteRequired: true,
                    message: "Assignment already submitted. Do you want to overwrite?"
                });
            }

            // Overwrite confirmed: update existing submission
            if (file) {
                const oldFile = currSubmitted.file;
                const uploaded = await uploadImage(file, process.env.FOLDER_NAME);
                if (oldFile) {
                    await deleteFromCloudinary(oldFile);
                }
                currSubmitted.file = uploaded.secure_url;
            }
            if (data !== undefined) {
                currSubmitted.data = data;
            }
            currSubmitted.status = 'SUBMITTED';
            currSubmitted.marks = null;
            currSubmitted.submitDate = Date.now();
            await currSubmitted.save();

            const updatedAssignment = await Assignment.findByIdAndUpdate(assId, {
                $addToSet: { submission: currSubmitted._id },
                $pull: { pendingStudent: userId }
            }, { new: true });

            const populatedSubmission = await SubmitAssignment.findById(currSubmitted._id)
                .populate('student', 'firstName lastName image email');

            if (classForAss) {
                getIO().to(`room:${classForAss._id.toString()}`).emit('assignment:submitted', {
                    data: {
                        assignmentId: assId,
                        submission: populatedSubmission,
                        studentId: userId.toString()
                    }
                });
                getIO().to(`room:${classForAss._id.toString()}`).emit('todo:updated', {
                    classId: classForAss._id.toString(),
                    assignmentId: assId,
                    studentId: userId.toString()
                });
            }
            getIO().to(`user:${userId.toString()}`).emit('todo:updated', {
                classId: classForAss?._id?.toString(),
                assignmentId: assId,
                studentId: userId.toString()
            });

            return res.status(200).json({
                success: true,
                message: "Assignment submitted successfully",
                data: {
                    assignment: updatedAssignment,
                    submission: populatedSubmission
                }
            });
        }

        // New Submission
        let fileUrl = '';
        if (file) {
            const uploaded = await uploadImage(file, process.env.FOLDER_NAME);
            fileUrl = uploaded.secure_url;
        }

        const newSubmission = new SubmitAssignment({
            data: data || '',
            file: fileUrl,
            student: userId,
            assignment: assId,
            status: 'SUBMITTED',
            marks: null,
            submitDate: Date.now()
        });

        await newSubmission.save();

        const updatedAssignment = await Assignment.findByIdAndUpdate(assId, {
            $addToSet: { submission: newSubmission._id },
            $pull: { pendingStudent: userId }
        }, { new: true });

        const populatedSubmission = await SubmitAssignment.findById(newSubmission._id)
            .populate('student', 'firstName lastName image email');

        if (classForAss) {
            getIO().to(`room:${classForAss._id.toString()}`).emit('assignment:submitted', {
                data: {
                    assignmentId: assId,
                    submission: populatedSubmission,
                    studentId: userId.toString()
                }
            });
            getIO().to(`room:${classForAss._id.toString()}`).emit('todo:updated', {
                classId: classForAss._id.toString(),
                assignmentId: assId,
                studentId: userId.toString()
            });
        }
        getIO().to(`user:${userId.toString()}`).emit('todo:updated', {
            classId: classForAss?._id?.toString(),
            assignmentId: assId,
            studentId: userId.toString()
        });

        return res.status(200).json({
            success: true,
            message: "Assignment submitted successfully",
            data: {
                assignment: updatedAssignment,
                submission: populatedSubmission
            }
        });

    } catch (err) {
        next(err);
    }
};
