const mongoose = require("mongoose");
const randomColor = require('randomcolor');
const ClassSchema = new mongoose.Schema({
	name: { 
        type: String,
        required : true
    },
	description: { 
        type: String ,
        required : true
    },
    subject : {
        type : String
    },
    classTheme : {
        type : String,
        default : randomColor()
    },
	createDate: {
		type: Date,
        default : Date.now()
	},
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
	thumbnail: {
		type: String,
	},
    entryCode : {
        type : String
    },
    entryUrl : {
        type : String
    },
	student: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
    ],
    teacher: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    addedAssignment : [
        {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Assignment",
		},
    ],
    addedCategory : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Category"
        }
    ],
    addedPost : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Post"
        }
    ]
    // submittedAss : [
    //     {
	// 		type: mongoose.Schema.Types.ObjectId,
	// 		ref: "Assignment",
    //     }
    // ],
	// finishedAss : [
	// 	{
	// 		type : mongoose.Schema.Types.ObjectId,
    //         ref : "Assignment",
	// 	}
	// ],
    }
);

module.exports = mongoose.model("Class", ClassSchema);