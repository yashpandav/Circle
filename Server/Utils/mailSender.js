require('dotenv').config();
const { createTransporter } = require('../Config/mailTransporter');
let transporterPromise = createTransporter();

exports.sendMail = async (email , title ,body) => {
    try {
        const transporter = await transporterPromise;
        const mailOptions = {
            from: process.env.MAIL_USER,
            to: email,
            subject: title,
            html: body,
        };

        await transporter.sendMail(mailOptions);
        // console.log("MAIL RESPONSE", mailResponse);

    } catch (err) {
        console.error("Something went wrong while generating mail", err);
        console.log(err)
    }
};
