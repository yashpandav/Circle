const User = require('../../../Models/User');
const Assignment = require('../../../Models/Assignment');
const SubmitAssignment = require('../../../Models/SubmitAssignment');

exports.submitAss = async (req, res) => {
    try {
        const assId = req.body.assId;
        const submitedID = req.body.submittedID;

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
                message: "Assignment Due Date Over , You can't make changes"
            });
        }

        // TODO : Add conirmation message that are you sure want to DELETE submission
        let currSubmitted = await SubmitAssignment.findByIdAndDelete(submitedID);
        await Assignment.findByIdAndUpdate(assId, {
            $pull: { submission: submitedID },
            $push: {pendingStudent : req.user.id}
        });

        return res.status(200).json({
            success: true,
            message: "Assignment Deleted Successfully",
            currSubmitted
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Error While Deleting Assignment"
        });
    }
}