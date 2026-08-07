const mongoose = require("mongoose");

const SubmitAssignmentSchema = new mongoose.Schema({
    data: {
        type: String,
        default: ""
    },
    file: {
        type: String,
        default: ""
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment"
    },
    submitDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['ASSIGNED', 'SUBMITTED', 'ACCEPTED', 'MISSED', 'REJECTED'],
        default: 'SUBMITTED'
    },
    marks: {
        type: Number,
        default: null
    },
    maxMarks: {
        type: Number,
        default: 100
    },
    feedback: {
        type: String,
        default: ""
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    reviewedAt: {
        type: Date
    }
}, { timestamps: true });

SubmitAssignmentSchema.index({ assignment: 1, student: 1 });
SubmitAssignmentSchema.index({ assignment: 1, status: 1 });
SubmitAssignmentSchema.index({ student: 1 });
SubmitAssignmentSchema.index({ status: 1 });
SubmitAssignmentSchema.index({ submitDate: -1 });

module.exports = mongoose.models.SubmitAssignment || mongoose.model("SubmitAssignment", SubmitAssignmentSchema);