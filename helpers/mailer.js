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
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
          .logo { color: white; font-size: 28px; font-weight: bold; text-decoration: none; }
          .content { padding: 40px; }
          .greeting { font-size: 18px; margin-bottom: 20px; }
          .message { font-size: 16px; margin-bottom: 30px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                   color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; 
                   font-weight: bold; font-size: 16px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .highlight { background: #f0f7ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <a href="${process.env.FRONTEND_URI}" class="logo">PadhaiHub</a>
          </div>
          
          <div class="content">
            <div class="greeting">
              Hello <strong>${firstname} ${lastname}</strong>,
            </div>
            
            <div class="message">
              <p>Welcome to <strong>PadhaiHub</strong>! We're excited to have you on board.</p>
              <p>To complete your registration and activate your account, please verify your email address.</p>
            </div>
            
            ${data.isLecturerApplicant ? `
            <div class="highlight">
              <p><strong>Lecturer Application Note:</strong> Your application for lecturer position will be reviewed by our admin team <strong>after</strong> email verification.</p>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${link}" class="button">Verify Email Address</a>
            </div>
            
            <div style="margin-top: 30px;">
              <p><strong>Important:</strong> This link will expire in 24 hours.</p>
              <p>If you didn't create an account with PadhaiHub, you can safely ignore this email.</p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p>Need help? <a href="mailto:support@padhaihub.com" style="color: #667eea;">Contact our support team</a></p>
            </div>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} PadhaiHub. All rights reserved.</p>
            <p>This email was sent to ${email}</p>
            <p><a href="${process.env.FRONTEND_URI}/unsubscribe" style="color: #666;">Unsubscribe</a></p>
          </div>
        </div>
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
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; }
          .logo { color: white; font-size: 28px; font-weight: bold; text-decoration: none; }
          .content { padding: 40px; }
          .greeting { font-size: 18px; margin-bottom: 20px; }
          .button { display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); 
                   color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; 
                   font-weight: bold; font-size: 16px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .warning { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <a href="${process.env.FRONTEND_URI}" class="logo">PadhaiHub</a>
          </div>
          
          <div class="content">
            <div class="greeting">
              Hello <strong>${firstname} ${lastname}</strong>,
            </div>
            
            <div>
              <p>We received a request to reset your password for your PadhaiHub account.</p>
              <p>Click the button below to create a new password:</p>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${link}" class="button">Reset Password</a>
            </div>
            
            <div class="warning">
              <p><strong>Security Notice:</strong> This link will expire in 1 hour.</p>
              <p>If you didn't request a password reset, please ignore this email or contact support if you're concerned about your account's security.</p>
            </div>
            
            <div style="margin-top: 30px;">
              <p>Best regards,<br>The PadhaiHub Team</p>
            </div>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} PadhaiHub. All rights reserved.</p>
            <p>This email was sent to ${email}</p>
          </div>
        </div>
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
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; text-align: center; }
          .logo { color: white; font-size: 28px; font-weight: bold; text-decoration: none; }
          .content { padding: 40px; }
          .greeting { font-size: 18px; margin-bottom: 20px; }
          .status-box { background: #e8f4fd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4facfe; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <a href="${process.env.FRONTEND_URI}" class="logo">PadhaiHub</a>
          </div>
          
          <div class="content">
            <div class="greeting">
              Hello <strong>${firstname} ${lastname}</strong>,
            </div>
            
            <div>
              <p>Thank you for verifying your email address and applying to become a lecturer at PadhaiHub!</p>
              
              <div class="status-box">
                <h3 style="margin-top: 0; color: #4facfe;">📋 Application Status: Under Review</h3>
                <p>Your lecturer application has been submitted successfully and is now being reviewed by our admin team.</p>
              </div>
              
              <h4>What happens next?</h4>
              <ol>
                <li>Our team will review your application and documents</li>
                <li>You will receive an email with the decision within 3-5 business days</li>
                <li>If approved, you'll gain access to lecturer features</li>
                <li>You can continue using PadhaiHub as a learner while waiting</li>
              </ol>
              
              <p><strong>Current Access:</strong> You can login to your account and access learner features.</p>
            </div>
            
            <div style="margin-top: 30px;">
              <p>Thank you for your patience!</p>
              <p>Best regards,<br>The PadhaiHub Team</p>
            </div>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} PadhaiHub. All rights reserved.</p>
            <p>This email was sent to ${email}</p>
          </div>
        </div>
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
    subject: `🔔 New Lecturer Application: ${applicantName} - PadhaiHub`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Lecturer Application - PadhaiHub Admin</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
          .logo { color: white; font-size: 28px; font-weight: bold; text-decoration: none; }
          .content { padding: 40px; }
          .greeting { font-size: 18px; margin-bottom: 20px; }
          .alert-box { background: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
          .applicant-info { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                   color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; 
                   font-weight: bold; font-size: 14px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <a href="${process.env.FRONTEND_URI}" class="logo">PadhaiHub Admin</a>
          </div>
          
          <div class="content">
            <div class="greeting">
              Hello <strong>${adminName}</strong>,
            </div>
            
            <div class="alert-box">
              <h3 style="margin-top: 0; color: #856404;">📋 New Lecturer Application Requires Review</h3>
              <p>A new lecturer application has been submitted and requires your attention.</p>
            </div>
            
            <div class="applicant-info">
              <h4 style="margin-top: 0;">Applicant Details:</h4>
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 8px 0; width: 40%;"><strong>Name:</strong></td>
                  <td style="padding: 8px 0;">${applicantName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Email:</strong></td>
                  <td style="padding: 8px 0;">${applicantEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Application ID:</strong></td>
                  <td style="padding: 8px 0;">${applicationId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Submitted:</strong></td>
                  <td style="padding: 8px 0;">${new Date().toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Status:</strong></td>
                  <td style="padding: 8px 0; color: #856404;">Pending Review</td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${dashboardLink}" class="button">Review Application in Admin Panel</a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p><small>This is an automated notification from PadhaiHub Admin System.</small></p>
            </div>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} PadhaiHub Admin Portal</p>
          </div>
        </div>
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
    subject: '🎉 Congratulations! Your Lecturer Application Has Been Approved - PadhaiHub',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application Approved - PadhaiHub</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); padding: 40px; text-align: center; }
          .logo { color: white; font-size: 32px; font-weight: bold; text-decoration: none; }
          .content { padding: 40px; }
          .greeting { font-size: 20px; margin-bottom: 20px; }
          .congrats-box { background: #d4edda; padding: 25px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745; text-align: center; }
          .button { display: inline-block; background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); 
                   color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; 
                   font-weight: bold; font-size: 16px; margin: 10px; }
          .features { background: #f0f9ff; padding: 20px; border-radius: 5px; margin: 30px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <a href="${process.env.FRONTEND_URI}" class="logo">PadhaiHub</a>
          </div>
          
          <div class="content">
            <div class="greeting">
              Dear <strong>${firstname} ${lastname}</strong>,
            </div>
            
            <div class="congrats-box">
              <h1 style="margin-top: 0; color: #155724;">🎉 Congratulations! 🎉</h1>
              <p style="font-size: 18px;">We are thrilled to inform you that your lecturer application has been <strong>APPROVED</strong>!</p>
              <p style="font-size: 18px;">Welcome to the PadhaiHub Teaching Team!</p>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${loginLink}" class="button">Login to Your Account</a>
              <a href="${dashboardLink}" class="button">Go to Lecturer Dashboard</a>
            </div>
            
            <div class="features">
              <h3 style="color: #0056b3;">🎯 What You Can Do Now:</h3>
              <ul>
                <li>Create and manage courses</li>
                <li>Upload educational content (videos, PDFs, quizzes)</li>
                <li>Interact with students</li>
                <li>Track your course performance</li>
                <li>Earn through our instructor program</li>
              </ul>
            </div>
            
            <div>
              <h4>📚 Getting Started:</h4>
              <ol>
                <li>Complete your lecturer profile</li>
                <li>Review our teaching guidelines</li>
                <li>Create your first course</li>
                <li>Explore available resources</li>
              </ol>
              
              <p><strong>Need help?</strong> Check our <a href="${process.env.FRONTEND_URI}/instructor-guide" style="color: #43e97b;">Instructor Guide</a> or contact our support team.</p>
            </div>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
              <p>We're excited to see what you'll teach!</p>
              <p>Best regards,<br><strong>The PadhaiHub Team</strong></p>
            </div>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} PadhaiHub. All rights reserved.</p>
            <p>This email was sent to ${email}</p>
          </div>
        </div>
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
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; }
          .logo { color: white; font-size: 28px; font-weight: bold; text-decoration: none; }
          .content { padding: 40px; }
          .greeting { font-size: 18px; margin-bottom: 20px; }
          .status-box { background: #f8d7da; padding: 25px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545; }
          .suggestion-box { background: #fff3cd; padding: 20px; border-radius: 5px; margin: 30px 0; }
          .button { display: inline-block; background: #6c757d; color: white; padding: 12px 24px; 
                   text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 14px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <a href="${process.env.FRONTEND_URI}" class="logo">PadhaiHub</a>
          </div>
          
          <div class="content">
            <div class="greeting">
              Dear <strong>${firstname} ${lastname}</strong>,
            </div>
            
            <div class="status-box">
              <h3 style="margin-top: 0; color: #721c24;">📄 Application Status: Not Approved</h3>
              <p>Thank you for your interest in becoming a lecturer at PadhaiHub and for taking the time to apply.</p>
              <p>After careful review of your application, we regret to inform you that we are unable to approve your application at this time.</p>
              
              ${reason ? `
              <div style="background: white; padding: 15px; border-radius: 3px; margin-top: 15px;">
                <strong>Reason:</strong> ${reason}
              </div>
              ` : ''}
            </div>
            
            <div class="suggestion-box">
              <h4 style="color: #856404;">💡 Suggestions for Future Applications:</h4>
              <ul>
                <li>Gain more teaching experience</li>
                <li>Complete relevant certifications</li>
                <li>Build a portfolio of your work</li>
                <li>Consider reapplying after 6 months</li>
              </ul>
            </div>
            
            <div>
              <p><strong>You Can Still:</strong></p>
              <ul>
                <li>Continue using PadhaiHub as a learner</li>
                <li>Enroll in courses to enhance your skills</li>
                <li>Stay updated with our platform improvements</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URI}/courses" class="button">Browse Available Courses</a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p>We appreciate your interest in PadhaiHub and wish you the best in your future endeavors.</p>
              <p>Sincerely,<br><strong>The PadhaiHub Team</strong></p>
            </div>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} PadhaiHub. All rights reserved.</p>
            <p>This email was sent to ${email}</p>
          </div>
        </div>
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

  const bgColor = status === 'activated'
    ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';

  const boxColor = status === 'activated'
    ? '#d4edda' : '#f8d7da';

  const borderColor = status === 'activated'
    ? '#28a745' : '#dc3545';

  const messageType = {
    activated: {
      title: '✅ Account Activated',
      heading: 'Your lecturer account has been activated!',
      action: 'You can now access all lecturer features and create courses.'
    },
    deactivated: {
      title: '⛔ Account Deactivated',
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
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: ${bgColor}; padding: 30px; text-align: center; }
        .logo { color: white; font-size: 28px; font-weight: bold; text-decoration: none; }
        .content { padding: 40px; }
        .greeting { font-size: 18px; margin-bottom: 20px; }
        .status-box { background: ${boxColor}; padding: 25px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${borderColor}; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .button { display: inline-block; background: ${status === 'activated' ? '#43e97b' : '#6c757d'}; 
                 color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; 
                 font-weight: bold; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <a href="${process.env.FRONTEND_URI}" class="logo">PadhaiHub</a>
        </div>
        
        <div class="content">
          <div class="greeting">
            Dear <strong>${firstname} ${lastname}</strong>,
          </div>
          
          <div class="status-box">
            <h3 style="margin-top: 0; color: ${status === 'activated' ? '#155724' : '#721c24'};">${messageConfig.title}</h3>
            <p style="font-size: 16px;"><strong>${messageConfig.heading}</strong></p>
            <p>${message || messageConfig.action}</p>
          </div>
          
          ${status === 'activated' ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URI}/lecturer/dashboard" class="button">Go to Lecturer Dashboard</a>
          </div>
          ` : ''}
          
          <div style="margin-top: 30px;">
            <p>If you believe this is an error or have any questions, please contact our support team.</p>
            <p>Best regards,<br><strong>The PadhaiHub Team</strong></p>
          </div>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} PadhaiHub. All rights reserved.</p>
          <p>This email was sent to ${email}</p>
        </div>
      </div>
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
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
        .logo { color: white; font-size: 28px; font-weight: bold; text-decoration: none; }
        .content { padding: 40px; }
        .greeting { font-size: 18px; margin-bottom: 20px; }
        .info-box { background: #f8f9fa; padding: 25px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #6c757d; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .button { display: inline-block; background: #6c757d; color: white; padding: 12px 24px; 
                 text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <a href="${process.env.FRONTEND_URI}" class="logo">PadhaiHub</a>
        </div>
        
        <div class="content">
          <div class="greeting">
            Dear <strong>${firstname} ${lastname}</strong>,
          </div>
          
          <div class="info-box">
            <h3 style="margin-top: 0; color: #495057;">📄 Account Status Update</h3>
            <p>${message || 'Your lecturer account has been removed from our system.'}</p>
            <p>Your lecturer privileges have been revoked and you will no longer have access to lecturer features.</p>
          </div>
          
          <div>
            <p><strong>You can still:</strong></p>
            <ul>
              <li>Continue using PadhaiHub as a learner</li>
              <li>Access all your enrolled courses</li>
              <li>Participate in discussions</li>
              <li>Complete your learning journey</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URI}" class="button">Continue Learning on PadhaiHub</a>
          </div>
          
          <div style="margin-top: 30px;">
            <p>If you have any questions about this decision, please contact our support team.</p>
            <p>Sincerely,<br><strong>The PadhaiHub Team</strong></p>
          </div>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} PadhaiHub. All rights reserved.</p>
          <p>This email was sent to ${email}</p>
        </div>
      </div>
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
    subject: 'Welcome to PadhaiHub Newsletter! 🎉',
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
    subject: `🔔 New Course Approval Request: ${courseTitle} - PadhaiHub`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Course Request - PadhaiHub Admin</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
          .logo { color: white; font-size: 28px; font-weight: bold; text-decoration: none; }
          .content { padding: 40px; }
          .greeting { font-size: 18px; margin-bottom: 20px; }
          .alert-box { background: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
          .course-info { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                   color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; 
                   font-weight: bold; font-size: 14px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <a href="${process.env.FRONTEND_URI}" class="logo">PadhaiHub Admin</a>
          </div>
          
          <div class="content">
            <div class="greeting">
              Hello <strong>${adminName}</strong>,
            </div>
            
            <div class="alert-box">
              <h3 style="margin-top: 0; color: #856404;">📋 New Course Approval Request</h3>
              <p>A new course has been submitted and requires your review.</p>
            </div>
            
            <div class="course-info">
              <h4 style="margin-top: 0;">Course Details:</h4>
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 8px 0; width: 30%;"><strong>Course Title:</strong></td>
                  <td style="padding: 8px 0;">${courseTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Created By:</strong></td>
                  <td style="padding: 8px 0;">${creatorName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Creator Email:</strong></td>
                  <td style="padding: 8px 0;">${creatorEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Course ID:</strong></td>
                  <td style="padding: 8px 0;">${courseId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Submitted:</strong></td>
                  <td style="padding: 8px 0;">${new Date().toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Status:</strong></td>
                  <td style="padding: 8px 0; color: #856404;">Pending Approval</td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${dashboardLink}" class="button">Review Course in Admin Panel</a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p><small>This is an automated notification from PadhaiHub Admin System.</small></p>
            </div>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} PadhaiHub Admin Portal</p>
          </div>
        </div>
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
    subject: `🎉 Your Course "${courseTitle}" Has Been Approved - PadhaiHub`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Course Approved - PadhaiHub</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); padding: 40px; text-align: center; }
          .logo { color: white; font-size: 32px; font-weight: bold; text-decoration: none; }
          .content { padding: 40px; }
          .greeting { font-size: 20px; margin-bottom: 20px; }
          .congrats-box { background: #d4edda; padding: 25px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745; text-align: center; }
          .button { display: inline-block; background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); 
                   color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; 
                   font-weight: bold; font-size: 16px; margin: 10px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <a href="${process.env.FRONTEND_URI}" class="logo">PadhaiHub</a>
          </div>
          
          <div class="content">
            <div class="greeting">
              Dear <strong>${firstname} ${lastname}</strong>,
            </div>
            
            <div class="congrats-box">
              <h1 style="margin-top: 0; color: #155724;">✅ Course Approved!</h1>
              <p style="font-size: 18px;">Your course <strong>"${courseTitle}"</strong> has been approved by our admin team.</p>
              ${publishDirectly ? 
                '<p style="font-size: 16px; color: #155724;"><strong>🎉 Great news! Your course has been published and is now live for students to enroll.</strong></p>' : 
                '<p style="font-size: 16px;">You can now publish your course when you\'re ready.</p>'
              }
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${courseLink}" class="button">View Your Course</a>
              ${!publishDirectly ? 
                '<a href="${process.env.FRONTEND_URI}/instructor/courses/manage" class="button">Manage Courses</a>' : 
                ''
              }
            </div>
            
            <div style="margin-top: 30px;">
              <h4>Next Steps:</h4>
              ${publishDirectly ? 
                '<ul><li>Start promoting your course</li><li>Monitor student enrollments</li><li>Engage with your students</li></ul>' : 
                '<ul><li>Review your course content</li><li>Publish your course when ready</li><li>Start promoting to students</li></ul>'
              }
            </div>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
              <p>Happy teaching!</p>
              <p>Best regards,<br><strong>The PadhaiHub Team</strong></p>
            </div>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} PadhaiHub. All rights reserved.</p>
            <p>This email was sent to ${email}</p>
          </div>
        </div>
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
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; }
          .logo { color: white; font-size: 28px; font-weight: bold; text-decoration: none; }
          .content { padding: 40px; }
          .greeting { font-size: 18px; margin-bottom: 20px; }
          .status-box { background: #f8d7da; padding: 25px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545; }
          .suggestion-box { background: #fff3cd; padding: 20px; border-radius: 5px; margin: 30px 0; }
          .button { display: inline-block; background: #6c757d; color: white; padding: 12px 24px; 
                   text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 14px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <a href="${process.env.FRONTEND_URI}" class="logo">PadhaiHub</a>
          </div>
          
          <div class="content">
            <div class="greeting">
              Dear <strong>${firstname} ${lastname}</strong>,
            </div>
            
            <div class="status-box">
              <h3 style="margin-top: 0; color: #721c24;">📄 Course Status: Requires Revision</h3>
              <p>Thank you for submitting your course <strong>"${courseTitle}"</strong> for review.</p>
              <p>After careful evaluation, we need you to make some revisions before we can approve your course.</p>
              
              <div style="background: white; padding: 15px; border-radius: 3px; margin-top: 15px;">
                <strong>Feedback:</strong> ${reason}
              </div>
            </div>
            
            <div class="suggestion-box">
              <h4 style="color: #856404;">💡 Suggestions for Improvement:</h4>
              <ul>
                <li>Review the feedback provided</li>
                <li>Make the necessary changes to your course content</li>
                <li>Ensure all requirements are met</li>
                <li>Resubmit for review when ready</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URI}/instructor/courses/edit" class="button">Edit Your Course</a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p>We appreciate your effort and look forward to your revised submission.</p>
              <p>Sincerely,<br><strong>The PadhaiHub Team</strong></p>
            </div>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} PadhaiHub. All rights reserved.</p>
            <p>This email was sent to ${email}</p>
          </div>
        </div>
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
