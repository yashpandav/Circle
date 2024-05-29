const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
	assingment :[
        {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Assignment",
		},
    ],
});

module.exports = mongoose.model("Review", ReviewSchema);