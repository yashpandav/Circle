const mongoose = require('mongoose');
const User = require('../../../Models/User');
const Assignment = require('../../../Models/Assignment');
const SubmitAssignment = require('../../../Models/SubmitAssignment');
const Class = require('../../../Models/Class');
const { uploadImage } = require('../../../Utils/imageUpload');
const { getIO } = require('../../../socket');
require('dotenv').config();

exports.editSubmimtedAss = async (req, res, next) => {
    try {
        const assId = req.params.id;
        const { submitedID, submittedID, data } = req.body;
        let file = req.files?.file;
        const submissionTargetId = submitedID || submittedID;

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

        const assDetails = await Assignment.findById(assId);
        if (!assDetails) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found"
            });
        }

        // Check due date and late submission policy
        if (assDetails.dueDate && Date.now() > new Date(assDetails.dueDate).getTime() && !assDetails.acceptAfterDue) {
            return res.status(403).json({
                success: false,
                message: "Assignment due date has passed. Late edits are not allowed."
            });
        }

        let currSubmitted = null;
        if (submissionTargetId && mongoose.Types.ObjectId.isValid(submissionTargetId)) {
            currSubmitted = await SubmitAssignment.findById(submissionTargetId);
        } else {
            currSubmitted = await SubmitAssignment.findOne({
                assignment: assId,
                student: userId
            });
        }

        if (!currSubmitted) {
            return res.status(404).json({
                success: false,
                message: "Submission not found"
            });
        }

        if (currSubmitted.student.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to edit this submission"
            });
        }

        if (file) {
            const uploaded = await uploadImage(file, process.env.FOLDER_NAME);
            currSubmitted.file = uploaded.secure_url;
        }

        if (data !== undefined) {
            currSubmitted.data = data;
        }

        currSubmitted.submitDate = Date.now();
        await currSubmitted.save();

        // Ensure assignment references are clean
        await Assignment.findByIdAndUpdate(assId, {
            $addToSet: { submission: currSubmitted._id },
            $pull: { pendingStudent: userId }
        });

        const updatedSubmission = await SubmitAssignment.findById(currSubmitted._id)
            .populate('student', 'firstName lastName image email');

        const classForAss = await Class.findOne({ addedAssignment: assId });
        if (classForAss) {
            getIO().to(`room:${classForAss._id.toString()}`).emit('assignment:submission_updated', {
                data: updatedSubmission,
                assId,
                studentId: userId.toString()
            });
            getIO().to(`room:${classForAss._id.toString()}`).emit('todo:updated', {
                classId: classForAss._id.toString(),
                assId,
                studentId: userId.toString()
            });
        }
        getIO().to(`user:${userId.toString()}`).emit('todo:updated', {
            classId: classForAss?._id?.toString(),
            assId,
            studentId: userId.toString()
        });

        return res.status(200).json({
            success: true,
            message: "Assignment Edited Successfully",
            data: updatedSubmission
        });

    } catch (err) {
        next(err);
    }
};