const mongoose = require("mongoose");

const SubmitAssignmentSchema = new mongoose.Schema({
    data: { 
        type: String 
    },
    file: {
        type: String
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment"
    },
    submitDate: {
        type: Date,
        default: Date.now
    }
});

const SubmitAssignment = mongoose.models.SubmitAssignment || mongoose.model("SubmitAssignment", SubmitAssignmentSchema);
if (!mongoose.models.SumitAssignment) {
    mongoose.model("SumitAssignment", SubmitAssignmentSchema);
}
module.exports = SubmitAssignment;