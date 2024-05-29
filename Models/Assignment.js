const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema({
	assName: { 
        type: String 
    },
	assDescription: { 
        type: String 
    },
	assFile: {
        type : String
    },
	assCategory: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Category",
	},
	teacher: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "User",
	},
    comment : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref : "Comment"
        }
    ],
	uploadDate: {
		type: Date,
	},
	dueDate: {
		type: Date,
	},
	submitedStudent: [
		{
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},
	],
	pendingStudent: [
		{
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},
	],
    status: {
        type: String,
        enum: ["Draft", "Published"]
    },
    acceptAfterDue : {
        type : Boolean,
		default : false
    }
    }
);

module.exports = mongoose.model("Assignment", AssignmentSchema);