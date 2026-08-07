const User = require('../../Models/User');
const otpgenerator = require('otp-generator');
const OTP = require('../../Models/OTP');

exports.genrateOtp = async (req, res, next) => {
    try {
        const email = req.body.email;
        const normalizedEmail = email ? email.toLowerCase().trim() : '';

        if (!normalizedEmail) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const findUser = await User.findOne({ email: normalizedEmail });

        if (findUser) {
            return res.status(409).json({
                success: false,
                message: "User already registered"
            });
        }

        let otp;
        let findOTP;
        let attempts = 0;

        do {
            otp = otpgenerator.generate(6, {
                specialChars: false,
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false
            });
            findOTP = await OTP.findOne({ otp });
            if (++attempts > 10) break;
        } while (findOTP);

        const finalOTP = await OTP.create({ email: normalizedEmail, otp });

        return res.status(200).json({
            success: true,
            message: "OTP Generated successfully"
        });

    } catch (err) {
        next(err);
    }
};
