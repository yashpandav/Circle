const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	assignment: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Assignment",
		},
	],
	post : [
		{
			type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
		}
	],
	classId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Class",
		required: true
	}
});

module.exports = mongoose.model("Category", CategorySchema);