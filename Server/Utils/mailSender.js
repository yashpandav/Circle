require('dotenv').config();
const { createTransporter } = require('../Config/mailTransporter');
const { runInBackground } = require('./backgroundTasks');
let transporterPromise = createTransporter();

async function sendMailDirect(email, title, body) {
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
}

function sendMailInBackground(email, title, body) {
    runInBackground(`Send Email to ${email}`, async () => {
        await sendMailDirect(email, title, body);
    });
    return Promise.resolve();
}

exports.sendMail = sendMailDirect;
exports.sendMailDirect = sendMailDirect;
exports.sendMailInBackground = sendMailInBackground;
