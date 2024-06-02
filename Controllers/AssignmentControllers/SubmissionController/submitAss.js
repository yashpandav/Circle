const User = require('../../../Models/User');
const Assignment = require('../../../Models/Assignment');
const SubmitAssignment = require('../../../Models/SubmitAssignment');
const { uploadImage } = require('../../../Utils/imageUpload');
require('dotenv').config();

exports.submitAss = async (req, res) => {
    try {
        const { assId, data, submittedID } = req.body;
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

        let currSubmitted = await SubmitAssignment.findById(submittedID);

        //* IF ASSIGNMENT IS ALREADY SUBMITTED
        if (currSubmitted) {
            // TODO: Add confirmation message that asks if the user is sure about overwriting the previous submission
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

        return res.status(200).json({
            success: true,
            message: "Assignment submitted successfully",
            data: {
                assignment: assDetails,
                submission: newSubmission
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Error while submitting assignment"
        });
    }
}
