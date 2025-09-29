// 1. Email to User when Application is Submitted
const ApplicationSubmittedUserEmail = (
  name,
  applicationId
) => {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Submitted</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
              color: #333;
          }
          .container {
              max-width: 600px;
              margin: 20px auto;
              background: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
              text-align: center;
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
              margin-bottom: 20px;
          }
          .header h1 {
              color: #4CAF50;
          }
          .content {
              text-align: center;
          }
          .content p {
              font-size: 16px;
              line-height: 1.5;
          }
          .application-id {
              font-size: 18px;
              font-weight: bold;
              color: #4CAF50;
              margin: 20px 0;
              padding: 10px;
              background-color: #f8f9fa;
              border-radius: 5px;
          }
          .footer {
              text-align: center;
              font-size: 14px;
              color: #777;
              margin-top: 20px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>Hi ${name}, Application Submitted Successfully!</h1>
          </div>
          <div class="content">
              <p>Thank you for submitting your application for <strong>${applicationId}</strong>.</p>
              <p>Your application has been received and is currently under review.</p>
              <div class="application-id">Application ID: ${applicationId}</div>
              <p>You will receive updates on your application status via email. Please keep this Application ID for your records.</p>
              <p>We appreciate your interest and will get back to you soon!</p>
          </div>
          <div class="footer">
              <p>&copy; 2025 Info Tech India. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>`;
};

// 2. Email to Admin when Application is Submitted
const ApplicationSubmittedAdminEmail = (
  userName,
  userEmail,
  applicationId,
  applicationTitle
) => {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Application Received</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
              color: #333;
          }
          .container {
              max-width: 600px;
              margin: 20px auto;
              background: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
              text-align: center;
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
              margin-bottom: 20px;
          }
          .header h1 {
              color: #2196F3;
          }
          .content {
              text-align: left;
          }
          .content p {
              font-size: 16px;
              line-height: 1.5;
          }
          .application-details {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
          }
          .application-details strong {
              color: #2196F3;
          }
          .footer {
              text-align: center;
              font-size: 14px;
              color: #777;
              margin-top: 20px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>New Application Received</h1>
          </div>
          <div class="content">
              <p>A new application has been submitted and requires your attention.</p>
              <div class="application-details">
                  <p><strong>Application ID:</strong> ${applicationId}</p>
                  <p><strong>Application Title:</strong> ${applicationTitle}</p>
                  <p><strong>Applicant Name:</strong> ${userName}</p>
                  <p><strong>Applicant Email:</strong> ${userEmail}</p>
                  <p><strong>Status:</strong> Pending Review</p>
              </div>
              <p>Please review the application in your admin dashboard and take appropriate action.</p>
          </div>
          <div class="footer">
              <p>&copy; 2025 Info Tech India. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>`;
};

// 3. Email to User when Application Status Changes
const ApplicationStatusChangeUserEmail = (
  name,
  applicationId,
  applicationTitle,
  newStatus,
  message = ""
) => {
  const statusColors = {
    approved: "#4CAF50",
    rejected: "#f44336",
    "under review": "#FF9800",
    pending: "#2196F3",
  };

  const statusColor = statusColors[newStatus.toLowerCase()] || "#4CAF50";

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Status Update</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
              color: #333;
          }
          .container {
              max-width: 600px;
              margin: 20px auto;
              background: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
              text-align: center;
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
              margin-bottom: 20px;
          }
          .header h1 {
              color: ${statusColor};
          }
          .content {
              text-align: center;
          }
          .content p {
              font-size: 16px;
              line-height: 1.5;
          }
          .status-update {
              font-size: 18px;
              font-weight: bold;
              color: ${statusColor};
              margin: 20px 0;
              padding: 15px;
              background-color: #f8f9fa;
              border-radius: 5px;
              text-transform: uppercase;
          }
          .application-details {
              text-align: left;
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
          }
          .message-box {
              background-color: #e3f2fd;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
              text-align: left;
          }
          .footer {
              text-align: center;
              font-size: 14px;
              color: #777;
              margin-top: 20px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>Hi ${name}, Your Application Status Has Been Updated</h1>
          </div>
          <div class="content">
              <div class="application-details">
                  <p><strong>Application ID:</strong> ${applicationId}</p>
                  <p><strong>Application Title:</strong> ${applicationTitle}</p>
              </div>
              <div class="status-update">Status: ${newStatus}</div>
              ${
                message
                  ? `<div class="message-box"><strong>Message:</strong><br>${message}</div>`
                  : ""
              }
              <p>Thank you for your patience. If you have any questions, please contact our support team.</p>
          </div>
          <div class="footer">
              <p>&copy; 2025 Info Tech India. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>`;
};

// 4. Email to Admin when Application Status Changes
const ApplicationStatusChangeAdminEmail = (
  adminName,
  userName,
  userEmail,
  applicationId,
  applicationTitle,
  oldStatus,
  newStatus,
  changedBy
) => {
  const statusColors = {
    approved: "#4CAF50",
    rejected: "#f44336",
    "under review": "#FF9800",
    pending: "#2196F3",
  };

  const statusColor = statusColors[newStatus.toLowerCase()] || "#4CAF50";

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Status Changed</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
              color: #333;
          }
          .container {
              max-width: 600px;
              margin: 20px auto;
              background: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
              text-align: center;
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
              margin-bottom: 20px;
          }
          .header h1 {
              color: #2196F3;
          }
          .content {
              text-align: left;
          }
          .content p {
              font-size: 16px;
              line-height: 1.5;
          }
          .application-details {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
          }
          .application-details strong {
              color: #2196F3;
          }
          .status-change {
              background-color: #e8f5e8;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
              border-left: 4px solid ${statusColor};
          }
          .footer {
              text-align: center;
              font-size: 14px;
              color: #777;
              margin-top: 20px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>Application Status Changed</h1>
          </div>
          <div class="content">
              <p>Hi ${adminName},</p>
              <p>An application status has been updated in the system.</p>
              <div class="application-details">
                  <p><strong>Application ID:</strong> ${applicationId}</p>
                  <p><strong>Application Title:</strong> ${applicationTitle}</p>
                  <p><strong>Applicant Name:</strong> ${userName}</p>
                  <p><strong>Applicant Email:</strong> ${userEmail}</p>
              </div>
              <div class="status-change">
                  <p><strong>Status Change:</strong></p>
                  <p>From: <span style="color: #666;">${oldStatus}</span></p>
                  <p>To: <span style="color: ${statusColor}; font-weight: bold;">${newStatus}</span></p>
                  <p><strong>Changed By:</strong> ${changedBy}</p>
              </div>
              <p>The applicant has been automatically notified of this status change.</p>
          </div>
          <div class="footer">
              <p>&copy; 2025 Info Tech India. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>`;
};

// Export all templates
export {
  ApplicationSubmittedUserEmail,
  ApplicationSubmittedAdminEmail,
  ApplicationStatusChangeUserEmail,
  ApplicationStatusChangeAdminEmail,
};
