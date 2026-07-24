exports.successSignUp = (firstName , lastName) => {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Circle</title>
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
                padding: 40px 30px;
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
                font-size: 24px;
                color: #d81159;
                font-weight: 800;
            }
            .content {
                padding: 30px 10px;
                text-align: center;
            }
            .content h2 {
                color: #00a896;
                font-size: 20px;
                margin-bottom: 15px;
            }
            .content p {
                font-size: 15px;
                color: #4a5568;
                line-height: 1.6;
                margin: 15px 0;
            }
            .features {
                background-color: #f0fdfa;
                padding: 20px;
                border-radius: 8px;
                text-align: left;
                margin-top: 25px;
            }
            .features ul {
                margin: 0;
                padding-left: 20px;
                color: #4a5568;
                font-size: 14px;
                line-height: 1.8;
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
                <h1>Sign Up Complete!</h1>
            </div>
            <div class="content">
                <h2>Welcome to Circle, ${firstName} ${lastName}!</h2>
                <p>Your account has been successfully created and verified. We are thrilled to have you join our platform.</p>
                <div class="features">
                    <p style="margin-top: 0; font-weight: bold; color: #00a896;">What's next?</p>
                    <ul>
                        <li>Set up your personal profile</li>
                        <li>Explore available classes and groups</li>
                        <li>Connect with students and teachers</li>
                    </ul>
                </div>
            </div>
            <div class="footer">
                <p>Happy Learning,<br>The Circle Team</p>
            </div>
        </div>
    </body>
    </html>`;
}
