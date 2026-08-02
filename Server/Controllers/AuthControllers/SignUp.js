const User = require('../../Models/User');
const OTP = require('../../Models/OTP');
const Profile = require('../../Models/Profile');
const { sendMail } = require('../../Utils/mailSender');
const { successSignUp } = require('../../Mail/successAccount');
const bcrypt = require('bcrypt');
exports.signUp = async (req, res, next) => {
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

        //* Generate profile URL with a random premium color
        const bgColors = ['4285f4', '34a853', 'ea4335', 'fbbc05', '00897b', '7e57c2', '001f3f', '800000'];
        const randomBg = bgColors[Math.floor(Math.random() * bgColors.length)];
        const profileURL = `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=${randomBg}&color=fff&bold=true`;

        //* Create profile
        const profile = new Profile({
            gender: null,
            dob: null,
            about: null,
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
        try {
            await sendMail(
                savedUser.email,
                "Account Created Successfully",
                successSignUp(savedUser.firstName, savedUser.lastName)
            );
        } catch (mailErr) {
            console.error("Failed to send signup email:", mailErr);
        }

        savedUser.password = undefined;

        return res.status(201).json({
            success: true,
            message: "Sign-up completed successfully",
            data: savedUser,
        });

    } catch (err) {
        next(err);
    }
};
