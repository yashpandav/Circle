const User = require('../../Models/User');
const Profile = require('../../Models/Profile');
const {uploadImage} = require('../../Utils/imageUpload')
require('dotenv').config();


exports.updateProfile = async (req , res) => {
    try{
        const{
            id,
            firstName,
            lastName,
            gender,
            dob,
            about
        } = req.body;

        let image = req.files?.image;
        console.log(id)
        let currUser = await User.findById(id);
        if(!currUser){
            return res.status(401).json({
                success: false,
                message: "User Not Found"
            });
        }
        console.log(currUser);
        if(image){
            const imageURL = await uploadImage(image , process.env.FOLDER_NAME);
            image = imageURL.secure_url;
        }
        const prevPofile = await Profile.findById(currUser?.additionalDetails);
        if(!prevPofile){
            let additionalDetails = await Profile.create({
                gender,
                dob,
                about
            })
            currUser.additionalDetails = additionalDetails.id;
        }
        else{
            prevPofile.gender = gender || prevPofile.gender;
            prevPofile.dob = dob || prevPofile.dob;
            prevPofile.about = about || prevPofile.about;
            await prevPofile.save();
        }
        currUser.firstName = firstName || currUser.firstName;
        currUser.lastName = lastName || currUser.lastName;
        currUser.image = image || currUser.image;
        await currUser.save();

        return res.status(200).json({
            success: true,
            message: "Profile Updated Successfully",
            data: currUser
        });
    }catch(err){
        console.log(err);
        return res.status(401).json({
            success: false,
            message: err.messagem,
            data : "Error while updating Profile"
        })
    }
}