const User = require('../../Models/User');
const bcrypt = require('bcrypt');

exports.changePassword = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Login required"
            });
        }

        const { oldPassword, newPassword, confirmNewPassword } = req.body;

        if (!oldPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide old password, new password, and confirm new password"
            });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "New password and confirm password do not match"
            });
        }

        if (oldPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: "New password should be different from the old one"
            });
        }

        const userDetails = await User.findById(req.user.id);

        const isPasswordMatch = await bcrypt.compare(oldPassword, userDetails.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Incorrect old password"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updatedUser = await User.findByIdAndUpdate(req.user.id, 
            {
                password: hashedPassword 
            }, { new: true });

        return res.status(200).json({
            success: true,
            message: "Password updated successfully",
            date :updatedUser
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Error while changing password",
            error: err.message
        });
    }
};