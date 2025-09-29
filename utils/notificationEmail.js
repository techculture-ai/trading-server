const adminNotificationEmailTemp = (
  userName,
  subject,
  bodyText,
  adminName = "TechCulture Team"
) => {
  // Function to format and structure raw text
  const formatBodyText = (rawText) => {
    if (!rawText) return "";

    // Split text into paragraphs (by double line breaks or single line breaks)
    let paragraphs = rawText.split(/\n\s*\n/).filter((p) => p.trim());

    // If no double line breaks, split by single line breaks for shorter messages
    if (paragraphs.length === 1) {
      paragraphs = rawText.split("\n").filter((p) => p.trim());
    }

    // Format each paragraph
    const formattedParagraphs = paragraphs.map((paragraph) => {
      let formatted = paragraph.trim();

      // Convert **text** to bold
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

      // Convert *text* to italic
      formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>");

      // Convert URLs to clickable links
      formatted = formatted.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" style="color: #4CAF50; text-decoration: none;">$1</a>'
      );

      // Convert email addresses to clickable links
      formatted = formatted.replace(
        /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
        '<a href="mailto:$1" style="color: #4CAF50; text-decoration: none;">$1</a>'
      );

      // Check if it's a list item (starts with - or * or number.)
      if (/^[\-\*]\s/.test(formatted) || /^\d+\.\s/.test(formatted)) {
        return `<li style="margin: 8px 0; color: #555;">${formatted.replace(
          /^[\-\*]\s|^\d+\.\s/,
          ""
        )}</li>`;
      }

      return `<p style="margin: 15px 0; color: #555; line-height: 1.6;">${formatted}</p>`;
    });

    // Group consecutive list items
    let result = "";
    let inList = false;

    formattedParagraphs.forEach((paragraph) => {
      if (paragraph.startsWith("<li")) {
        if (!inList) {
          result += '<ul style="margin: 15px 0; padding-left: 20px;">';
          inList = true;
        }
        result += paragraph;
      } else {
        if (inList) {
          result += "</ul>";
          inList = false;
        }
        result += paragraph;
      }
    });

    if (inList) {
      result += "</ul>";
    }

    return result;
  };

  return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject || "Notification from TechCulture"}</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #f5f7fa;
                    margin: 0;
                    padding: 20px;
                    line-height: 1.6;
                }
                .email-container {
                    max-width: 650px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 10px;
                    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                    border: 1px solid #e1e8ed;
                }
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 25px 30px;
                    position: relative;
                }
                .header::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.1);
                }
                .header-content {
                    position: relative;
                    z-index: 1;
                }
                .notification-badge {
                    display: inline-block;
                    background-color: #ff6b6b;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 10px;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                    font-weight: 600;
                    color: white;
                }
                .content {
                    padding: 35px 30px;
                }
                .greeting {
                    font-size: 18px;
                    color: #333;
                    margin-bottom: 20px;
                    font-weight: 500;
                }
                .message-body {
                    background-color: #fafbfc;
                    border-left: 4px solid #4CAF50;
                    padding: 25px;
                    margin: 25px 0;
                    border-radius: 5px;
                    font-size: 15px;
                }
                .message-body p:first-child {
                    margin-top: 0;
                }
                .message-body p:last-child {
                    margin-bottom: 0;
                }
                .signature {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                    color: #666;
                    font-size: 14px;
                }
                .signature-name {
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 5px;
                }
                .footer {
                    background-color: #2c3e50;
                    color: #ecf0f1;
                    padding: 25px 30px;
                    text-align: center;
                }
                .footer-content {
                    font-size: 14px;
                    line-height: 1.5;
                }
                .footer-links {
                    margin: 15px 0;
                }
                .footer-links a {
                    color: #4CAF50;
                    text-decoration: none;
                    margin: 0 8px;
                    font-weight: 500;
                }
                .footer-links a:hover {
                    text-decoration: underline;
                }
                .timestamp {
                    color: #95a5a6;
                    font-size: 12px;
                    margin-top: 15px;
                    font-style: italic;
                }
                .priority-high {
                    border-left-color: #e74c3c;
                }
                .priority-medium {
                    border-left-color: #f39c12;
                }
                .priority-low {
                    border-left-color: #3498db;
                }
                .action-button {
                    display: inline-block;
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    color: white;
                    padding: 12px 25px;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: 600;
                    margin: 15px 0;
                    transition: transform 0.2s ease;
                }
                .action-button:hover {
                    transform: translateY(-1px);
                }
                @media (max-width: 650px) {
                    .email-container {
                        margin: 0;
                        border-radius: 0;
                        border-left: none;
                        border-right: none;
                    }
                    .header, .content, .footer {
                        padding: 20px 15px;
                    }
                    .message-body {
                        padding: 20px 15px;
                    }
                }
                
                /* Auto-formatting styles */
                .message-body ul {
                    margin: 15px 0;
                    padding-left: 20px;
                }
                
                .message-body li {
                    margin: 8px 0;
                    color: #555;
                }
                
                .message-body strong {
                    color: #333;
                }
                
                .message-body em {
                    color: #666;
                }
                
                .message-body a {
                    word-break: break-word;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <div class="header-content">
                        <div class="notification-badge">📢 Notification</div>
                        <h1>${subject || "Important Update"}</h1>
                    </div>
                </div>
                
                <div class="content">
                    <div class="greeting">
                        Hello ${userName || "Team"},
                    </div>
                    
                    <div class="message-body">
                        ${formatBodyText(bodyText)}
                    </div>
                    
                    <div class="signature">
                        <div class="signature-name">Best regards,</div>
                        <div>${adminName}</div>
                        <div class="timestamp">
                            Sent on ${new Date().toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                        </div>
                    </div>
                </div>
                
                <div class="footer">
                    <div class="footer-content">
                        <p><strong>TechCulture</strong></p>
                        <p>Stay connected with the latest in technology</p>
                        
                        <div class="footer-links">
                            <a href="https://techculture.ai/">Website</a> |
                            <a href="https://techculture.ai/contact">Contact Us</a>
                        </div>
                        
                        <div class="timestamp">
                            <p>&copy; ${new Date().getFullYear()} TechCulture. All rights reserved.</p>
                            <p>This is an automated notification email.</p>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
};

export default adminNotificationEmailTemp;
