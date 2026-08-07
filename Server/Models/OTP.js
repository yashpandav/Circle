const mongoose = require("mongoose");
const { sendMail } = require('../Utils/mailSender');
const { otpMailTemplate } = require('../Mail/signUpOTP');

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 10,
    }
});

OTPSchema.index({ email: 1, createdAt: -1 });

async function sendVerificationEmail(email, otp) {
    try {
        await sendMail(
            email,
            "Verification Email",
            otpMailTemplate(otp)
        );
    } catch (err) {
        throw err;
    }
}

OTPSchema.pre('save', async function (next) {
    if (this.isNew) {
        try {
            await sendVerificationEmail(this.email, this.otp);
        } catch (err) {
            return next(err);
        }
    }
    next();
});

module.exports = mongoose.model("OTP", OTPSchema);
