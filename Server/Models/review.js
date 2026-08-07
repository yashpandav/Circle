const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
	byClass : [
		{
			classId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Class',
			},
			reviewdAss : [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: "Assignment",
				}
			],
			notReviedAss : [
				{
					type: mongoose.Schema.Types.ObjectId,
					ref: "Assignment",
				}
			],
		}
	]
}, { timestamps: true });

ReviewSchema.index({ user: 1 });
ReviewSchema.index({ "byClass.classId": 1 });

module.exports = mongoose.model("Review", ReviewSchema);