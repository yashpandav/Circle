const User = require('../../Models/User');
const Profile = require('../../Models/Profile');
const Class = require('../../Models/Class');
const Assignment = require('../../Models/Assignment');
const Comment = require('../../Models/Comment');
const Post = require('../../Models/Post');
const TODO = require('../../Models/ToDo');
const reviewList = require('../../Models/review');

exports.getProfile = async (req, res, next) => {
    try{
        const user = await User.findById(req.user.id)
                    ?.populate("additionalDetails")
                    .populate("createdClasses")
                    .populate("joinedClassAsAteacher")
                    .populate("joinedClassAsStudent")
                    .populate("todo")
                    .populate("reviewList");
        if(user){
            return res.status(200).json({
                success: true,
                data : user
            });
        }
        return res.status(401).json({
            success: false,
            message: "User Not Found"
        });
    }catch(err){
        next(err);
    }
}