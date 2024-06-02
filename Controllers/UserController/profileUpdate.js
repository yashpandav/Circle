const User = require('../../Models/User');
const Profile = require('../../Models/Profile');
const { uploadImage } = require('../../Utils/imageUpload');
require('dotenv').config();

exports.updateProfile = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            gender,
            dob,
            about
        } = req.body;

        const id = req.params.userId;

        let image = req?.files?.image;

        let currUser = await User.findById(id);
        if (!currUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (image) {
            const imageURL = await uploadImage(image, process.env.FOLDER_NAME);
            image = imageURL.secure_url;
        }

        let profile = await Profile.findById(currUser.additionalDetails);

        if (!profile) {
            profile = new Profile({
                gender,
                dob,
                about
            });
            await profile.save();
            currUser.additionalDetails = profile.id;
        } else {
            profile.gender = gender || profile.gender;
            profile.dob = dob || profile.dob;
            profile.about = about || profile.about;
            await profile.save();
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
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message
        });
    }
}
