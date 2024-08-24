const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
    title: { 
        type: String,
        required: true
    },
    postBody: { 
        type: String,
        required: true
    },
    postFiles: [String], 
    links: [String],
    youtubeLinks: [String],
    teacher: {
        type: mongoose.Schema.Types.ObjectId,   
        required: true,
        ref: "User",
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
    },
    comment: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    uploadDate: {
        type: String,
    },
    status: {
        type: String,
        enum: ["Draft", "Published"],
        default: "Published",
    },
});

module.exports = mongoose.model("Post", PostSchema);
