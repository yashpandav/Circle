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
        default : Date.now()
    }
    }
);
module.exports = mongoose.model("SumitAssignment", SumitAssignmentSchema);