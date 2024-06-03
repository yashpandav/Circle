const Assignment = require('../../Models/Assignment');

exports.getAssDetails = async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Assignment ID is required"
            });
        }

        const currAss = await Assignment.findById(id)
            ?.populate("comment")
            .populate("teacher")
            .populate("submitedStudent")
            .populate("pendingStudent");

        if (!currAss) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Assignment found",
            data: currAss
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Error while getting details of assignment"
        });
    }
}