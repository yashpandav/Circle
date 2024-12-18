const User = require('../../../Models/User');
const Assignment = require('../../../Models/Assignment');
const SubmitAssignment = require('../../../Models/SubmitAssignment');

exports.deleteSubmittedAss = async (req, res) => {
    try {
        const { assId, submittedID } = req.body;

        if (!assId || !submittedID) {
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

        if (Date.now() > assDetails.dueDate && !assDetails.acceptAfterDue) {
            return res.status(403).json({
                success: false,
                message: "Assignment Due Date Over, You can't make changes"
            });
        }

        const currSubmitted = await SubmitAssignment.findByIdAndDelete(submittedID);
        if (!currSubmitted) {
            return res.status(404).json({
                success: false,
                message: "Submission Not Found"
            });
        }

        await Assignment.findByIdAndUpdate(assId, {
            $pull: { submission: submittedID },
            $push: { pendingStudent: req.user.id }
        });

        return res.status(200).json({
            success: true,
            message: "Assignment Deleted Successfully",
            data: currSubmitted
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Error While Deleting Assignment"
        });
    }
};
