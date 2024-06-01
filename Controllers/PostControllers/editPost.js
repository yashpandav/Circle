const Post = require('../../Models/Post');
const User = require('../../Models/User');
const Category = require('../../Models/Category');
const {uploadImage} = require('../../Utils/imageUpload');
require('dotenv').config();

exports.editPost = async (req , res) => {
    try{

        const postId = req.params.postId;

        const{
            title ,
            postBody ,
            category ,
        } = req?.body;

        let postFile = req?.files?.postFile;

        if(!postId){
            return res.status(401).json({
                success : false,
                message : "Please Enter Post Id"
            })
        }

        let findPost = await Post.findById(postId);
        if(!findPost){
            return res.status(401).json({
                success : false,
                message : "Post Not Found"
            })
        }

        if(findPost.teacher !== req.user.id){
            return res.status(401).json({
                success : false,
                message : "You are not authorized to edit this Post"
            })
        }

        if(category){
            let currCategory = await Category.findOne({ category});
            if(!currCategory){
                return res.status(404).json({
                    success : false,
                    message : "Category Not Found"
                });
            }
            let prevCategory = await Category.findById(findPost.category);
            prevCategory.post.pull(postId);
            currCategory.post.push(postId);
            prevCategory.save();
            currCategory.save();
            findPost.category = currCategory.id;
        }
        else{
            findPost.category = findPost.category;
        }

        if(postFile){
            const image = await uploadImage(postFile , process.env.FOLDER_NAME);
            postFile = image.secure_url;
        }

        findPost.title = title || findPost.title;
        findPost.postBody = postBody || findPost.postBody;
        findPost.postFile = postFile || findPost.postFile;
        await findPost.save();

        return res.status(200).json({
            success : true,
            message : "Post Edited Successfully",
            findPost
        })

    }catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while editing the Post"
        });
    }
}