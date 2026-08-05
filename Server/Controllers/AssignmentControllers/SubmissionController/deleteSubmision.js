const mongoose = require('mongoose');
const User = require('../../../Models/User');
const Assignment = require('../../../Models/Assignment');
const SubmitAssignment = require('../../../Models/SubmitAssignment');
const Class = require('../../../Models/Class');
const { getIO } = require('../../../socket');
const { deleteFromCloudinary } = require('../../../Utils/cloudinaryDelete');

exports.deleteSubmittedAss = async (req, res, next) => {
    try {
        const assId = req.body.assId || req.query.assId || req.params.id;
        const submittedID = req.body.submittedID || req.query.submittedID;

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

        // Check due date and late policy
        if (assDetails.dueDate && Date.now() > new Date(assDetails.dueDate).getTime() && !assDetails.acceptAfterDue) {
            return res.status(403).json({
                success: false,
                message: "Assignment due date has passed. Submissions cannot be unsubmitted."
            });
        }

        let currSubmitted = null;
        if (submittedID && mongoose.Types.ObjectId.isValid(submittedID)) {
            currSubmitted = await SubmitAssignment.findById(submittedID);
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

        const classForAss = await Class.findOne({ addedAssignment: assId });

        // Authorization check: Submitter OR Class Admin / Teacher
        const isOwner = currSubmitted.student.toString() === userId.toString();
        const isClassAdmin = classForAss?.admin && classForAss.admin.toString() === userId.toString();
        const isClassTeacher = classForAss?.teacher && classForAss.teacher.some(t => t.toString() === userId.toString());

        if (!isOwner && !isClassAdmin && !isClassTeacher) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to unsubmit this assignment"
            });
        }

        // Students cannot unsubmit an already graded and accepted assignment
        if (isOwner && !isClassAdmin && !isClassTeacher && currSubmitted.status === 'ACCEPTED') {
            return res.status(403).json({
                success: false,
                message: "This assignment has already been graded by your teacher and cannot be unsubmitted."
            });
        }

        const studentId = currSubmitted.student;
        const submissionId = currSubmitted._id;

        // Clean up submission file from Cloudinary
        if (currSubmitted.file) {
            await deleteFromCloudinary(currSubmitted.file);
        }

        // Delete the submission document
        await SubmitAssignment.findByIdAndDelete(submissionId);

        // Update assignment document
        await Assignment.findByIdAndUpdate(assId, {
            $pull: { submission: submissionId },
            $addToSet: { pendingStudent: studentId }
        });

        if (classForAss) {
            getIO().to(`room:${classForAss._id.toString()}`).emit('assignment:submission_deleted', {
                submittedID: submissionId,
                assId,
                studentId: studentId.toString()
            });
            getIO().to(`room:${classForAss._id.toString()}`).emit('todo:updated', {
                classId: classForAss._id.toString(),
                assId,
                studentId: studentId.toString()
            });
        }
        getIO().to(`user:${studentId.toString()}`).emit('todo:updated', {
            classId: classForAss?._id?.toString(),
            assId,
            studentId: studentId.toString()
        });

        return res.status(200).json({
            success: true,
            message: "Assignment unsubmitted successfully",
            data: currSubmitted
        });

    } catch (err) {
        next(err);
    }
};
