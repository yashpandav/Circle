const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
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