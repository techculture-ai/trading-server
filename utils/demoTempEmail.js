const demoScheduleConfirmationEmailTemp = (userDetails) => {
  const {
    userName,
    userEmail,
    userPhone,
    companyName,
    demoDate,
    demoTime,
    timezone,
    demoType = "Product Demo", // 'Product Demo', 'Technical Demo', 'Custom Demo'
    meetingLink,
    meetingId,
    demoNotes,
    hostName = "Info Tech India Team",
    hostEmail = "info@infotechindia.in",
  } = userDetails;

  // Format date for better readability
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time for better readability
  const formatTime = (timeString) => {
    if (!timeString) return "Invalid Time";
    const [hours, minutes] = timeString.split(":");
    if (!hours || !minutes) return "Invalid Time";

    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));

    if (isNaN(date.getTime())) {
      return "Invalid Time";
    }

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Generate calendar links
  const generateCalendarLink = () => {
    try {
      // Validate inputs
      if (!demoDate || !demoTime) {
        return "#";
      }

      // Create a proper date string by combining date and time
      const dateStr =
        demoDate instanceof Date
          ? demoDate.toISOString().split("T")[0]
          : demoDate;
      const combinedDateTime = `${dateStr}T${demoTime}:00`;

      const startDate = new Date(combinedDateTime);

      // Check if the date is valid
      if (isNaN(startDate.getTime())) {
        return "#";
      }

      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour later

      const formatCalendarDate = (date) => {
        if (isNaN(date.getTime())) {
          return "";
        }
        return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      };

      const startFormatted = formatCalendarDate(startDate);
      const endFormatted = formatCalendarDate(endDate);

      if (!startFormatted || !endFormatted) {
        return "#";
      }

      const title = encodeURIComponent(
        `${demoType} - ${companyName || userName}`
      );
      const details = encodeURIComponent(
        `Demo session with ${hostName}\n\nMeeting Link: ${meetingLink}\nMeeting ID: ${meetingId}\n\nNotes: ${
          demoNotes || "No additional notes"
        }`
      );

      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startFormatted}/${endFormatted}&details=${details}&location=${encodeURIComponent(
        meetingLink
      )}`;
    } catch (error) {
      console.error("Error generating calendar link:", error);
      return "#";
    }
  };

  return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Demo Scheduled Successfully!</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #f8fafc;
                    margin: 0;
                    padding: 20px;
                    line-height: 1.6;
                }
                .email-container {
                    max-width: 700px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                    border: 1px solid #e2e8f0;
                }
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    position: relative;
                }
                .header::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(255, 255, 255, 0.1);
                }
                .header-content {
                    position: relative;
                    z-index: 1;
                }
                .success-icon {
                    font-size: 48px;
                    margin-bottom: 15px;
                    display: block;
                }
                .header h1 {
                    margin: 0;
                    font-size: 28px;
                    font-weight: 700;
                    margin-bottom: 8px;
                }
                .header p {
                    margin: 0;
                    font-size: 16px;
                    opacity: 0.9;
                }
                .content {
                    padding: 40px 35px;
                }
                .greeting {
                    font-size: 18px;
                    color: #2d3748;
                    margin-bottom: 25px;
                    font-weight: 500;
                }
                .demo-details-card {
                    background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
                    border-radius: 12px;
                    padding: 30px;
                    margin: 25px 0;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }
                .demo-details h3 {
                    color: #2d3748;
                    margin-top: 0;
                    margin-bottom: 20px;
                    font-size: 20px;
                    font-weight: 600;
                    text-align: center;
                    border-bottom: 2px solid #4CAF50;
                    padding-bottom: 10px;
                }
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 0;
                    border-bottom: 1px solid #e2e8f0;
                }
                .detail-row:last-child {
                    border-bottom: none;
                }
                .detail-label {
                    font-weight: 600;
                    color: #4a5568;
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    flex: 1;
                }
                .detail-value {
                    color: #2d3748;
                    font-size: 15px;
                    font-weight: 500;
                    flex: 2;
                    text-align: right;
                }
                .meeting-info {
                    background-color: #f0fff4;
                    border: 1px solid #68d391;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 25px 0;
                    text-align: center;
                }
                .meeting-info h4 {
                    color: #22543d;
                    margin-top: 0;
                    margin-bottom: 15px;
                    font-size: 18px;
                }
                .meeting-link {
                    display: inline-block;
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    color: white;
                    padding: 12px 25px;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 600;
                    margin: 10px 0;
                    font-size: 16px;
                    transition: transform 0.2s ease;
                }
                .meeting-link:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
                }
                .meeting-id {
                    background-color: #e2e8f0;
                    padding: 8px 15px;
                    border-radius: 20px;
                    font-family: 'Courier New', monospace;
                    font-weight: bold;
                    color: #2d3748;
                    display: inline-block;
                    margin: 8px 0;
                }
                .action-buttons {
                    text-align: center;
                    margin: 30px 0;
                }
                .calendar-btn {
                    display: inline-block;
                    background-color: #667eea;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 600;
                    margin: 0 10px;
                    font-size: 14px;
                    transition: all 0.2s ease;
                }
                .calendar-btn:hover {
                    background-color: #5a67d8;
                    transform: translateY(-1px);
                }
                .reschedule-btn {
                    display: inline-block;
                    background-color: #ed8936;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 600;
                    margin: 0 10px;
                    font-size: 14px;
                    transition: all 0.2s ease;
                }
                .reschedule-btn:hover {
                    background-color: #dd7724;
                    transform: translateY(-1px);
                }
                .preparation-section {
                    background-color: #fef5e7;
                    border-left: 4px solid #ed8936;
                    padding: 20px;
                    margin: 25px 0;
                    border-radius: 0 8px 8px 0;
                }
                .preparation-section h4 {
                    color: #744210;
                    margin-top: 0;
                    font-size: 16px;
                    font-weight: 600;
                }
                .preparation-section ul {
                    color: #744210;
                    margin: 10px 0;
                    padding-left: 20px;
                }
                .preparation-section li {
                    margin: 8px 0;
                }
                .contact-info {
                    background-color: #ebf8ff;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 25px 0;
                    text-align: center;
                }
                .contact-info h4 {
                    color: #2b6cb0;
                    margin-top: 0;
                    margin-bottom: 15px;
                }
                .contact-details {
                    color: #2c5282;
                    font-size: 15px;
                    line-height: 1.8;
                }
                .footer {
                    background-color: #2d3748;
                    color: #a0aec0;
                    padding: 30px;
                    text-align: center;
                }
                .footer h4 {
                    color: #e2e8f0;
                    margin-top: 0;
                    margin-bottom: 15px;
                }
                .footer-links a {
                    color: #4CAF50;
                    text-decoration: none;
                    margin: 0 10px;
                    font-weight: 500;
                }
                .footer-links a:hover {
                    text-decoration: underline;
                }
                .timestamp {
                    color: #718096;
                    font-size: 13px;
                    margin-top: 20px;
                    font-style: italic;
                }
                @media (max-width: 700px) {
                    .email-container {
                        margin: 0;
                        border-radius: 0;
                    }
                    .header, .content, .footer {
                        padding: 25px 20px;
                    }
                    .demo-details-card {
                        padding: 20px;
                    }
                    .detail-row {
                        flex-direction: column;
                        align-items: flex-start;
                        text-align: left;
                    }
                    .detail-value {
                        text-align: left;
                        margin-top: 5px;
                    }
                    .calendar-btn, .reschedule-btn {
                        display: block;
                        margin: 10px 0;
                    }
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <div class="header-content">
                        <span class="success-icon">🎯</span>
                        <h1>Demo Scheduled!</h1>
                        <p>Your ${demoType.toLowerCase()} is confirmed and ready</p>
                    </div>
                </div>
                
                <div class="content">
                    <div class="greeting">
                      Hello ${userName} 👋,
                    </div>

                    <p style="color: #4a5568; font-size: 16px; margin-bottom: 25px;">
                      We’re delighted to let you know that your demo has been successfully scheduled.  
                      Thank you for giving Info Tech India the opportunity to demonstrate how we can support 
                      "your business.  
                      Here are the details:
                    </p>

                    
                    <div class="demo-details-card">
                        <h3>📅 Demo Details</h3>
                        <div class="detail-row">
                            <span class="detail-label">📋 Demo Type</span>
                            <span class="detail-value">${` ${demoType}`}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">👤 Attendee</span>
                            <span class="detail-value">${` ${userName}`}</span>
                        </div>
                        
                        <div class="detail-row">
                            <span class="detail-label">📧 Email</span>
                            <span class="detail-value">${` ${userEmail}`}</span>
                        </div>
                        ${
                          userPhone
                            ? `
                        <div class="detail-row">
                            <span class="detail-label">📞 Phone</span>
                            <span class="detail-value">${` ${userPhone}`}</span>
                        </div>
                        `
                            : ""
                        }
                        <div class="detail-row">
                            <span class="detail-label">📅 Date</span>
                            <span class="detail-value">${` ${formatDate(
                              demoDate
                            )}`}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">⏰ Time</span>
                            <span class="detail-value">${` ${formatTime(
                              demoTime
                            )} ${timezone || ""}`}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">🎯 Host</span>
                            <span class="detail-value">${` ${hostName}`}</span>
                        </div>
                    </div>
                    
                    ${
                      meetingLink
                        ? `
                    <div class="meeting-info">
                        <h4>🔗 Join Your Demo</h4>
                        <p style="margin: 10px 0; color: #22543d;">
                            Click the link below to join your demo session:
                        </p>
                        <a href="${meetingLink}" class="meeting-link">Join Demo Session</a>
                        ${
                          meetingId
                            ? `
                        <br>
                        <p style="margin: 15px 0 5px 0; color: #22543d; font-size: 14px;">
                            Meeting ID: <span class="meeting-id">${meetingId}</span>
                        </p>
                        `
                            : ""
                        }
                    </div>
                    `
                        : ""
                    }
                    
                    <div class="action-buttons">
                        <a href="${generateCalendarLink()}" class="calendar-btn">
                            📅 Add to Google Calendar
                        </a>
                        <a href="https://infotechindia.in/" class="reschedule-btn">
                            ⏰ Reschedule Demo
                        </a>
                    </div>
                    
                    ${
                      demoNotes
                        ? `
                    <div class="preparation-section">
                        <h4>📝 Your Notes</h4>
                        <p style="color: #744210; margin: 0;">${demoNotes}</p>
                    </div>
                    `
                        : ""
                    }
                    
                    <div class="preparation-section">
                        <h4>🚀 How to Prepare for Your Demo</h4>
                        <ul>
                            <li>Test your internet connection and audio/video setup</li>
                            <li>Prepare any specific questions about our platform</li>
                            <li>Have your team members join if needed</li>
                            <li>Consider your current workflow challenges</li>
                            <li>Think about your integration requirements</li>
                        </ul>
                    </div>
                    
                    <div class="contact-info">
                        <h4>📞 Need to Make Changes?</h4>
                        <div class="contact-details">
                            <p><strong>Email:</strong> ${hostEmail}</p>
                            <p><strong>Phone:</strong> +91 8448332868</p>
                            <p style="margin-top: 15px; font-size: 14px;">
                                If you need to reschedule or have any questions, don't hesitate to reach out!
                            </p>
                        </div>
                    </div>
                </div>
                
                <div class="footer">
                    <h4> Info Tech India Demo Team</h4>
                    <p style="margin: 10px 0;">We're excited to show you what we can do!</p>
                    
                    <div class="timestamp">
                        <p>&copy; ${new Date().getFullYear()} Info Tech India. All rights reserved.</p>
                        <p>Demo confirmation sent on ${new Date().toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
};

const adminDemoNotificationEmailTemp = (userDetails) => {
  const {
    userName,
    userEmail,
    userPhone,
    companyName,
    demoDate,
    demoTime,
    timezone,
    demoType = "Product Demo",
    meetingLink,
    meetingId,
    demoNotes,
    hostName = "Info Tech India Demo Team",
    hostEmail = "info@infotechindia.in",
  } = userDetails;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "Invalid Time";
    const [hours, minutes] = timeString.split(":");
    if (!hours || !minutes) return "Invalid Time";
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    if (isNaN(date.getTime())) return "Invalid Time";
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Demo Scheduled</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f8fafc;
        margin: 0;
        padding: 20px;
        line-height: 1.6;
      }
      .email-container {
        max-width: 700px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        border: 1px solid #e2e8f0;
      }
      .header {
        background: linear-gradient(135deg, #ff6333 0%, #e15226 100%);
        color: white;
        padding: 30px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
      }
      .header p {
        margin: 0;
        font-size: 16px;
        opacity: 0.9;
      }
      .content {
        padding: 40px 35px;
      }
      .detail-row {
        display: flex;
        justify-content: space-between;
        padding: 12px 0;
        border-bottom: 1px solid #e2e8f0;
      }
      .detail-label {
        font-weight: 600;
        color: #4a5568;
        flex: 1;
      }
      .detail-value {
        color: #2d3748;
        flex: 2;
        text-align: right;
      }
      .footer {
        background-color: #2d3748;
        color: #a0aec0;
        padding: 20px;
        text-align: center;
      }
      @media (max-width: 700px) {
        .email-container { margin: 0; border-radius: 0; }
        .content { padding: 25px 20px; }
        .detail-row { flex-direction: column; align-items: flex-start; text-align: left; }
        .detail-value { text-align: left; margin-top: 5px; }
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <h1>New Demo Scheduled</h1>
        <p>A user has scheduled a demo session. Here are the details:</p>
      </div>
      <div class="content">
        <div class="detail-row">
          <span class="detail-label">📋 Demo Type</span>
          <span class="detail-value">${demoType}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">👤 Attendee</span>
          <span class="detail-value">${userName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">📧 Email</span>
          <span class="detail-value">${userEmail}</span>
        </div>
        ${
          userPhone
            ? `<div class="detail-row"><span class="detail-label">📞 Phone</span><span class="detail-value">${userPhone}</span></div>`
            : ""
        }
        ${
          companyName
            ? `<div class="detail-row"><span class="detail-label">🏢 Company</span><span class="detail-value">${companyName}</span></div>`
            : ""
        }
        <div class="detail-row">
          <span class="detail-label">📅 Date</span>
          <span class="detail-value">${formatDate(demoDate)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">⏰ Time</span>
          <span class="detail-value">${formatTime(demoTime)} ${
    timezone || ""
  }</span>
        </div>
        ${
          meetingLink
            ? `<div class="detail-row"><span class="detail-label">🔗 Meeting Link</span><span class="detail-value"><a href="${meetingLink}">${meetingLink}</a></span></div>`
            : ""
        }
        ${
          meetingId
            ? `<div class="detail-row"><span class="detail-label">🆔 Meeting ID</span><span class="detail-value">${meetingId}</span></div>`
            : ""
        }
        ${
          demoNotes
            ? `<div class="detail-row"><span class="detail-label">📝 Notes</span><span class="detail-value">${demoNotes}</span></div>`
            : ""
        }
      </div>
      <div class="footer">
        <p>Info Tech India Demo Team</p>
        <p>&copy; ${new Date().getFullYear()} Info Tech India</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

export { demoScheduleConfirmationEmailTemp, adminDemoNotificationEmailTemp };
