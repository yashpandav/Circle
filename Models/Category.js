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
	]
});

module.exports = mongoose.model("Category", CategorySchema);