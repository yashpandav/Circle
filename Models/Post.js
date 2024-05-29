const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
	title: { 
        type: String,
        required : true
    },
	postBody: { 
        type: String,
        required : true
    },
	postFile: {
        type : String
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
    status: {
        type: String,
        enum: ["Draft", "Published"],
    },
    }
);

module.exports = mongoose.model("Post", PostSchema);