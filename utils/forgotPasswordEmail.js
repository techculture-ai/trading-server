const forgotPasswordEmailTemp = (name, otp)=>{
    return `
        <DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset OTP</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                }
                .container {
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }
                h1 {
                    color: #333;
                }
                p {
                    font-size: 16px;
                    color: #555;
                }
                .otp {
                    font-size: 24px;
                    font-weight: bold;
                    color: #4CAF50;
                    margin: 20px 0;
                }
                .footer {
                    font-size: 14px;
                    color: #777;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Hi ${name} Please Verify Your Email Address To reset Password</h1>
                <p>Thank you for registering with Info Tech India. Please use the OTP below to verify your email address:</p>
                <div class="otp">${otp}</div>
                <p>If you didn’t forget your password, you can safely ignore this email.</p>
                <div class="footer">
                    <p>&copy; 2025 Info Tech India. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `
}

export default forgotPasswordEmailTemp;