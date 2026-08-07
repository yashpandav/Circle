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
}, { timestamps: true });

CommentSchema.index({ user: 1 });
CommentSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Comment", CommentSchema);