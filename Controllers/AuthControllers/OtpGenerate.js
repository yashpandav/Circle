const User = require('../../Models/User');
const otpgenerator = require('otp-generator');
const OTP = require('../../Models/OTP');

exports.genrateOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const findUser = await User.findOne({ email });

        if (findUser) {
            return res.status(400).json({
                success: false,
                message: "User already registered"
            });
        }

        let otp;
        let findOTP;

        do {
            otp = otpgenerator.generate(6, {
                specialChars: false,
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false
            });
            findOTP = await OTP.findOne({ otp });
        } while (findOTP);

        const finalOTP = await OTP.create({ email, otp });

        return res.status(200).json({
            success: true,
            message: "OTP Generated",
            OTP: finalOTP
        });

    } catch (err) {
        console.error("Error while generating OTP:", err);
        return res.status(500).json({
            success: false,
            message: "Error while generating OTP",
            error: err.message
        });
    }
};
