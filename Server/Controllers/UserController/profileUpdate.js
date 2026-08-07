const User = require('../../Models/User');
const Profile = require('../../Models/Profile');
const { uploadImage } = require('../../Utils/imageUpload');
const { deleteFromCloudinary } = require('../../Utils/cloudinaryDelete');
const { getIO } = require('../../socket');
require('dotenv').config();

exports.updateProfile = async (req, res, next) => {
    try {
        const {
            firstName,
            lastName,
            gender,
            dob,
            about
        } = req.body;

        const id = req.user.id;

        let image = req?.files?.image;

        let currUser = await User.findById(id);
        if (!currUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (image) {
            const oldImage = currUser.image;
            const imageURL = await uploadImage(image, process.env.FOLDER_NAME);
            if (oldImage) {
                await deleteFromCloudinary(oldImage);
            }
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

        const updatedUser = await User.findById(id)
            .populate('additionalDetails')
            .select('-password');

        const memberUpdatePayload = {
            _id: updatedUser._id,
            id: updatedUser.id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            image: updatedUser.image,
        };

        const userClasses = [
            ...(currUser.createdClasses || []),
            ...(currUser.joinedClassAsAteacher || []),
            ...(currUser.joinedClassAsStudent || [])
        ];

        userClasses.forEach(classId => {
            if (classId) {
                getIO().to(`room:${classId.toString()}`).emit('class:member_updated', { user: memberUpdatePayload });
            }
        });

        return res.status(200).json({
            success: true,
            message: "Profile Updated Successfully",
            data: updatedUser
        });
    } catch (err) {
        next(err);
    }
}

