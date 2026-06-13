// backend/utils/emailService.js
const nodemailer = require('nodemailer');

// REAL Gmail configuration with better timeout settings
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,  // Changed from 587 to 465 (SSL)
  secure: true,  // SSL (true for port 465)
  auth: {
    user: 'nyentertainmentrwanda@gmail.com',
    pass: process.env.EMAIL_PASS
  },
  timeout: 30000,  // 30 seconds timeout
  connectionTimeout: 30000
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