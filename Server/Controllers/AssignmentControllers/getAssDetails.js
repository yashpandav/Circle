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
        const isAuthorTeacher = currAss.teacher && (currAss.teacher._id ? currAss.teacher._id.toString() : currAss.teacher.toString()) === userId.toString();
        let isClassAdmin = false;
        let isClassTeacher = false;
        let isEnrolledStudent = false;

        if (parentClass) {
            isClassAdmin = parentClass.admin && parentClass.admin.toString() === userId.toString();
            isClassTeacher = parentClass.teacher && parentClass.teacher.some(t => t && t.toString() === userId.toString());
            isEnrolledStudent = parentClass.student && parentClass.student.some(s => s && s.toString() === userId.toString());

            const isAuthorized = isAuthorTeacher || isClassAdmin || isClassTeacher || isEnrolledStudent;

            if (!isAuthorized) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to view this assignment"
                });
            }

            // If assignment is still a Draft, only author teacher or teachers can view it
            if (currAss.status === 'Draft' && !isAuthorTeacher && !isClassAdmin && !isClassTeacher) {
                return res.status(403).json({
                    success: false,
                    message: "This assignment is currently in draft mode and not available to students."
                });
            }
        }

        // Prepare response data based on role
        const assObj = currAss.toObject ? currAss.toObject() : JSON.parse(JSON.stringify(currAss));
        assObj.isAuthor = isAuthorTeacher;

        if (!isAuthorTeacher) {
            if (isEnrolledStudent) {
                // Students only see their own submission
                assObj.submission = (assObj.submission || []).filter(sub => {
                    const subStudentId = sub?.student?._id ? sub.student._id.toString() : sub?.student?.toString();
                    return subStudentId === userId.toString();
                });
                assObj.pendingStudent = [];
            } else {
                // Other teachers / admin (not the author) only see assignment content (no student submissions)
                assObj.submission = [];
                assObj.pendingStudent = [];
            }
        }

        return res.status(200).json({
            success: true,
            message: "Assignment found",
            data: assObj
        });

    } catch (err) {
        next(err);
    }
};