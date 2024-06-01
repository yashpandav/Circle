const User = require('../../../Models/User');
const Assignment = require('../../../Models/Assignment');
const SubmitAssignment = require('../../../Models/SubmitAssignment');
const {uploadImage} = require('../../../Utils/imageUpload');
require('doenv').config();

exports.submitAss = async (req, res) => {
    try {
        const assId = req.body.assId;
        const data = req.body.data;
        let file = req?.files?.file;
        const submitedID = req.body.submittedID;
        const overwrite = true; //req.body.overwrite

        if (!file && !data) {
            return res.status(401).json({
                success: false,
                message: "File Or Data required"
            });
        }

        if (!assId || !submitedID) {
            return res.status(401).json({
                success: false,
                message: "Id is required"
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User Not Found"
            });
        }

        const assDetails = await Assignment.findById(assId);
        if (!assDetails) {
            return res.status(401).json({
                success: false,
                message: "Assignment Not Found"
            });
        }

        if(Date.now() > assDetails.dueDate && assDetails.acceptAfterDue === false) {
            return res.status(401).json({
                success: false,
                message: "Assignment Due Date Over"
            });
        }

        let currSubmitted = await SubmitAssignment.findById(submitedID);

        if(!overwrite && currSubmitted){
            return res.status(401).json({
                success: false,
                message: "Assignment Already Submitted"
            });
        }

        //* IF ASSIGNMENT IS ALREDAY SUBMITTED
        if (currSubmitted && overwrite) {
            // TODO : Add conirmation message that are you sure want to overwrite previous submission
            if (file) {
                const image = await uploadImage(file , process.env.FOLDER_NAME);
                file = image.secure_url;
            }
            await SubmitAssignment.findByIdAndUpdate(submitedID , {
                data,
                file,
            });

            return res.status(200).json({
                success: true,
                message: "Assignment Edited Successfully",
                assDetails,
                newSubmission
            });
        }

        return res.status(401).json({
            status : false,
            message : "Not Found",
        })

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Error While Editing Assignment"
        });
    }
}