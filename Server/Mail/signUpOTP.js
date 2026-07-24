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
                background-color: #eff7f6;
                margin: 0;
                padding: 0;
                -webkit-text-size-adjust: none;
                -ms-text-size-adjust: none;
            }
            .container {
                max-width: 500px;
                margin: 40px auto;
                background-color: #ffffff;
                padding: 30px;
                border-radius: 12px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            }
            .header {
                text-align: center;
                padding-bottom: 20px;
                border-bottom: 1px solid #e2e8f0;
            }
            .header h1 {
                margin: 0;
                font-size: 22px;
                color: #d81159;
                font-weight: 800;
            }
            .content {
                padding: 30px 20px;
                text-align: center;
            }
            .content p {
                font-size: 15px;
                color: #4a5568;
                line-height: 1.6;
                margin: 10px 0;
            }
            .otp {
                display: inline-block;
                font-size: 32px;
                color: #00a896;
                background-color: #f0fdfa;
                padding: 15px 30px;
                border: 2px dashed #00a896;
                border-radius: 8px;
                letter-spacing: 8px;
                font-weight: bold;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
            }
            .footer p {
                font-size: 13px;
                color: #718096;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Verify Your Email</h1>
            </div>
            <div class="content">
                <p>Hello,</p>
                <p>Thank you for signing up for Circle. Please use the following code to verify your email address:</p>
                <div class="otp">${otp}</div>
                <p>This code is valid for 10 minutes. Please do not share it with anyone.</p>
            </div>
            <div class="footer">
                <p>Thank you,<br>The Circle Team</p>
            </div>
        </div>
    </body>
    </html>`;
}
