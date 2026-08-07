const mongoose = require('mongoose');
const Assignment = require('../../Models/Assignment');
const SubmitAssignment = require('../../Models/SubmitAssignment');
const Class = require('../../Models/Class');
const Review = require('../../Models/review');
const User = require('../../Models/User');
const { getIO } = require('../../socket');

/**
 * Controller to grade and review a student's submission.
 * Handles transitions:
 *  - SUBMITTED -> ACCEPTED (with marks and optional feedback)
 *  - SUBMITTED -> REJECTED (with rejection feedback)
 */
exports.gradeSubmission = async (req, res, next) => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User identification missing"
            });
        }

        const assignmentId = req.params.assignmentId || req.params.id || req.body.assignmentId || req.body.assId;
        const submissionId = req.params.submissionId || req.body.submissionId || req.body.submittedID;
        const studentId = req.body.studentId;

        const {
            marks,
            feedback = "",
            status = "ACCEPTED",
            maxMarks
        } = req.body;

        if (!assignmentId || !mongoose.Types.ObjectId.isValid(assignmentId)) {
            return res.status(400).json({
                success: false,
                message: "Valid Assignment ID is required"
            });
        }

        const targetAssignment = await Assignment.findById(assignmentId);
        if (!targetAssignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found"
            });
        }

        const parentClass = await Class.findOne({ addedAssignment: assignmentId });
        if (!parentClass) {
            return res.status(404).json({
                success: false,
                message: "Class for this assignment not found"
            });
        }

        // Authorization check: Only the teacher who created this assignment can grade/review submissions
        const isAuthorTeacher = targetAssignment.teacher && targetAssignment.teacher.toString() === userId.toString();

        if (!isAuthorTeacher) {
            return res.status(403).json({
                success: false,
                message: "Only the teacher who uploaded this assignment is authorized to grade and review submissions."
            });
        }

        // Find target submission
        let submission = null;
        if (submissionId && mongoose.Types.ObjectId.isValid(submissionId)) {
            submission = await SubmitAssignment.findById(submissionId);
        } else if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
            submission = await SubmitAssignment.findOne({
                assignment: assignmentId,
                student: studentId
            });
        }

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: "Student submission not found"
            });
        }

        // Validate status transition
        const validStatuses = ['ACCEPTED', 'REJECTED', 'SUBMITTED'];
        const targetStatus = validStatuses.includes(status?.toUpperCase()) ? status.toUpperCase() : 'ACCEPTED';

        let numericMarks = null;
        if (targetStatus === 'ACCEPTED') {
            if (marks !== undefined && marks !== null && marks !== '') {
                numericMarks = Number(marks);
                if (isNaN(numericMarks) || numericMarks < 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Marks must be a valid non-negative number"
                    });
                }
            }
        }

        const totalPoints = maxMarks || targetAssignment.totalMarks || 100;

        submission.status = targetStatus;
        submission.marks = numericMarks;
        submission.maxMarks = totalPoints;
        submission.feedback = feedback ? feedback.trim() : "";
        submission.reviewedBy = userId;
        submission.reviewedAt = new Date();

        await submission.save();

        const populatedSubmission = await SubmitAssignment.findById(submission._id)
            .populate('student', 'firstName lastName image email')
            .populate('reviewedBy', 'firstName lastName image email');

        const populatedAssignment = await Assignment.findById(assignmentId)
            .populate('teacher', 'firstName lastName image email')
            .populate('category', 'name')
            .populate('pendingStudent', 'firstName lastName image email')
            .populate({
                path: 'submission',
                populate: [
                    { path: 'student', select: 'firstName lastName image email' },
                    { path: 'reviewedBy', select: 'firstName lastName image email' }
                ]
            })
            .populate({
                path: 'comment',
                populate: { path: 'user', select: 'firstName lastName image' }
            });

        // Broadcast real-time events
        const classIdStr = parentClass._id.toString();
        const studentIdStr = submission.student ? submission.student.toString() : null;

        try {
            getIO().to(`room:${classIdStr}`).emit('assignment:graded', {
                assignmentId,
                submission: populatedSubmission,
                assignment: populatedAssignment
            });

            getIO().to(`room:${classIdStr}`).emit('assignment:submission_updated', {
                assId: assignmentId,
                data: populatedSubmission,
                studentId: studentIdStr
            });

            if (studentIdStr) {
                getIO().to(`user:${studentIdStr}`).emit('assignment:graded', {
                    assignmentId,
                    submission: populatedSubmission,
                    assignment: populatedAssignment
                });
                getIO().to(`user:${studentIdStr}`).emit('todo:updated', {
                    classId: classIdStr,
                    assignmentId,
                    studentId: studentIdStr
                });
            }

            getIO().to(`user:${userId.toString()}`).emit('review:updated', {
                assignmentId,
                status: 'Reviewed'
            });
        } catch (socketErr) {
            console.error("Socket emit error during grading:", socketErr);
        }

        return res.status(200).json({
            success: true,
            message: targetStatus === 'ACCEPTED' ? "Submission accepted and graded successfully" : "Submission rejected with feedback",
            data: {
                submission: populatedSubmission,
                assignment: populatedAssignment
            }
        });

    } catch (err) {
        next(err);
    }
};
