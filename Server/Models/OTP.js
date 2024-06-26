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

async function sendVerificationEmail(email, otp) {
    try {
        const mailResponse = await sendMail(
            email,
            "Verification Email",
            otpMailTemplate(otp)
        );
        console.log("EMAIL SENT", mailResponse);
    } catch (err) {
        console.log("ERROR DURING SENDING EMAIL", err);
        throw err;
    }
}

OTPSchema.pre('save', async function (next) {
    if (this.isNew) {
        await sendVerificationEmail(this.email, this.otp);
    }
    next();
});

module.exports = mongoose.model("OTP", OTPSchema);
