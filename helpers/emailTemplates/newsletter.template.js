/**
 * Email template for newsletter welcome message
 * Sends to user when they subscribe to the newsletter
 */
exports.getNewsletterWelcomeTemplate = (data) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Welcome to PadhaiHub Newsletter</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
      <table border="0" cellspacing="0" cellpadding="0" align="center" style="border-collapse: collapse; width: 100%; max-width: 600px; margin: 20px auto; background-color: #ffffff;">
        <tbody>
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1877f2 0%, #0d5dbf 100%); padding: 40px 30px; text-align: center;">
              <img src="https://digischoolglobal.com/wp-content/uploads/2022/04/Digi-school-logo.png"
                   height="60"
                   alt="PadhaiHub"
                   style="margin-bottom: 20px;" />
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Welcome to PadhaiHub!</h1>
              <p style="color: #ffffff; margin: 15px 0 0 0; opacity: 0.95; font-size: 16px;">Thank you for subscribing to our newsletter</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin: 0 0 15px 0; font-size: 22px;">Hello ${data.name}!</h2>

              <p style="color: #555555; line-height: 1.8; margin-bottom: 20px; font-size: 15px;">
                We're thrilled to have you join the PadhaiHub community! You're now part of thousands of students who are taking their education journey to the next level.
              </p>

              <!-- Benefits Box -->
              <div style="background: linear-gradient(135deg, #e7f3ff 0%, #f0f8ff 100%); padding: 25px; border-radius: 10px; border-left: 4px solid #1877f2; margin: 25px 0;">
                <p style="margin: 0 0 15px 0; color: #0d5dbf; font-weight: bold; font-size: 16px;">What you'll receive:</p>
                <ul style="margin: 0; padding-left: 20px; color: #333333;">
                  <li style="margin-bottom: 10px;">📚 <strong>Latest course updates</strong> and new content releases</li>
                  <li style="margin-bottom: 10px;">🎯 <strong>Study tips & tricks</strong> from expert educators</li>
                  <li style="margin-bottom: 10px;">💡 <strong>Educational resources</strong> to boost your learning</li>
                  <li style="margin-bottom: 10px;">🎁 <strong>Exclusive offers</strong> and early access to new features</li>
                  <li style="margin-bottom: 0;">📢 <strong>Important announcements</strong> and event notifications</li>
                </ul>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 35px 0;">
                <a href="${process.env.FRONTEND_URI || 'http://localhost:3000'}"
                   style="display: inline-block; background-color: #1877f2; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Explore Courses
                </a>
              </div>

              <!-- Additional Info -->
              <div style="background-color: #fff9e6; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 25px 0;">
                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                  💡 <strong>Pro Tip:</strong> Add our email address to your contacts to ensure you never miss an update!
                </p>
              </div>

              <!-- Social Media Section -->
              <div style="margin-top: 30px; padding: 25px; background-color: #f8f9fa; border-radius: 8px; text-align: center;">
                <p style="margin: 0 0 15px 0; color: #333333; font-weight: bold; font-size: 15px;">Connect with us on social media</p>
                <p style="margin: 0; color: #555555; font-size: 14px;">
                  Follow us for daily educational content, tips, and community support
                </p>
              </div>

              <!-- Unsubscribe Note -->
              <p style="color: #999999; font-size: 12px; margin-top: 30px; line-height: 1.6; text-align: center;">
                You're receiving this email because you subscribed to PadhaiHub newsletter.<br/>
                Not interested anymore? <a href="${process.env.FRONTEND_URI || 'http://localhost:3000'}/unsubscribe?email=${encodeURIComponent(data.email)}" style="color: #1877f2; text-decoration: none;">Unsubscribe here</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; color: #8a8d91; font-size: 13px; font-weight: bold;">
                PadhaiHub - Empowering Students Across Nepal
              </p>
              <p style="margin: 10px 0 0 0; color: #8a8d91; font-size: 12px;">
                Digi Technology, Kathmandu, Nepal
              </p>
              <p style="margin: 10px 0 0 0; color: #8a8d91; font-size: 12px;">
                © ${new Date().getFullYear()} PadhaiHub. All rights reserved.
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </body>
    </html>
  `;
};
