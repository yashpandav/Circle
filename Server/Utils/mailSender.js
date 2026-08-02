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
    } catch (err) {
        console.error('[Mail] Failed to send email:', err.message);
        throw err;
    }
};
