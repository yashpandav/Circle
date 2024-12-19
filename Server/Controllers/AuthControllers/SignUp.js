const User = require('../../Models/User');
const OTP = require('../../Models/OTP');
const Profile = require('../../Models/Profile');
const { sendMail } = require('../../Utils/mailSender');
const { successSignUp } = require('../../Mail/successAccount');
const bcrypt = require('bcrypt');
const randomColor = require('randomcolor');

exports.signUp = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            otp,
        } = req.body;

        console.log("ENTERD API IN", firstName, lastName, email, password, confirmPassword, otp);

        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        //* Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match",
            });
        }

        //* Check if user already exists
        const findUser = await User.findOne({ email });
        if (findUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        //* Check OTP
        const latestOTP = await OTP.findOne({ email }).sort({ createdAt: -1 }).limit(1);
        if (!latestOTP || latestOTP.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP",
            });
        }

        await OTP.deleteMany({ email });

        //* Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //* Generate profile URL
        const profileURL = `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=${randomColor().replace('#', '')}&color=${randomColor().replace('#', '')}&bold=true`;

        //* Create profile
        const profile = new Profile({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        });
        const savedProfile = await profile.save();

        //* Create user
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            image: profileURL,
            additionalDetails: savedProfile._id,
        });
        const savedUser = await newUser.save();

        //* Send success email
        await sendMail(
            savedUser.email,
            "Account Created Successfully",
            successSignUp(savedUser.firstName, savedUser.lastName)
        );

        return res.status(200).json({
            success: true,
            message: "Sign-up completed successfully",
            data: savedUser,
        });

    } catch (err) {
        console.error("Error during sign-up:", err);
        return res.status(500).json({
            success: false,
            message: "Error during sign-up",
            error: err.message,
        });
    }
};
