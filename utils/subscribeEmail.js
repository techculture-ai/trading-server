const subscriptionConfirmationEmailTemp = ( email) => {
  return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to TechCulture!</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background-color: #f8f9fa;
                    margin: 0;
                    padding: 20px;
                    line-height: 1.6;
                }
                .email-container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                .header {
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    color: white;
                    padding: 30px 20px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 28px;
                    font-weight: bold;
                }
                .header p {
                    margin: 10px 0 0 0;
                    font-size: 16px;
                    opacity: 0.9;
                }
                .content {
                    padding: 40px 30px;
                    text-align: center;
                }
                .welcome-message {
                    font-size: 24px;
                    color: #333;
                    margin-bottom: 20px;
                    font-weight: 600;
                }
                .description {
                    font-size: 16px;
                    color: #666;
                    margin-bottom: 30px;
                    line-height: 1.7;
                }
                .subscription-details {
                    background-color: #f8f9fa;
                    border-left: 4px solid #4CAF50;
                    padding: 20px;
                    margin: 25px 0;
                    border-radius: 4px;
                    text-align: left;
                }
                .subscription-details h3 {
                    color: #333;
                    margin-top: 0;
                    font-size: 18px;
                }
                .subscription-details p {
                    color: #666;
                    margin: 5px 0;
                }
                .benefits {
                    text-align: left;
                    margin: 30px 0;
                }
                .benefits h3 {
                    color: #333;
                    font-size: 20px;
                    margin-bottom: 15px;
                    text-align: center;
                }
                .benefits ul {
                    list-style: none;
                    padding: 0;
                }
                .benefits li {
                    color: #666;
                    margin: 10px 0;
                    padding-left: 25px;
                    position: relative;
                }
                .benefits li:before {
                    content: "✓";
                    color: #4CAF50;
                    font-weight: bold;
                    position: absolute;
                    left: 0;
                }
                .cta-button {
                    display: inline-block;
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    color: white;
                    padding: 15px 30px;
                    text-decoration: none;
                    border-radius: 25px;
                    font-weight: bold;
                    font-size: 16px;
                    margin: 20px 0;
                    transition: transform 0.2s ease;
                }
                .cta-button:hover {
                    transform: translateY(-2px);
                }
                .footer {
                    background-color: #333;
                    color: #fff;
                    padding: 30px 20px;
                    text-align: center;
                    font-size: 14px;
                }
                .footer p {
                    margin: 5px 0;
                }
                .unsubscribe {
                    color: #aaa;
                    font-size: 12px;
                    margin-top: 20px;
                }
                .unsubscribe a {
                    color: #4CAF50;
                    text-decoration: none;
                }
                .social-links {
                    margin: 15px 0;
                }
                .social-links a {
                    color: #4CAF50;
                    text-decoration: none;
                    margin: 0 10px;
                    font-weight: bold;
                }
                @media (max-width: 600px) {
                    .email-container {
                        margin: 0;
                        border-radius: 0;
                    }
                    .content {
                        padding: 30px 20px;
                    }
                    .header {
                        padding: 25px 15px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <h1>🚀 Welcome to TechCulture!</h1>
                    <p>Your subscription is confirmed</p>
                </div>
                
                <div class="content">
                    <div class="welcome-message">
                        Hi ${"Tech Enthusiast"}! 👋
                    </div>
                    
                    <p class="description">
                        Thank you for subscribing to TechCulture! We're thrilled to have you join our community of tech enthusiasts, innovators, and forward-thinkers.
                    </p>
                    
                    <div class="subscription-details">
                        <h3>📧 Subscription Details</h3>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Subscription Date:</strong> ${new Date().toLocaleDateString()}</p>
                        <p><strong>Status:</strong> <span style="color: #4CAF50; font-weight: bold;">Active</span></p>
                    </div>
                    
                    <div class="benefits">
                        <h3>What to expect:</h3>
                        <ul>
                            <li>Latest tech news and industry insights</li>
                            <li>Exclusive tutorials and how-to guides</li>
                            <li>Product reviews and recommendations</li>
                            <li>Tech career tips and opportunities</li>
                            <li>Early access to new features and content</li>
                        </ul>
                    </div>
                    
                    <a href="https://techculture.ai" class="cta-button">Explore TechCulture</a>
                    
                    <p style="margin-top: 30px; color: #666;">
                        We typically send 2-3 emails per week, and we promise to keep them valuable and engaging. No spam, ever!
                    </p>
                </div>
                
                <div class="footer">
                    <p><strong>TechCulture Team</strong></p>
                    <p>Connecting you with the future of technology</p>
                    
                    <div class="social-links">
                        <a href="#">Twitter</a> |
                        <a href="#">LinkedIn</a> |
                        <a href="#">Medium</a>
                    </div>
                    
                    <p>&copy; 2024 TechCulture. All rights reserved.</p>
                    
                    <div class="unsubscribe">
                        <p>You're receiving this email because you subscribed to TechCulture.</p>
                        <p><a href="#">Unsubscribe</a> | <a href="#">Manage Preferences</a></p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
};

export default subscriptionConfirmationEmailTemp;
