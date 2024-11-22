require('dotenv').config();
const { transporter } = require('../Config/mailTransporter');

exports.sendMail = async (to, subject, htmlContent) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.MAIL_USER,
            to,
            subject,
            html: htmlContent,
        });
        console.log('Email sent:', info.response);
        return info;
    } catch (error) {
        console.error("Something went wrong while generating mail", err);
        console.log(err)
    }
};
