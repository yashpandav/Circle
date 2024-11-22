const User = require("../../Models/User");
const OTP = require("../../Models/OTP");
const Profile = require("../../Models/Profile");
const { sendMail } = require("../../Utils/mailSender");
const bcrypt = require("bcrypt");

exports.forgotPassword = async (req, res) => {
    try {
        const { email, otp, newPassword, confirmPassword } = req.body;

        if (!email || !otp || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match",
            });
        }

        const findUser = await User.findOne({ email });

        if (!findUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const latestOTP = await OTP.findOne({ email }).sort({ createdAt: -1 }).limit(1);

        if (!latestOTP || latestOTP.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP",
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updatedUser = await User.findByIdAndUpdate(
            findUser.id,
            { password: hashedPassword },
            { new: true }
        );

        await sendMail(
            updatedUser.email,
            "Password Reset Successful",
            "Your password has been successfully reset."
        );

        return res.status(200).json({
            success: true,
            message: "Password reset successful",
            data : updatedUser
        });

    } catch (err) {
        console.error("Error during forgot password:", err);
        return res.status(500).json({
            success: false,
            message: "Error during forgot password:",
            error: err.message,
        });
    }
};
