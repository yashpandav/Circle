const nodemailer = require('nodemailer');
require('dotenv').config();
let transporter;
exports.createTransporter = async() => {
    transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        auth : {
            user : process.env.MAIL_USER,
            pass : process.env.MAIL_PASS
        }});
        console.log("MAIL CONNECTION SUCCESSFULL");
        return transporter;
}  