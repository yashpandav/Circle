exports.otpMailTemplate = (otp) => {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Verification</title>
        <style>
            body {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                background-color: #f0f0f0;
                margin: 0;
                padding: 0;
                -webkit-text-size-adjust: none;
                -ms-text-size-adjust: none;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                padding: 10px 0;
                border-bottom: 2px solid #232023;
            }
            .header img {
                max-width: 100px;
                margin-bottom: 10px;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
                color: #333333;
                font-weight: bold;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
            }
            .content {
                padding: 20px;
                text-align: center;
            }
            .content p {
                font-size: 16px;
                color: #333333;
                margin: 20px 0;
            }
            .otp {
                display: inline-block;
                font-size: 30px;
                color: #030001;
                padding: 10px 20px;
                border-radius: 5px;
                letter-spacing: 4px;
                font-weight: bold;
            }
            .footer {
                text-align: center;
                padding: 20px;
                border-top: 2px solid #232023;
            }
            .footer p {
                font-size: 14px;
                color: #777777;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://res.cloudinary.com/domjlns2q/image/upload/v1717001685/Circle/ukogkxycxtiguvf5hkc8.png" alt="Circle Logo">
                <h1>Circle Says Verify Your Email Address 😊</h1>
            </div>
            <div class="content">
                <p>Hello,</p>
                <p>Thank you for registering with us. Please use the following OTP to verify your email address:</p>
                <div class="otp">${otp}</div>
                <p>This OTP is valid for 10 minutes. Do not share this code with anyone.</p>
                <p>If you did not request this, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>Thank you,<br>Team Circle 😊</p>
            </div>
        </div>
    </body>
    </html>
    `;
}
