const nodemailer = require('nodemailer');

const smtpTransport = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_EMAIL_PASSWORD
  }
});

exports.sendVerificationMail = async (data) => {
  const message = {
    from: 'wildgaming490@gmail.com',
    to: data.email,
    subject: 'EduNepal email verification',
    html: `
        <!DOCTYPE html>
        <html lang="en">
        
        <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Email Verification</title>
        </head>
        
        <body>
          <table border="0" cellspacing="0" cellpadding="0" align="center" id="m_1933259993185685521email_table"
            style="border-collapse: collapse; width: 30%;">
            <tbody>
              <tr>
                <td id="m_1933259993185685521email_content"
                  style="font-family: Helvetica Neue, Helvetica, Lucida Grande, tahoma, verdana, arial, sans-serif; background: #ffffff">
                  <table border="0" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse">
                    <tbody>
                      <tr>
                        <td height="20" style="line-height: 20px" colspan="3">&nbsp;</td>
                      </tr>
                      <tr>
                        <td height="1" colspan="3" style="line-height: 1px">
                          <span style="color: #ffffff; font-size: 1px; opacity: 0">We received a request to reset your
                            schoolworkspro.com password.</span>
                        </td>
                      </tr>
                      <tr>
                        <td width="15" style="display: block; width: 15px">&nbsp;&nbsp;&nbsp;</td>
                        <td>
                          <table border="0" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse">
                            <tbody>
                              <tr>
                                <td height="15" style="line-height: 15px">&nbsp;</td>
                              </tr>
                              <tr>
                                <td width="32" align="center" valign="middle" style="height: 32px; line-height: 0px; ">
                                  <img src="https://digischoolglobal.com/wp-content/uploads/2022/04/Digi-school-logo.png"
                                    height="80" alt="schoolworkspro.com" style="
                                            margin: auto;
                                              border: 0;
                                              font-size: 19px;
                                              font-family: Helvetica Neue, Helvetica, Lucida Grande, tahoma, verdana, arial, sans-serif;
                                              color: #1877f2;
                                            " class="CToWUd" />
                                </td>
                              </tr>
                              <tr style="border-bottom: solid 1px #e5e5e5">
                                <td height="15" style="line-height: 15px">&nbsp;</td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                        <td width="15" style="display: block; width: 15px">&nbsp;&nbsp;&nbsp;</td>
                      </tr>
                      <tr>
                        <td width="15" style="display: block; width: 15px">&nbsp;&nbsp;&nbsp;</td>
                        <td>
                          <table border="0" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse">
                            <tbody>
                              <tr>
                                <td height="4" style="line-height: 4px">&nbsp;</td>
                              </tr>
                              <tr>
                                <td>
                                  <span class="m_1933259993185685521mb_text" style="
                                              font-family: Helvetica Neue, Helvetica, Lucida Grande, tahoma, verdana, arial, sans-serif;
                                              font-size: 16px;
                                              line-height: 21px;
                                              color: #141823;
                                            "><span style="font-size: 15px">
                                      <p></p>
                                      <div style="margin-top: 16px; margin-bottom: 20px; font-weight: bold;">Hello
                                        ${data.firstname} ${data.lastname},</div>
                                      <div>
                                        We're glad you signed up.<br />
                                        Please verify your email address to finish setting up your account.<br />
        
                                        <!-- <a style="font-weight: bold" href="https://schoolworkspro.com"
                                          target="_blank">schoolworkspro.com</a>
                                        password. -->
                                      </div>
                                      <br />
                                      <!-- Click on the following button to reset your password.
                                      <p></p> -->
                                      <table border="0" width="100%" cellspacing="0" cellpadding="0"
                                        style="border-collapse: collapse">
                                        <tbody>
                                          <tr>
                                            <td height="20" style="line-height: 20px">&nbsp;</td>
                                          </tr>
                                          <tr>
                                            <td align="middle">
                                              <a href="${data.link}" style="color: #3b5998; text-decoration: none"
                                                target="_blank" data-saferedirecturl="${data.link}">
                                                <table border="0" width="100%" cellspacing="0" cellpadding="0"
                                                  style="border-collapse: collapse">
                                                  <tbody>
                                                    <tr>
                                                      <td style="
                                                                  border-collapse: collapse;
                                                                  border-radius: 6px;
                                                                  text-align: center;
                                                                  display: block;
                                                                  border: none;
                                                                  background: #1877f2;
                                                                  padding: 6px 20px 10px 20px;
                                                                ">
                                                        <a href="${data.link}"
                                                          style="color: #3b5998; text-decoration: none; display: block"
                                                          target="_blank" data-saferedirecturl="${data.link}">
                                                          <center>
                                                            <font size="3">
                                                              <span style="
                                                                          font-weight: bold;
                                                                          font-family: Helvetica Neue, Helvetica, Lucida Grande, tahoma, verdana, arial,
                                                                            sans-serif;
                                                                          white-space: nowrap;
                                                                          font-weight: bold;
                                                                          vertical-align: middle;
                                                                          color: #ffffff;
                                                                          font-family: Roboto-Medium, Roboto, -apple-system, BlinkMacSystemFont,
                                                                            Helvetica Neue, Helvetica, Lucida Grande, tahoma, verdana, arial, sans-serif;
                                                                          font-size: 17px;
                                                                        ">Verify&nbsp;Now <i class="fas fa-band-aid"></i>
                                                              </span>
                                                            </font>
                                                          </center>
                                                        </a>
                                                      </td>
                                                    </tr>
                                                  </tbody>
                                                </table>
                                              </a>
                                            </td>
                                          </tr>
                                          <tr>
                                            <td height="8" style="line-height: 8px">&nbsp;</td>
                                          </tr>
                                          <tr>
                                            <td height="20" style="line-height: 20px">&nbsp;</td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      <br />
                                      <div><span style="color: #333333; font-weight: bold">If you weren't expecting this email,
                                          someone else may have entered your email address by accident. Please ignore this Message. </span>
                                      </div>                                      
                                    </span></span>
                                </td>
                              </tr>
                              <tr>
                                <td height="50" style="line-height: 50px">&nbsp;</td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                        <td width="15" style="display: block; width: 15px">&nbsp;&nbsp;&nbsp;</td>
                      </tr>
                      <tr>
                        <td width="15" style="display: block; width: 15px">&nbsp;&nbsp;&nbsp;</td>
                        <td>
                          <table border="0" width="100%" cellspacing="0" cellpadding="0" align="left"
                            style="border-collapse: collapse">
                            <tbody>
                              <tr style="border-top: solid 1px #e5e5e5">
                                <td height="19" style="line-height: 19px">&nbsp;</td>
                              </tr>
                              <tr>
                                <td style="
                                            font-family: Roboto-Regular, Roboto, -apple-system, BlinkMacSystemFont, Helvetica Neue, Helvetica,
                                              Lucida Grande, tahoma, verdana, arial, sans-serif;
                                            font-size: 12px;
                                            color: #8a8d91;
                                            line-height: 16px;
                                            font-weight: 400;
                                          ">
                                  This message was issued by Digi Technology, Kathmandu, Nepal<br />
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                        <td width="15" style="display: block; width: 15px">&nbsp;&nbsp;&nbsp;</td>
                      </tr>
                      <tr>
                        <td height="20" style="line-height: 20px" colspan="3">&nbsp;</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </body>
        
        </html>
        `
  };

  const result = await smtpTransport.sendMail(message);
  return result;
};


exports.sendPasswordResetMail = async (data) => {
  const message = {
    from: 'wildgaming490@gmail.com',
    to: data.email,
    subject: 'Digischool request for password reset',
    html: `
      <!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Verification</title>
</head>

<body>
  <table border="0" cellspacing="0" cellpadding="0" align="center" id="m_1933259993185685521email_table"
    style="border-collapse: collapse; width: 30%;">
    <tbody>
      <tr>
        <td id="m_1933259993185685521email_content"
          style="font-family: Helvetica Neue, Helvetica, Lucida Grande, tahoma, verdana, arial, sans-serif; background: #ffffff">
          <table border="0" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse">
            <tbody>
              <tr>
                <td height="20" style="line-height: 20px" colspan="3">&nbsp;</td>
              </tr>
              <tr>
                <td height="1" colspan="3" style="line-height: 1px">
                  <span style="color: #ffffff; font-size: 1px; opacity: 0">We received a request to reset your
                    schoolworkspro.com password.</span>
                </td>
              </tr>
              <tr>
                <td width="15" style="display: block; width: 15px">&nbsp;&nbsp;&nbsp;</td>
                <td>
                  <table border="0" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse">
                    <tbody>
                      <tr>
                        <td height="15" style="line-height: 15px">&nbsp;</td>
                      </tr>
                      <tr>
                        <td width="32" align="center" valign="middle" style="height: 32px; line-height: 0px; ">
                          <img src="https://digischoolglobal.com/wp-content/uploads/2022/04/Digi-school-logo.png"
                            height="80" alt="schoolworkspro.com" style="
                                    margin: auto;
                                      border: 0;
                                      font-size: 19px;
                                      font-family: Helvetica Neue, Helvetica, Lucida Grande, tahoma, verdana, arial, sans-serif;
                                      color: #1877f2;
                                    " class="CToWUd" />
                        </td>
                      </tr>
                      <tr style="border-bottom: solid 1px #e5e5e5">
                        <td height="15" style="line-height: 15px">&nbsp;</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
                <td width="15" style="display: block; width: 15px">&nbsp;&nbsp;&nbsp;</td>
              </tr>
              <tr>
                <td width="15" style="display: block; width: 15px">&nbsp;&nbsp;&nbsp;</td>
                <td>
                  <table border="0" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse">
                    <tbody>
                      <tr>
                        <td height="4" style="line-height: 4px">&nbsp;</td>
                      </tr>
                      <tr>
                        <td>
                          <span class="m_1933259993185685521mb_text" style="
                                      font-family: Helvetica Neue, Helvetica, Lucida Grande, tahoma, verdana, arial, sans-serif;
                                      font-size: 16px;
                                      line-height: 21px;
                                      color: #141823;
                                    "><span style="font-size: 15px">
                              <p></p>
                              <div style="margin-top: 16px; margin-bottom: 20px; font-weight: bold;">Hello
                                ${data.firstname + " " + data.lastname},</div>
                              <div>
                                If you've forgot your password or wish to reset it<br />
                                Please click the button below.<br />

                                <!-- <a style="font-weight: bold" href="https://schoolworkspro.com"
                                  target="_blank">schoolworkspro.com</a>
                                password. -->
                              </div>
                              <br />
                              <!-- Click on the following button to reset your password.
                              <p></p> -->
                              <table border="0" width="100%" cellspacing="0" cellpadding="0"
                                style="border-collapse: collapse">
                                <tbody>
                                  <tr>
                                    <td height="20" style="line-height: 20px">&nbsp;</td>
                                  </tr>
                                  <tr>
                                    <td align="middle">
                                      <a href="${data.link}" style="color: #3b5998; text-decoration: none"
                                        target="_blank" data-saferedirecturl="${data.link}">
                                        <table border="0" width="100%" cellspacing="0" cellpadding="0"
                                          style="border-collapse: collapse">
                                          <tbody>
                                            <tr>
                                              <td style="
                                                          border-collapse: collapse;
                                                          border-radius: 6px;
                                                          text-align: center;
                                                          display: block;
                                                          border: none;
                                                          background: #1877f2;
                                                          padding: 6px 20px 10px 20px;
                                                        ">
                                                <a href="${data.link}"
                                                  style="color: #3b5998; text-decoration: none; display: block"
                                                  target="_blank" data-saferedirecturl="${data.link}">
                                                  <center>
                                                    <font size="3">
                                                      <span style="
                                                                  font-weight: bold;
                                                                  font-family: Helvetica Neue, Helvetica, Lucida Grande, tahoma, verdana, arial,
                                                                    sans-serif;
                                                                  white-space: nowrap;
                                                                  font-weight: bold;
                                                                  vertical-align: middle;
                                                                  color: #ffffff;
                                                                  font-family: Roboto-Medium, Roboto, -apple-system, BlinkMacSystemFont,
                                                                    Helvetica Neue, Helvetica, Lucida Grande, tahoma, verdana, arial, sans-serif;
                                                                  font-size: 17px;
                                                                ">Reset&nbsp;Password <i class="fas fa-band-aid"></i>
                                                      </span>
                                                    </font>
                                                  </center>
                                                </a>
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </a>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td height="8" style="line-height: 8px">&nbsp;</td>
                                  </tr>
                                  <tr>
                                    <td height="20" style="line-height: 20px">&nbsp;</td>
                                  </tr>
                                </tbody>
                              </table>
                              <br />
                              <div><span style="color: #333333; font-weight: bold">If you weren't expecting this email,
                                  You can ignore this message. </span>
                              </div>
                              <!-- If you didn't request a new password, -->
                            </span></span>
                        </td>
                      </tr>
                      <tr>
                        <td height="50" style="line-height: 50px">&nbsp;</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
                <td width="15" style="display: block; width: 15px">&nbsp;&nbsp;&nbsp;</td>
              </tr>
              <tr>
                <td width="15" style="display: block; width: 15px">&nbsp;&nbsp;&nbsp;</td>
                <td>
                  <table border="0" width="100%" cellspacing="0" cellpadding="0" align="left"
                    style="border-collapse: collapse">
                    <tbody>
                      <tr style="border-top: solid 1px #e5e5e5">
                        <td height="19" style="line-height: 19px">&nbsp;</td>
                      </tr>
                      <tr>
                        <td style="
                                    font-family: Roboto-Regular, Roboto, -apple-system, BlinkMacSystemFont, Helvetica Neue, Helvetica,
                                      Lucida Grande, tahoma, verdana, arial, sans-serif;
                                    font-size: 12px;
                                    color: #8a8d91;
                                    line-height: 16px;
                                    font-weight: 400;
                                  ">
                          This message was issued by Digi Technology, Kathmandu, Nepal<br />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
                <td width="15" style="display: block; width: 15px">&nbsp;&nbsp;&nbsp;</td>
              </tr>
              <tr>
                <td height="20" style="line-height: 20px" colspan="3">&nbsp;</td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>

</html>`
  };

  const result = await smtpTransport.sendMail(message);
  return result;
};

// module.exports = sendMail
