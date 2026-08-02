const User = require('../../../Models/User');
const Assignment = require('../../../Models/Assignment');
const SubmitAssignment = require('../../../Models/SubmitAssignment');
const Class = require('../../../Models/Class');
const { uploadImage } = require('../../../Utils/imageUpload');
const { getIO } = require('../../../socket');
require('dotenv').config();

exports.submitAss = async (req, res, next) => {
    try {
        const assId = req.params.id;
        const { data, submittedID, overwrite } = req.body;
        let file = req.files?.file;

        if (!file && !data) {
            return res.status(400).json({
                success: false,
                message: "File or Data required"
            });
        }

        if (!assId) {
            return res.status(400).json({
                success: false,
                message: "Assignment ID is required"
            });
        }

        const user = await User.findById(req.user.id);
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

        if (Date.now() > new Date(assDetails.dueDate) && !assDetails.acceptAfterDue) {
            return res.status(400).json({
                success: false,
                message: "Assignment due date over"
            });
        }

        let currSubmitted = null;
        if (submittedID) {
            currSubmitted = await SubmitAssignment.findById(submittedID);
        } else if (assDetails.submission && assDetails.submission.length > 0) {
            currSubmitted = await SubmitAssignment.findOne({
                _id: { $in: assDetails.submission },
                student: req.user.id
            });
        }

        //* IF ASSIGNMENT IS ALREADY SUBMITTED
        if (currSubmitted) {
            if (currSubmitted.student.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to modify this submission"
                });
            }

            if (!overwrite || overwrite === 'false') {
                return res.status(409).json({
                    success: false,
                    overwriteRequired: true,
                    message: "Assignment already submitted. Do you want to overwrite?"
                });
            }
            //? IF USER SAYS YES THEN CONTINUE
            await SubmitAssignment.findByIdAndDelete(submittedID);
            await Assignment.findByIdAndUpdate(assId, {
                $pull: { submission: submittedID }
            });
        }

        if (file) {
            const image = await uploadImage(file, process.env.FOLDER_NAME);
            file = image.secure_url;
        }

        const newSubmission = new SubmitAssignment({
            data,
            file,
            student: req.user.id,
            assignment: assId
        });

        await newSubmission.save();

        await Assignment.findByIdAndUpdate(assId, {
            $push: { submission: newSubmission.id },
            $pull: { pendingStudent: req.user.id }
        });

        const classForAss = await Class.findOne({ addedAssignment: assId });
        if (classForAss) {
            getIO().to(`room:${classForAss._id.toString()}`).emit('assignment:submitted', {
                data: {
                    assignment: assDetails,
                    submission: newSubmission,
                    studentId: req.user.id
                }
            });
        }

        return res.status(200).json({
            success: true,
            message: "Assignment submitted successfully",
            data: {
                assignment: assDetails,
                submission: newSubmission
            }
        });

    } catch (err) {
        next(err);
    }
}
