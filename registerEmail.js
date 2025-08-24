const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();


// Reusable transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});



const qrcodeEmail = async (to,templateName,firstName) => {

  if (!to || typeof to !== 'string') {
  console.error('No valid recipient email address provided.');
  return;
};

  const templatePath = path.join(__dirname, 'templates', templateName);

  let content = fs.readFileSync(templatePath);

  const mailOptions = {
    from: `"Dakko Farms" <${process.env.GMAIL_USER}>`,
    to,
    subject:'Your 2FA QR Code',
      html: `
        <h1>Hi ${firstName},</h1>
        <p>Scan this QR code with your authenticator app to set up 2FA:</p>
        <img src="cid:qrcode" alt="QR Code" />
      `,
      attachments: [
        {
          filename: `${firstName}.png`,
          content: base64Image,
          encoding: 'base64',
          cid: 'qrcode'
        }
      ]
    };

  };

  // return transporter.sendMail(mailOptions, (error, info) => {
  //   if (error) {
  //     return console.error('Error while sending email:', error);
  //   }
  //   console.log('Email sent:', info.messageId);
  //   console.log('Email receiver:', mailOptions.to);
  // });


  try {
  const info = await transporter.sendMail(mailOptions);
  console.log('Email sent:', info.messageId);
} catch (error) {
  console.error('Error while sending email:', error.message);
}

  



module.exports =qrcodeEmail ;