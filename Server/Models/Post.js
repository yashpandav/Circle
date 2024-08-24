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
    postFiles: [], 
    links: [],
    youtubeLinks: [],
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
