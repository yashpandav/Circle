const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	commentBody : {
		type : String ,
		required : true
	},
	user : {
		type : mongoose.Schema.Types.ObjectId,
        ref : "User"
	}
});

module.exports = mongoose.model("Comment", CommentSchema);