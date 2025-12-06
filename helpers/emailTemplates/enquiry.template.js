/**
 * Email template for new enquiry notifications
 * Sends to admin when a new enquiry is submitted
 */
exports.getAdminEnquiryTemplate = (data) => {
  const levelMap = {
    'see': 'SEE (Class 10)',
    'plus2-science': '+2 Science',
    'plus2-management': '+2 Management',
    'plus2-humanities': '+2 Humanities',
    'other': 'Other'
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>New Enquiry</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table border="0" cellspacing="0" cellpadding="0" align="center" style="border-collapse: collapse; width: 100%; max-width: 560px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e0e0e0;">
        <tbody>
          <!-- Header -->
          <tr>
            <td style="padding: 25px 30px; border-bottom: 1px solid #eee;">
              <h1 style="color: #333; margin: 0; font-size: 18px; font-weight: 600;">New Enquiry Received</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 25px 30px;">
              <table border="0" cellspacing="0" cellpadding="0" style="width: 100%;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
                    <span style="color: #888; font-size: 13px;">Name</span><br/>
                    <span style="color: #333; font-size: 15px;">${data.name}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
                    <span style="color: #888; font-size: 13px;">Email</span><br/>
                    <a href="mailto:${data.email}" style="color: #333; font-size: 15px; text-decoration: none;">${data.email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
                    <span style="color: #888; font-size: 13px;">Phone</span><br/>
                    <a href="tel:${data.phone}" style="color: #333; font-size: 15px; text-decoration: none;">${data.phone}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; ${data.message ? 'border-bottom: 1px solid #f0f0f0;' : ''}">
                    <span style="color: #888; font-size: 13px;">Level</span><br/>
                    <span style="color: #333; font-size: 15px;">${levelMap[data.level] || data.level}</span>
                  </td>
                </tr>
                ${data.message ? `
                <tr>
                  <td style="padding: 10px 0;">
                    <span style="color: #888; font-size: 13px;">Message</span><br/>
                    <span style="color: #333; font-size: 15px; line-height: 1.5;">${data.message}</span>
                  </td>
                </tr>
                ` : ''}
              </table>

              <p style="color: #888; font-size: 12px; margin: 25px 0 0 0;">
                Received: ${new Date(data.submittedAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; border-top: 1px solid #eee;">
              <p style="margin: 0; color: #999; font-size: 12px;">
                PadhaiHub Enquiry System
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </body>
    </html>
  `;
};

/**
 * Email template for enquiry confirmation to the user
 * Sends to user after they submit an enquiry
 */
exports.getUserEnquiryConfirmationTemplate = (data) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Enquiry Received</title>
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
                Hi ${data.name},
              </p>

              <p style="color: #555; line-height: 1.6; margin-bottom: 20px; font-size: 15px;">
                Thanks for reaching out. We've received your enquiry and will get back to you soon.
              </p>

              <p style="color: #555; line-height: 1.6; margin-bottom: 20px; font-size: 15px;">
                Here's a summary of what you submitted:
              </p>

              <table border="0" cellspacing="0" cellpadding="0" style="width: 100%; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 8px 0; color: #888; font-size: 14px; width: 80px;">Email:</td>
                  <td style="padding: 8px 0; color: #333; font-size: 14px;">${data.email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #888; font-size: 14px;">Phone:</td>
                  <td style="padding: 8px 0; color: #333; font-size: 14px;">${data.phone}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #888; font-size: 14px;">Level:</td>
                  <td style="padding: 8px 0; color: #333; font-size: 14px;">${data.level}</td>
                </tr>
              </table>

              <p style="color: #555; line-height: 1.6; margin-bottom: 0; font-size: 15px;">
                If you have any questions, feel free to reply to this email.
              </p>

              <p style="color: #555; line-height: 1.6; margin: 25px 0 0 0; font-size: 15px;">
                — The PadhaiHub Team
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
                GreenMantis, Kathmandu, Nepal
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </body>
    </html>
  `;
};
