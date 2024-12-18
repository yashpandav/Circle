const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema({
	name: { 
        type: String 
    },
	description: { 
        type: String 
    },
	file: {
        type : String
    },
	category: {
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
		default : Date.now()
	},
	dueDate: {
		type: Date,
		default : Date.now() * 3 * 24 * 60 * 60 * 1000
	},
	submission : [
		{
			type: mongoose.Schema.Types.ObjectId,
            ref: "SumitAssignment",
		}
	],
	pendingStudent: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],
    status: {
        type: String,
        enum: ["Draft", "Published"],
		default : "Published",
    },
    acceptAfterDue : {
        type : Boolean,
		default : false
    }
    }
);

module.exports = mongoose.model("Assignment", AssignmentSchema);