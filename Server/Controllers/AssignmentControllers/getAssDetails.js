const mongoose = require('mongoose');
const Assignment = require('../../Models/Assignment');
const Class = require('../../Models/Class');

exports.getAssDetails = async (req, res, next) => {
    try {
        const id = req.params.id;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Valid Assignment ID is required"
            });
        }

        const currAss = await Assignment.findById(id)
            .populate({
                path: "submission",
                populate: {
                    path: "student",
                    select: "firstName lastName image email"
                }
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
            const isAuthorized = (parentClass.admin && parentClass.admin.toString() === req.user.id) ||
                (parentClass.teacher && parentClass.teacher.some(t => t.toString() === req.user.id)) ||
                (parentClass.student && parentClass.student.some(s => s.toString() === req.user.id)) ||
                (currAss.teacher && currAss.teacher._id.toString() === req.user.id);

            if (!isAuthorized) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to view this assignment"
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