const mongoose = require('mongoose');
const Assignment = require('../../Models/Assignment');
const Class = require('../../Models/Class');

exports.getAssDetails = async (req, res, next) => {
    try {
        const id = req.params.id;

        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User identification missing"
            });
        }

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Valid Assignment ID is required"
            });
        }

        const currAss = await Assignment.findById(id)
            .populate({
                path: "submission",
                populate: [
                    { path: "student", select: "firstName lastName image email" },
                    { path: "reviewedBy", select: "firstName lastName image email" }
                ]
            })
            .populate("teacher", "firstName lastName image email")
            .populate("pendingStudent", "firstName lastName image email")
            .populate({
                path: "comment",
                populate: {
                    path: "user",
                    select: "firstName lastName image"
                }
            })
            .populate("category", "name");

        if (!currAss) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found"
            });
        }

        const parentClass = await Class.findOne({ addedAssignment: id });
        if (parentClass) {
            const isTeacher = currAss.teacher && currAss.teacher._id.toString() === userId.toString();
            const isClassAdmin = parentClass.admin && parentClass.admin.toString() === userId.toString();
            const isClassTeacher = parentClass.teacher && parentClass.teacher.some(t => t.toString() === userId.toString());
            const isEnrolledStudent = parentClass.student && parentClass.student.some(s => s.toString() === userId.toString());

            const isAuthorized = isTeacher || isClassAdmin || isClassTeacher || isEnrolledStudent;

            if (!isAuthorized) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to view this assignment"
                });
            }

            // If assignment is still a Draft, only teachers/admins can view it
            if (currAss.status === 'Draft' && !isTeacher && !isClassAdmin && !isClassTeacher) {
                return res.status(403).json({
                    success: false,
                    message: "This assignment is currently in draft mode and not available to students."
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: "Assignment found",
            data: currAss
        });

    } catch (err) {
        next(err);
    }
};