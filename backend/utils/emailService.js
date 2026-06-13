// backend/utils/emailService.js
const nodemailer = require('nodemailer');

// REAL Gmail configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'nyentertainmentrwanda@gmail.com',
    pass: process.env.EMAIL_PASS
  }
});

// Send email function
const sendEmail = async (to, subject, html, text = '') => {
  try {
    const mailOptions = {
      from: '"NY Entertainment Rwanda" <nyentertainmentrwanda@gmail.com>',
      to: to,
      subject: subject,
      text: text || html.replace(/<[^>]*>/g, ''),
      html: html
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to: ${to}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };