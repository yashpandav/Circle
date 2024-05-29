const mongoose = require("mongoose");

const ToDoSchema = new mongoose.Schema({
	assignment :[
        {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Assignment",
		},
    ],
});

module.exports = mongoose.model("TODO", ToDoSchema);