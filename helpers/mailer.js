const nodemailer = require('nodemailer');

const smtpTransport = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_EMAIL_PASSWORD
  }
});

// ======================= VERIFICATION EMAIL =======================
exports.sendVerificationMail = async (data) => {
  const { email, firstname, lastname, link } = data;

  const message = {
    from: process.env.SENDER_EMAIL || 'noreply@padhaihub.com',
    to: email,
    subject: 'Verify Your Email - PadhaiHub',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - PadhaiHub</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <table border="0" cellspacing="0" cellpadding="0" align="center" style="border-collapse: collapse; width: 100%; max-width: 560px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e0e0e0;">
          <tbody>
            <!-- Header -->
            <tr>
              <td style="padding: 30px 30px 20px 30px; border-bottom: 1px solid #eee;">
                <h1 style="color: #333; margin: 0; font-size: 22px; font-weight: 600;">PadhaiHub</h1>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 30px;">
                <p style="color: #333; margin: 0 0 20px 0; font-size: 15px; line-height: 1.6;">
                  Hello <strong>${firstname} ${lastname}</strong>,
                </p>

                <p style="color: #555; line-height: 1.6; margin-bottom: 20px; font-size: 15px;">
                  Welcome to PadhaiHub. To complete your registration and activate your account, please verify your email address.
                </p>

                ${data.isLecturerApplicant ? `
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 3px; margin: 20px 0; border-left: 3px solid #6c757d;">
                  <p style="color: #555; margin: 0; font-size: 14px; line-height: 1.6;">
                    <strong>Lecturer Application Note:</strong> Your application for lecturer position will be reviewed by our admin team after email verification.
                  </p>
                </div>
                ` : ''}

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${link}" style="display: inline-block; background-color: #6c757d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 3px; font-size: 14px; font-weight: 600;">Verify Email Address</a>
                </div>

                <p style="color: #555; line-height: 1.6; margin-bottom: 10px; font-size: 15px;">
                  <strong>Important:</strong> This link will expire in 24 hours.
                </p>

                <p style="color: #555; line-height: 1.6; margin-bottom: 25px; font-size: 15px;">
                  If you didn't create an account with PadhaiHub, you can safely ignore this email.
                </p>

                <p style="color: #555; line-height: 1.6; margin: 0; font-size: 15px;">
                  Need help? <a href="mailto:support@padhaihub.com" style="color: #333; text-decoration: underline;">Contact our support team</a>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 20px 30px; border-top: 1px solid #eee;">
                <p style="margin: 0 0 8px 0; color: #999; font-size: 12px;">
                  © ${new Date().getFullYear()} PadhaiHub. All rights reserved.
                </p>
                <p style="margin: 0 0 8px 0; color: #999; font-size: 12px;">
                  This email was sent to ${email}
                </p>
                <p style="margin: 0; color: #999; font-size: 12px;">
                  <a href="${process.env.FRONTEND_URI}/unsubscribe" style="color: #999; text-decoration: underline;">Unsubscribe</a>
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>`
  };

  try {
    const result = await smtpTransport.sendMail(message);
    console.log(`Verification email sent to ${email}`);
    return result;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

// ======================= PASSWORD RESET EMAIL =======================
exports.sendPasswordResetMail = async (data) => {
  const { email, firstname, lastname, link } = data;

  const message = {
    from: process.env.SENDER_EMAIL || 'noreply@padhaihub.com',
    to: email,
    subject: 'Reset Your Password - PadhaiHub',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - PadhaiHub</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <table border="0" cellspacing="0" cellpadding="0" align="center" style="border-collapse: collapse; width: 100%; max-width: 560px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e0e0e0;">
          <tbody>
            <!-- Header -->
            <tr>
              <td style="padding: 30px 30px 20px 30px; border-bottom: 1px solid #eee;">
                <h1 style="color: #333; margin: 0; font-size: 22px; font-weight: 600;">PadhaiHub</h1>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 30px;">
                <p style="color: #333; margin: 0 0 20px 0; font-size: 15px; line-height: 1.6;">
                  Hello <strong>${firstname} ${lastname}</strong>,
                </p>

                <p style="color: #555; line-height: 1.6; margin-bottom: 20px; font-size: 15px;">
                  We received a request to reset your password for your PadhaiHub account.
                </p>

                <p style="color: #555; line-height: 1.6; margin-bottom: 25px; font-size: 15px;">
                  Click the button below to create a new password:
                </p>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${link}" style="display: inline-block; background-color: #6c757d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 3px; font-size: 14px; font-weight: 600;">Reset Password</a>
                </div>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 3px; margin: 20px 0; border-left: 3px solid #6c757d;">
                  <p style="color: #555; margin: 0 0 10px 0; font-size: 14px; line-height: 1.6;">
                    <strong>Security Notice:</strong> This link will expire in 1 hour.
                  </p>
                  <p style="color: #555; margin: 0; font-size: 14px; line-height: 1.6;">
                    If you didn't request a password reset, please ignore this email or contact support if you're concerned about your account's security.
                  </p>
                </div>

                <p style="color: #555; line-height: 1.6; margin: 25px 0 0 0; font-size: 15px;">
                  Best regards,<br>The PadhaiHub Team
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 20px 30px; border-top: 1px solid #eee;">
                <p style="margin: 0 0 8px 0; color: #999; font-size: 12px;">
                  © ${new Date().getFullYear()} PadhaiHub. All rights reserved.
                </p>
                <p style="margin: 0; color: #999; font-size: 12px;">
                  This email was sent to ${email}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>`
  };

  try {
    const result = await smtpTransport.sendMail(message);
    console.log(`Password reset email sent to ${email}`);
    return result;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// ======================= LECTURER APPLICATION REVIEW EMAIL (NEW) =======================
exports.sendLecturerApplicationReviewMail = async (data) => {
  const { email, firstname, lastname } = data;

  const message = {
    from: process.env.SENDER_EMAIL || 'noreply@padhaihub.com',
    to: email,
    subject: 'Your Lecturer Application is Under Review - PadhaiHub',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Under Review - PadhaiHub</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <table border="0" cellspacing="0" cellpadding="0" align="center" style="border-collapse: collapse; width: 100%; max-width: 560px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e0e0e0;">
          <tbody>
            <!-- Header -->
            <tr>
              <td style="padding: 30px 30px 20px 30px; border-bottom: 1px solid #eee;">
                <h1 style="color: #333; margin: 0; font-size: 22px; font-weight: 600;">PadhaiHub</h1>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 30px;">
                <p style="color: #333; margin: 0 0 20px 0; font-size: 15px; line-height: 1.6;">
                  Hello <strong>${firstname} ${lastname}</strong>,
                </p>

                <p style="color: #555; line-height: 1.6; margin-bottom: 20px; font-size: 15px;">
                  Thank you for verifying your email address and applying to become a lecturer at PadhaiHub.
                </p>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 3px; margin: 20px 0; border-left: 3px solid #6c757d;">
                  <h3 style="margin-top: 0; color: #333; font-size: 16px;">Application Status: Under Review</h3>
                  <p style="color: #555; margin: 0; font-size: 14px; line-height: 1.6;">
                    Your lecturer application has been submitted successfully and is now being reviewed by our admin team.
                  </p>
                </div>

                <h4 style="color: #333; margin: 25px 0 15px 0; font-size: 16px;">What happens next?</h4>
                <ol style="margin: 0 0 20px 0; padding-left: 20px; color: #555; font-size: 15px; line-height: 1.8;">
                  <li>Our team will review your application and documents</li>
                  <li>You will receive an email with the decision within 3-5 business days</li>
                  <li>If approved, you'll gain access to lecturer features</li>
                  <li>You can continue using PadhaiHub as a learner while waiting</li>
                </ol>

                <p style="color: #555; line-height: 1.6; margin-bottom: 25px; font-size: 15px;">
                  <strong>Current Access:</strong> You can login to your account and access learner features.
                </p>

                <p style="color: #555; line-height: 1.6; margin-bottom: 5px; font-size: 15px;">
                  Thank you for your patience!
                </p>
                <p style="color: #555; line-height: 1.6; margin: 0; font-size: 15px;">
                  Best regards,<br>The PadhaiHub Team
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 20px 30px; border-top: 1px solid #eee;">
                <p style="margin: 0 0 8px 0; color: #999; font-size: 12px;">
                  © ${new Date().getFullYear()} PadhaiHub. All rights reserved.
                </p>
                <p style="margin: 0; color: #999; font-size: 12px;">
                  This email was sent to ${email}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>`
  };

  try {
    const result = await smtpTransport.sendMail(message);
    console.log(`Lecturer review email sent to ${email}`);
    return result;
  } catch (error) {
    console.error('Error sending lecturer review email:', error);
    throw error;
  }
};

// ======================= LECTURER REQUEST NOTIFICATION TO ADMIN =======================
exports.sendLecturerRequestNotification = async (data) => {
  const { adminEmail, adminName, applicantName, applicantEmail, applicationId, dashboardLink } = data;

  const message = {
    from: process.env.SENDER_EMAIL || 'noreply@padhaihub.com',
    to: adminEmail,
    subject: `New Lecturer Application: ${applicantName} - PadhaiHub`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Lecturer Application - PadhaiHub Admin</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <table border="0" cellspacing="0" cellpadding="0" align="center" style="border-collapse: collapse; width: 100%; max-width: 560px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e0e0e0;">
          <tbody>
            <!-- Header -->
            <tr>
              <td style="padding: 30px 30px 20px 30px; border-bottom: 1px solid #eee;">
                <h1 style="color: #333; margin: 0; font-size: 22px; font-weight: 600;">PadhaiHub Admin</h1>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 30px;">
                <p style="color: #333; margin: 0 0 20px 0; font-size: 15px; line-height: 1.6;">
                  Hello <strong>${adminName}</strong>,
                </p>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 3px; margin: 20px 0; border-left: 3px solid #6c757d;">
                  <h3 style="margin-top: 0; color: #333; font-size: 16px;">New Lecturer Application Requires Review</h3>
                  <p style="color: #555; margin: 0; font-size: 14px; line-height: 1.6;">
                    A new lecturer application has been submitted and requires your attention.
                  </p>
                </div>

                <h4 style="color: #333; margin: 25px 0 15px 0; font-size: 16px;">Applicant Details:</h4>
                <table border="0" cellspacing="0" cellpadding="0" style="width: 100%; margin-bottom: 25px;">
                  <tr>
                    <td style="padding: 8px 0; color: #888; font-size: 14px; width: 40%;">Name:</td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px;">${applicantName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #888; font-size: 14px;">Email:</td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px;">${applicantEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #888; font-size: 14px;">Application ID:</td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px;">${applicationId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #888; font-size: 14px;">Submitted:</td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px;">${new Date().toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #888; font-size: 14px;">Status:</td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px;">Pending Review</td>
                  </tr>
                </table>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${dashboardLink}" style="display: inline-block; background-color: #6c757d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 3px; font-size: 14px; font-weight: 600;">Review Application in Admin Panel</a>
                </div>

                <p style="color: #888; font-size: 12px; margin: 25px 0 0 0;">
                  This is an automated notification from PadhaiHub Admin System.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 20px 30px; border-top: 1px solid #eee;">
                <p style="margin: 0; color: #999; font-size: 12px;">
                  © ${new Date().getFullYear()} PadhaiHub Admin Portal
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>`
  };

  try {
    const result = await smtpTransport.sendMail(message);
    console.log(`Lecturer request notification sent to admin ${adminEmail}`);
    return result;
  } catch (error) {
    console.error('Error sending lecturer request notification:', error);
    throw error;
  }
};

// ======================= LECTURER APPROVAL EMAIL =======================
exports.sendLecturerApprovalMail = async (data) => {
  const { email, firstname, lastname, loginLink, dashboardLink } = data;

  const message = {
    from: process.env.SENDER_EMAIL || 'noreply@padhaihub.com',
    to: email,
    subject: 'Congratulations! Your Lecturer Application Has Been Approved - PadhaiHub',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Approved - PadhaiHub</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <table border="0" cellspacing="0" cellpadding="0" align="center" style="border-collapse: collapse; width: 100%; max-width: 560px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e0e0e0;">
          <tbody>
            <!-- Header -->
            <tr>
              <td style="padding: 30px 30px 20px 30px; border-bottom: 1px solid #eee;">
                <h1 style="color: #333; margin: 0; font-size: 22px; font-weight: 600;">PadhaiHub</h1>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 30px;">
                <p style="color: #333; margin: 0 0 20px 0; font-size: 15px; line-height: 1.6;">
                  Dear <strong>${firstname} ${lastname}</strong>,
                </p>

                <div style="background-color: #f8f9fa; padding: 25px; border-radius: 3px; margin: 20px 0; border-left: 3px solid #6c757d; text-align: center;">
                  <h2 style="margin-top: 0; color: #333; font-size: 18px;">Congratulations!</h2>
                  <p style="color: #555; margin: 0 0 10px 0; font-size: 15px; line-height: 1.6;">
                    We are pleased to inform you that your lecturer application has been approved.
                  </p>
                  <p style="color: #555; margin: 0; font-size: 15px; line-height: 1.6;">
                    Welcome to the PadhaiHub Teaching Team!
                  </p>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${loginLink}" style="display: inline-block; background-color: #6c757d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 3px; font-size: 14px; font-weight: 600; margin: 5px;">Login to Your Account</a>
                  <a href="${dashboardLink}" style="display: inline-block; background-color: #6c757d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 3px; font-size: 14px; font-weight: 600; margin: 5px;">Go to Lecturer Dashboard</a>
                </div>

                <h3 style="color: #333; margin: 25px 0 15px 0; font-size: 16px;">What You Can Do Now:</h3>
                <ul style="margin: 0 0 25px 0; padding-left: 20px; color: #555; font-size: 15px; line-height: 1.8;">
                  <li>Create and manage courses</li>
                  <li>Upload educational content (videos, PDFs, quizzes)</li>
                  <li>Interact with students</li>
                  <li>Track your course performance</li>
                  <li>Earn through our instructor program</li>
                </ul>

                <h3 style="color: #333; margin: 25px 0 15px 0; font-size: 16px;">Getting Started:</h3>
                <ol style="margin: 0 0 20px 0; padding-left: 20px; color: #555; font-size: 15px; line-height: 1.8;">
                  <li>Complete your lecturer profile</li>
                  <li>Review our teaching guidelines</li>
                  <li>Create your first course</li>
                  <li>Explore available resources</li>
                </ol>

                <p style="color: #555; line-height: 1.6; margin-bottom: 25px; font-size: 15px;">
                  <strong>Need help?</strong> Check our <a href="${process.env.FRONTEND_URI}/instructor-guide" style="color: #333; text-decoration: underline;">Instructor Guide</a> or contact our support team.
                </p>

                <p style="color: #555; line-height: 1.6; margin-bottom: 5px; font-size: 15px;">
                  We're excited to see what you'll teach!
                </p>
                <p style="color: #555; line-height: 1.6; margin: 0; font-size: 15px;">
                  Best regards,<br>The PadhaiHub Team
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 20px 30px; border-top: 1px solid #eee;">
                <p style="margin: 0 0 8px 0; color: #999; font-size: 12px;">
                  © ${new Date().getFullYear()} PadhaiHub. All rights reserved.
                </p>
                <p style="margin: 0; color: #999; font-size: 12px;">
                  This email was sent to ${email}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>`
  };

  try {
    const result = await smtpTransport.sendMail(message);
    console.log(`Lecturer approval email sent to ${email}`);
    return result;
  } catch (error) {
    console.error('Error sending lecturer approval email:', error);
    throw error;
  }
};

// ======================= LECTURER REJECTION EMAIL =======================
exports.sendLecturerRejectionMail = async (data) => {
  const { email, firstname, lastname, reason } = data;

  const message = {
    from: process.env.SENDER_EMAIL || 'noreply@padhaihub.com',
    to: email,
    subject: 'Update on Your Lecturer Application - PadhaiHub',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Status Update - PadhaiHub</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <table border="0" cellspacing="0" cellpadding="0" align="center" style="border-collapse: collapse; width: 100%; max-width: 560px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e0e0e0;">
          <tbody>
            <!-- Header -->
            <tr>
              <td style="padding: 30px 30px 20px 30px; border-bottom: 1px solid #eee;">
                <h1 style="color: #333; margin: 0; font-size: 22px; font-weight: 600;">PadhaiHub</h1>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 30px;">
                <p style="color: #333; margin: 0 0 20px 0; font-size: 15px; line-height: 1.6;">
                  Dear <strong>${firstname} ${lastname}</strong>,
                </p>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 3px; margin: 20px 0; border-left: 3px solid #6c757d;">
                  <h3 style="margin-top: 0; color: #333; font-size: 16px;">Application Status: Not Approved</h3>
                  <p style="color: #555; margin: 0 0 10px 0; font-size: 14px; line-height: 1.6;">
                    Thank you for your interest in becoming a lecturer at PadhaiHub and for taking the time to apply.
                  </p>
                  <p style="color: #555; margin: 0; font-size: 14px; line-height: 1.6;">
                    After careful review of your application, we regret to inform you that we are unable to approve your application at this time.
                  </p>
                  ${reason ? `
                  <div style="background-color: #ffffff; padding: 15px; border-radius: 3px; margin-top: 15px; border: 1px solid #e0e0e0;">
                    <p style="color: #555; margin: 0; font-size: 14px; line-height: 1.6;">
                      <strong>Reason:</strong> ${reason}
                    </p>
                  </div>
                  ` : ''}
                </div>

                <h3 style="color: #333; margin: 25px 0 15px 0; font-size: 16px;">Suggestions for Future Applications:</h3>
                <ul style="margin: 0 0 25px 0; padding-left: 20px; color: #555; font-size: 15px; line-height: 1.8;">
                  <li>Gain more teaching experience</li>
                  <li>Complete relevant certifications</li>
                  <li>Build a portfolio of your work</li>
                  <li>Consider reapplying after 6 months</li>
                </ul>

                <h3 style="color: #333; margin: 25px 0 15px 0; font-size: 16px;">You Can Still:</h3>
                <ul style="margin: 0 0 25px 0; padding-left: 20px; color: #555; font-size: 15px; line-height: 1.8;">
                  <li>Continue using PadhaiHub as a learner</li>
                  <li>Enroll in courses to enhance your skills</li>
                  <li>Stay updated with our platform improvements</li>
                </ul>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.FRONTEND_URI}/courses" style="display: inline-block; background-color: #6c757d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 3px; font-size: 14px; font-weight: 600;">Browse Available Courses</a>
                </div>

                <p style="color: #555; line-height: 1.6; margin-bottom: 5px; font-size: 15px;">
                  We appreciate your interest in PadhaiHub and wish you the best in your future endeavors.
                </p>
                <p style="color: #555; line-height: 1.6; margin: 0; font-size: 15px;">
                  Sincerely,<br>The PadhaiHub Team
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 20px 30px; border-top: 1px solid #eee;">
                <p style="margin: 0 0 8px 0; color: #999; font-size: 12px;">
                  © ${new Date().getFullYear()} PadhaiHub. All rights reserved.
                </p>
                <p style="margin: 0; color: #999; font-size: 12px;">
                  This email was sent to ${email}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>`
  };

  try {
    const result = await smtpTransport.sendMail(message);
    console.log(`Lecturer rejection email sent to ${email}`);
    return result;
  } catch (error) {
    console.error('Error sending lecturer rejection email:', error);
    throw error;
  }
};

// ======================= LECTURER STATUS UPDATE EMAIL =======================
exports.sendLecturerStatusMail = async (data) => {
  const { email, firstname, lastname, status, message } = data;

  const subject = status === 'activated'
    ? 'Your Lecturer Account Has Been Activated - PadhaiHub'
    : 'Your Lecturer Account Has Been Deactivated - PadhaiHub';

  const messageType = {
    activated: {
      title: 'Account Activated',
      heading: 'Your lecturer account has been activated.',
      action: 'You can now access all lecturer features and create courses.'
    },
    deactivated: {
      title: 'Account Deactivated',
      heading: 'Your lecturer account has been deactivated.',
      action: 'You will not be able to access lecturer features until your account is reactivated.'
    }
  };

  const messageConfig = messageType[status] || messageType.deactivated;

  const htmlMessage = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table border="0" cellspacing="0" cellpadding="0" align="center" style="border-collapse: collapse; width: 100%; max-width: 560px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e0e0e0;">
        <tbody>
          <!-- Header -->
          <tr>
            <td style="padding: 30px 30px 20px 30px; border-bottom: 1px solid #eee;">
              <h1 style="color: #333; margin: 0; font-size: 22px; font-weight: 600;">PadhaiHub</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="color: #333; margin: 0 0 20px 0; font-size: 15px; line-height: 1.6;">
                Dear <strong>${firstname} ${lastname}</strong>,
              </p>

              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 3px; margin: 20px 0; border-left: 3px solid #6c757d;">
                <h3 style="margin-top: 0; color: #333; font-size: 16px;">${messageConfig.title}</h3>
                <p style="color: #555; margin: 0 0 10px 0; font-size: 14px; line-height: 1.6;">
                  <strong>${messageConfig.heading}</strong>
                </p>
                <p style="color: #555; margin: 0; font-size: 14px; line-height: 1.6;">
                  ${message || messageConfig.action}
                </p>
              </div>

              ${status === 'activated' ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URI}/instructor-dashboard" style="display: inline-block; background-color: #6c757d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 3px; font-size: 14px; font-weight: 600;">Go to Instructor Dashboard</a>
              </div>
              ` : ''}

              <p style="color: #555; line-height: 1.6; margin-bottom: 5px; font-size: 15px;">
                If you believe this is an error or have any questions, please contact our support team.
              </p>
              <p style="color: #555; line-height: 1.6; margin: 0; font-size: 15px;">
                Best regards,<br>The PadhaiHub Team
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; border-top: 1px solid #eee;">
              <p style="margin: 0 0 8px 0; color: #999; font-size: 12px;">
                © ${new Date().getFullYear()} PadhaiHub. All rights reserved.
              </p>
              <p style="margin: 0; color: #999; font-size: 12px;">
                This email was sent to ${email}
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </body>
    </html>`;

  const messageObj = {
    from: process.env.SENDER_EMAIL || 'noreply@padhaihub.com',
    to: email,
    subject: subject,
    html: htmlMessage
  };

  try {
    const result = await smtpTransport.sendMail(messageObj);
    console.log(`Lecturer status email (${status}) sent to ${email}`);
    return result;
  } catch (error) {
    console.error(`Error sending lecturer status email (${status}):`, error);
    throw error;
  }
};

// ======================= LECTURER DELETION EMAIL =======================
exports.sendLecturerDeletionMail = async (data) => {
  const { email, firstname, lastname, message } = data;

  const htmlMessage = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Lecturer Account Removal - PadhaiHub</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table border="0" cellspacing="0" cellpadding="0" align="center" style="border-collapse: collapse; width: 100%; max-width: 560px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e0e0e0;">
        <tbody>
          <!-- Header -->
          <tr>
            <td style="padding: 30px 30px 20px 30px; border-bottom: 1px solid #eee;">
              <h1 style="color: #333; margin: 0; font-size: 22px; font-weight: 600;">PadhaiHub</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <p style="color: #333; margin: 0 0 20px 0; font-size: 15px; line-height: 1.6;">
                Dear <strong>${firstname} ${lastname}</strong>,
              </p>

              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 3px; margin: 20px 0; border-left: 3px solid #6c757d;">
                <h3 style="margin-top: 0; color: #333; font-size: 16px;">Account Status Update</h3>
                <p style="color: #555; margin: 0 0 10px 0; font-size: 14px; line-height: 1.6;">
                  ${message || 'Your lecturer account has been removed from our system.'}
                </p>
                <p style="color: #555; margin: 0; font-size: 14px; line-height: 1.6;">
                  Your lecturer privileges have been revoked and you will no longer have access to lecturer features.
                </p>
              </div>

              <h3 style="color: #333; margin: 25px 0 15px 0; font-size: 16px;">You can still:</h3>
              <ul style="margin: 0 0 25px 0; padding-left: 20px; color: #555; font-size: 15px; line-height: 1.8;">
                <li>Continue using PadhaiHub as a learner</li>
                <li>Access all your enrolled courses</li>
                <li>Participate in discussions</li>
                <li>Complete your learning journey</li>
              </ul>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URI}" style="display: inline-block; background-color: #6c757d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 3px; font-size: 14px; font-weight: 600;">Continue Learning on PadhaiHub</a>
              </div>

              <p style="color: #555; line-height: 1.6; margin-bottom: 5px; font-size: 15px;">
                If you have any questions about this decision, please contact our support team.
              </p>
              <p style="color: #555; line-height: 1.6; margin: 0; font-size: 15px;">
                Sincerely,<br>The PadhaiHub Team
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; border-top: 1px solid #eee;">
              <p style="margin: 0 0 8px 0; color: #999; font-size: 12px;">
                © ${new Date().getFullYear()} PadhaiHub. All rights reserved.
              </p>
              <p style="margin: 0; color: #999; font-size: 12px;">
                This email was sent to ${email}
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </body>
    </html>`;

  const messageObj = {
    from: process.env.SENDER_EMAIL || 'noreply@padhaihub.com',
    to: email,
    subject: 'Lecturer Account Removal - PadhaiHub',
    html: htmlMessage
  };

  try {
    const result = await smtpTransport.sendMail(messageObj);
    console.log(`Lecturer deletion email sent to ${email}`);
    return result;
  } catch (error) {
    console.error('Error sending lecturer deletion email:', error);
    throw error;
  }
};
/**
 * Send enquiry notification emails
 * Sends to both admin and user
 */
exports.sendEnquiryMail = async (data) => {
  const { getAdminEnquiryTemplate, getUserEnquiryConfirmationTemplate } = require('./emailTemplates/enquiry.template');

  // Email to admin
  const adminMessage = {
    from: process.env.SENDER_EMAIL,
    to: process.env.ADMIN_EMAIL || 'wildgaming490@gmail.com', // Use env variable or fallback
    subject: `New Enquiry from ${data.name}`,
    html: getAdminEnquiryTemplate({
      name: data.name,
      email: data.email,
      phone: data.phone,
      level: data.level,
      message: data.message,
      submittedAt: data.submittedAt || new Date()
    })
  };

  // Email to user (confirmation)
  const userMessage = {
    from: process.env.SENDER_EMAIL,
    to: data.email,
    subject: 'Thank You for Your Enquiry - PadhaiHub',
    html: getUserEnquiryConfirmationTemplate({
      name: data.name,
      email: data.email,
      phone: data.phone,
      level: data.level
    })
  };

  try {
    // Send both emails
    const adminResult = await smtpTransport.sendMail(adminMessage);
    const userResult = await smtpTransport.sendMail(userMessage);

    return {
      success: true,
      adminResult,
      userResult
    };
  } catch (error) {
    console.error('Error sending enquiry emails:', error);
    throw error;
  }
};

/**
 * Send newsletter welcome email
 * Sends to user after they subscribe to the newsletter
 */
exports.sendNewsletterWelcomeMail = async (data) => {
  const { getNewsletterWelcomeTemplate } = require('./emailTemplates/newsletter.template');

  const message = {
    from: process.env.SENDER_EMAIL,
    to: data.email,
    subject: 'Welcome to PadhaiHub Newsletter',
    html: getNewsletterWelcomeTemplate({
      name: data.name || 'Subscriber',
      email: data.email
    })
  };

  try {
    const result = await smtpTransport.sendMail(message);
    return {
      success: true,
      result
    };
  } catch (error) {
    console.error('Error sending newsletter welcome email:', error);
    throw error;
  }
};
// ======================= COURSE REQUEST NOTIFICATION TO ADMIN =======================
exports.sendCourseRequestNotification = async (data) => {
  const { adminEmail, adminName, courseTitle, creatorName, creatorEmail, courseId, dashboardLink } = data;

  const message = {
    from: process.env.SENDER_EMAIL || 'noreply@padhaihub.com',
    to: adminEmail,
    subject: `New Course Approval Request: ${courseTitle} - PadhaiHub`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Course Request - PadhaiHub Admin</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <table border="0" cellspacing="0" cellpadding="0" align="center" style="border-collapse: collapse; width: 100%; max-width: 560px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e0e0e0;">
          <tbody>
            <!-- Header -->
            <tr>
              <td style="padding: 30px 30px 20px 30px; border-bottom: 1px solid #eee;">
                <h1 style="color: #333; margin: 0; font-size: 22px; font-weight: 600;">PadhaiHub Admin</h1>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 30px;">
                <p style="color: #333; margin: 0 0 20px 0; font-size: 15px; line-height: 1.6;">
                  Hello <strong>${adminName}</strong>,
                </p>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 3px; margin: 20px 0; border-left: 3px solid #6c757d;">
                  <h3 style="margin-top: 0; color: #333; font-size: 16px;">New Course Approval Request</h3>
                  <p style="color: #555; margin: 0; font-size: 14px; line-height: 1.6;">
                    A new course has been submitted and requires your review.
                  </p>
                </div>

                <h4 style="color: #333; margin: 25px 0 15px 0; font-size: 16px;">Course Details:</h4>
                <table border="0" cellspacing="0" cellpadding="0" style="width: 100%; margin-bottom: 25px;">
                  <tr>
                    <td style="padding: 8px 0; color: #888; font-size: 14px; width: 30%;">Course Title:</td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px;">${courseTitle}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #888; font-size: 14px;">Created By:</td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px;">${creatorName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #888; font-size: 14px;">Creator Email:</td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px;">${creatorEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #888; font-size: 14px;">Course ID:</td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px;">${courseId}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #888; font-size: 14px;">Submitted:</td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px;">${new Date().toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #888; font-size: 14px;">Status:</td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px;">Pending Approval</td>
                  </tr>
                </table>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${dashboardLink}" style="display: inline-block; background-color: #6c757d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 3px; font-size: 14px; font-weight: 600;">Review Course in Admin Panel</a>
                </div>

                <p style="color: #888; font-size: 12px; margin: 25px 0 0 0;">
                  This is an automated notification from PadhaiHub Admin System.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 20px 30px; border-top: 1px solid #eee;">
                <p style="margin: 0; color: #999; font-size: 12px;">
                  © ${new Date().getFullYear()} PadhaiHub Admin Portal
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>`
  };

  try {
    const result = await smtpTransport.sendMail(message);
    console.log(`Course request notification sent to admin ${adminEmail}`);
    return result;
  } catch (error) {
    console.error('Error sending course request notification:', error);
    throw error;
  }
};

// ======================= COURSE APPROVAL EMAIL =======================
exports.sendCourseApprovalMail = async (data) => {
  const { email, firstname, lastname, courseTitle, courseLink, publishDirectly } = data;

  const message = {
    from: process.env.SENDER_EMAIL || 'noreply@padhaihub.com',
    to: email,
    subject: `Your Course "${courseTitle}" Has Been Approved - PadhaiHub`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Course Approved - PadhaiHub</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <table border="0" cellspacing="0" cellpadding="0" align="center" style="border-collapse: collapse; width: 100%; max-width: 560px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e0e0e0;">
          <tbody>
            <!-- Header -->
            <tr>
              <td style="padding: 30px 30px 20px 30px; border-bottom: 1px solid #eee;">
                <h1 style="color: #333; margin: 0; font-size: 22px; font-weight: 600;">PadhaiHub</h1>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 30px;">
                <p style="color: #333; margin: 0 0 20px 0; font-size: 15px; line-height: 1.6;">
                  Dear <strong>${firstname} ${lastname}</strong>,
                </p>

                <div style="background-color: #f8f9fa; padding: 25px; border-radius: 3px; margin: 20px 0; border-left: 3px solid #6c757d; text-align: center;">
                  <h2 style="margin-top: 0; color: #333; font-size: 18px;">Course Approved</h2>
                  <p style="color: #555; margin: 0 0 10px 0; font-size: 15px; line-height: 1.6;">
                    Your course <strong>"${courseTitle}"</strong> has been approved by our admin team.
                  </p>
                  ${publishDirectly ?
        '<p style="color: #555; margin: 0; font-size: 15px; line-height: 1.6;"><strong>Great news! Your course has been published and is now live for students to enroll.</strong></p>' :
        '<p style="color: #555; margin: 0; font-size: 15px; line-height: 1.6;">You can now publish your course when you\'re ready.</p>'
      }
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${courseLink}" style="display: inline-block; background-color: #6c757d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 3px; font-size: 14px; font-weight: 600; margin: 5px;">View Your Course</a>
                  ${!publishDirectly ?
        '<a href="${process.env.FRONTEND_URI}/instructor/courses/manage" style="display: inline-block; background-color: #6c757d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 3px; font-size: 14px; font-weight: 600; margin: 5px;">Manage Courses</a>' :
        ''
      }
                </div>

                <h3 style="color: #333; margin: 25px 0 15px 0; font-size: 16px;">Next Steps:</h3>
                ${publishDirectly ?
        '<ul style="margin: 0 0 25px 0; padding-left: 20px; color: #555; font-size: 15px; line-height: 1.8;"><li>Start promoting your course</li><li>Monitor student enrollments</li><li>Engage with your students</li></ul>' :
        '<ul style="margin: 0 0 25px 0; padding-left: 20px; color: #555; font-size: 15px; line-height: 1.8;"><li>Review your course content</li><li>Publish your course when ready</li><li>Start promoting to students</li></ul>'
      }

                <p style="color: #555; line-height: 1.6; margin-bottom: 5px; font-size: 15px;">
                  Happy teaching!
                </p>
                <p style="color: #555; line-height: 1.6; margin: 0; font-size: 15px;">
                  Best regards,<br>The PadhaiHub Team
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 20px 30px; border-top: 1px solid #eee;">
                <p style="margin: 0 0 8px 0; color: #999; font-size: 12px;">
                  © ${new Date().getFullYear()} PadhaiHub. All rights reserved.
                </p>
                <p style="margin: 0; color: #999; font-size: 12px;">
                  This email was sent to ${email}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>`
  };

  try {
    const result = await smtpTransport.sendMail(message);
    console.log(`Course approval email sent to ${email}`);
    return result;
  } catch (error) {
    console.error('Error sending course approval email:', error);
    throw error;
  }
};

// ======================= COURSE REJECTION EMAIL =======================
exports.sendCourseRejectionMail = async (data) => {
  const { email, firstname, lastname, courseTitle, reason } = data;

  const message = {
    from: process.env.SENDER_EMAIL || 'noreply@padhaihub.com',
    to: email,
    subject: `Update on Your Course "${courseTitle}" - PadhaiHub`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Course Status Update - PadhaiHub</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <table border="0" cellspacing="0" cellpadding="0" align="center" style="border-collapse: collapse; width: 100%; max-width: 560px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e0e0e0;">
          <tbody>
            <!-- Header -->
            <tr>
              <td style="padding: 30px 30px 20px 30px; border-bottom: 1px solid #eee;">
                <h1 style="color: #333; margin: 0; font-size: 22px; font-weight: 600;">PadhaiHub</h1>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 30px;">
                <p style="color: #333; margin: 0 0 20px 0; font-size: 15px; line-height: 1.6;">
                  Dear <strong>${firstname} ${lastname}</strong>,
                </p>

                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 3px; margin: 20px 0; border-left: 3px solid #6c757d;">
                  <h3 style="margin-top: 0; color: #333; font-size: 16px;">Course Status: Requires Revision</h3>
                  <p style="color: #555; margin: 0 0 10px 0; font-size: 14px; line-height: 1.6;">
                    Thank you for submitting your course <strong>"${courseTitle}"</strong> for review.
                  </p>
                  <p style="color: #555; margin: 0 0 15px 0; font-size: 14px; line-height: 1.6;">
                    After careful evaluation, we need you to make some revisions before we can approve your course.
                  </p>
                  <div style="background-color: #ffffff; padding: 15px; border-radius: 3px; border: 1px solid #e0e0e0;">
                    <p style="color: #555; margin: 0; font-size: 14px; line-height: 1.6;">
                      <strong>Feedback:</strong> ${reason}
                    </p>
                  </div>
                </div>

                <h3 style="color: #333; margin: 25px 0 15px 0; font-size: 16px;">Suggestions for Improvement:</h3>
                <ul style="margin: 0 0 25px 0; padding-left: 20px; color: #555; font-size: 15px; line-height: 1.8;">
                  <li>Review the feedback provided</li>
                  <li>Make the necessary changes to your course content</li>
                  <li>Ensure all requirements are met</li>
                  <li>Resubmit for review when ready</li>
                </ul>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.FRONTEND_URI}/instructor/courses/edit" style="display: inline-block; background-color: #6c757d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 3px; font-size: 14px; font-weight: 600;">Edit Your Course</a>
                </div>

                <p style="color: #555; line-height: 1.6; margin-bottom: 5px; font-size: 15px;">
                  We appreciate your effort and look forward to your revised submission.
                </p>
                <p style="color: #555; line-height: 1.6; margin: 0; font-size: 15px;">
                  Sincerely,<br>The PadhaiHub Team
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 20px 30px; border-top: 1px solid #eee;">
                <p style="margin: 0 0 8px 0; color: #999; font-size: 12px;">
                  © ${new Date().getFullYear()} PadhaiHub. All rights reserved.
                </p>
                <p style="margin: 0; color: #999; font-size: 12px;">
                  This email was sent to ${email}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>`
  };

  try {
    const result = await smtpTransport.sendMail(message);
    console.log(`Course rejection email sent to ${email}`);
    return result;
  } catch (error) {
    console.error('Error sending course rejection email:', error);
    throw error;
  }
};
// module.exports = sendMail
