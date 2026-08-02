const User = require('../../../Models/User');
const Assignment = require('../../../Models/Assignment');
const SubmitAssignment = require('../../../Models/SubmitAssignment');
const Class = require('../../../Models/Class');
const { uploadImage } = require('../../../Utils/imageUpload');
const { getIO } = require('../../../socket');
require('dotenv').config();

const editSubmittedAss = async (req, res, next) => {
    try {
        const assId = req.params.id;
        const data = req.body.data;
        let file = req?.files?.file;
        const submitedID = req.body.submittedID;
        const overwrite = req.body.overwrite === 'true' || req.body.overwrite === true;

        if (!file && !data) {
            return res.status(400).json({
                success: false,
                message: "File or Data required"
            });
        }

        if (!assId || !submitedID) {
            return res.status(400).json({
                success: false,
                message: "Assignment ID and Submission ID are required"
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User Not Found"
            });
        }

        const assDetails = await Assignment.findById(assId);
        if (!assDetails) {
            return res.status(404).json({
                success: false,
                message: "Assignment Not Found"
            });
        }

        if (Date.now() > new Date(assDetails.dueDate) && assDetails.acceptAfterDue === false) {
            return res.status(403).json({
                success: false,
                message: "Assignment Due Date Over"
            });
        }

        let currSubmitted = await SubmitAssignment.findById(submitedID);
        if (!currSubmitted) {
            return res.status(404).json({
                success: false,
                message: "Submission Not Found"
            });
        }

        if (currSubmitted.student.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to edit this submission"
            });
        }

        if (!overwrite) {
            return res.status(409).json({
                success: false,
                overwriteRequired: true,
                message: "Assignment Already Submitted. Do you want to overwrite?"
            });
        }

        //* IF ASSIGNMENT IS ALREADY SUBMITTED AND OVERWRITE CONFIRMED
        if (file) {
            const image = await uploadImage(file, process.env.FOLDER_NAME);
            file = image.secure_url;
        }
        const updatedSubmission = await SubmitAssignment.findByIdAndUpdate(submitedID, {
            data,
            file,
        }, { new: true });

        const classForAss = await Class.findOne({ addedAssignment: assId });
        if (classForAss) {
            getIO().to(`room:${classForAss._id.toString()}`).emit('assignment:submission_updated', {
                data: updatedSubmission,
                assId,
                studentId: req.user.id
            });
        }

        return res.status(200).json({
            success: true,
            message: "Assignment Edited Successfully",
            assDetails,
            data: updatedSubmission
        });

    } catch (err) {
        next(err);
    }
};

exports.editSubmittedAss = editSubmittedAss;
exports.editSubmimtedAss = editSubmittedAss;