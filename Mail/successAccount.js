exports.successSignUp = (firstName , lastName) => {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SignUp Completed</title>
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
                background-color: rgba(255, 255, 255, 0.9); /* Semi-transparent background */
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
                position: relative; /* Ensure relative positioning for the overlay */
            }
            .background-image {
                background-image: url('https://res.cloudinary.com/domjlns2q/image/upload/v1717001685/Circle/ukogkxycxtiguvf5hkc8.png');
                background-size: cover;
                background-repeat: no-repeat;
                background-position: center;
                position: absolute;
                top: 10%;
                left: 10%;
                width: 80%;
                height: 80%;
                border-radius: 10px;
                z-index: -1; 
            }
            .header {
                text-align: center;
                padding-bottom: 10px;
                border-bottom: 2px solid #7b7888;
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
            .footer {
                text-align: center;
                padding: 20px;
                border-top: 2px solid #7b7888;
            }
            .footer p {
                font-size: 14px;
                color: #2b2828;
            }
            .header img {
                max-width: 100px;
                margin-bottom: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://res.cloudinary.com/domjlns2q/image/upload/v1717001685/Circle/ukogkxycxtiguvf5hkc8.png" alt="CircleLogo">
                <h1>Sign Up Completed Successfully 😊</h1>
            </div>
            <div class="content">
                <p>Hello, ${firstName} ${lastName}</p>
                <p>Welcome to Circle! Your sign up process is now complete.</p>
                <p>Your account is ready to use. Here are some next steps:</p>
                <ol style="text-align: left;">
                    <li>Explore our platform and discover all the features.</li>
                    <li>Complete your profile to enhance your experience.</li>
                    <li>Join classes or create your own to start learning.</li>
                </ol>
                <p>If you have any questions or need assistance, feel free to contact our support team.</p>
            </div>
            <div class="footer">
                <p>Thank you for choosing Circle,<br>Team Circle 😊</p>
            </div>
        </div>
    </body>
    </html>
    `;
}
