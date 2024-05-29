const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    firstName : {
        type : String,
        trim  : true,
        required : true
    },
    lastName : {
        type : String,
        trim  : true,
        required : true
    },
    email : {
        type : String,
        trim  : true,
        required : true
    },
    password : {
        type : String,
        required : true,
        required : true
    },
    image : {
        type : String,
    },
    token : {
        type : String
    },
    active : {
        type : Boolean
    },
    approved : {
        type : Boolean,
        default : true,
    },
    additionalDetails : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Profile",
        required : true
    },
    createdClasses :[
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Class"
        },
    ],
    joinedClassAsAteacher :[
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Class"
        },
    ],
    joinedClassAsStudent :[
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Class"
        },
    ],
    resetPasswordExpires : {
        type: Date,
    },
    assignment : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Assignment"
        }
    ],
    submittedAss : [
        {
            type :  mongoose.Schema.Types.ObjectId,
            ref : "Assignment"
        }
    ],
    comment : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Comment"
        }
    ],
    post : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Post"
        }
    ],
    todo : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "TODO"
    },
    reviewList :{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Review"
    }
})

module.exports = mongoose.model("User", UserSchema);