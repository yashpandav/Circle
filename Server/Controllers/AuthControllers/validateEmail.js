const User = require('../../Models/User');
const otpgenerator = require('otp-generator');
const OTP = require('../../Models/OTP');

const generateOtp = async (email) => {
    try {
        let otp;
        let findOTP;
        let attempts = 0;

        // Generate a unique OTP
        do {
            otp = otpgenerator.generate(6, {
                specialChars: false,
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
            });
            findOTP = await OTP.findOne({ otp });
            if (++attempts > 10) break;
        } while (findOTP);

        const finalOTP = await OTP.create({ email, otp });
        return { success: true, otp: finalOTP };
    } catch (err) {
        return { success: false, error: err.message };
    }
};

exports.validateEmail = async (req, res, next) => {
    try {
        const { email } = req.body;
        const normalizedEmail = email ? email.toLowerCase().trim() : '';

        if (!normalizedEmail) {
            return res.status(400).json({
                success: false,
                message: "Email ID is required",
            });
        }

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Generate OTP
        const otpResponse = await generateOtp(normalizedEmail);

        if (otpResponse.success) {
            return res.status(200).json({
                success: true,
                message: "OTP generated successfully"
            });
        } else {
            return res.status(422).json({
                success: false,
                message: "Failed to generate OTP",
                error: otpResponse.error,
            });
        }
    } catch (err) {
        next(err);
    }
};
