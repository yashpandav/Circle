const User = require('../../Models/User');
const bcrypt = require('bcrypt');
const OTP = require('../../Models/OTP');

exports.forgotPassword = async (req, res) => {
    try {
        const { otp, newPassword, confirmNewPassword, email } = req.body;

        if (!otp || !newPassword || !confirmNewPassword || !email) {
            return res.status(400).json({
                success: false,
                message: "All fields are required.",
            });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "New password and confirm password do not match.",
            });
        }

        const latestOTP = await OTP.findOne({ email }).sort({ createdAt: -1 }).limit(1);

        if (!latestOTP) {
            return res.status(404).json({
                success: false,
                message: "No OTP found for this email. Please request a new one.",
            });
        }

        if (latestOTP.otp !== otp) {
            return res.status(401).json({
                success: false,
                message: "Invalid OTP. Please try again.",
            });
        }

        if (new Date() > new Date(latestOTP.expiresAt)) {
            return res.status(401).json({
                success: false,
                message: "OTP has expired. Please request a new one.",
            });
        }

        const userDetails = await User.findOne({ email });

        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "No user found with this email address.",
            });
        }
        const isPasswordMatch = await bcrypt.compare(newPassword, userDetails.password);
        if (isPasswordMatch) {
            return res.status(400).json({
                success: false,
                message: "The new password cannot be the same as the old password.",
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updatedUser = await User.findByIdAndUpdate(
            userDetails._id,
            { password: hashedPassword },
            { new: true }
        );

        await OTP.deleteMany({ email });

        return res.status(200).json({
            success: true,
            message: "Password changed successfully.",
            data: updatedUser,
        });

    } catch (err) {
        console.error("Error occurred during forgotPassword process:", err);

        return res.status(500).json({
            success: false,
            message: "An error occurred while processing your request.",
            error: err.message,
        });
    }
};
