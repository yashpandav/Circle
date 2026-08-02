const mongoose = require("mongoose");

const SumitAssignmentSchema = new mongoose.Schema({
	data: { 
        type: String 
    },
	file: {
        type : String
    },
    student : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    submitDate : {
        type : Date,
        default : Date.now
    }
});

const SubmitAssignment = mongoose.models.SubmitAssignment || mongoose.model("SubmitAssignment", SumitAssignmentSchema);
if (!mongoose.models.SumitAssignment) {
    mongoose.model("SumitAssignment", SumitAssignmentSchema);
}
module.exports = SubmitAssignment;