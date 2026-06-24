// backend/utils/emailService.js
const nodemailer = require('nodemailer');

// Gmail configuration with better timeout settings
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,  // SSL port
  secure: true,  // SSL
  auth: {
    user: process.env.EMAIL_USER || 'nyentertainmentrwanda@gmail.com',
    pass: process.env.EMAIL_PASS
  },
  timeout: 30000,  // 30 seconds timeout
  connectionTimeout: 30000,
  socketTimeout: 30000
});

// Verify transporter connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter error:', error);
    console.error('⚠️ Please check EMAIL_PASS in .env file');
    console.error('💡 If using Gmail, you need an App Password:');
    console.error('  1. Go to Google Account → Security → 2FA');
    console.error('  2. Generate App Password');
    console.error('  3. Use that password in EMAIL_PASS');
  } else {
    console.log('✅ Email transporter ready!');
  }
});

// Send email function
const sendEmail = async (to, subject, html, text = '') => {
  try {
    // Validate email
    if (!to || !to.includes('@')) {
      console.error('❌ Invalid email address:', to);
      return { success: false, error: 'Invalid email address' };
    }

    // Generate plain text from HTML if not provided
    if (!text && html) {
      text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }

    const mailOptions = {
      from: `"NY Entertainment Rwanda" <${process.env.EMAIL_USER || 'nyentertainmentrwanda@gmail.com'}>`,
      to: to,
      subject: subject,
      text: text || 'Please view this email in HTML format',
      html: html
    };

    console.log(`📧 Sending email to: ${to}`);
    console.log(`📝 Subject: ${subject}`);

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to: ${to}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    
    return { 
      success: true, 
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected
    };
    
  } catch (error) {
    console.error('❌ Email error:', error.message);
    
    // Provide helpful error messages
    if (error.code === 'EAUTH') {
      console.error('⚠️ Authentication failed! Check EMAIL_PASS in .env');
      console.error('💡 Gmail requires an App Password (not your regular password)');
      console.error('🔑 Generate one at: https://myaccount.google.com/apppasswords');
    } else if (error.code === 'ESOCKET') {
      console.error('⚠️ Connection timeout. Check your internet connection.');
    }
    
    return { 
      success: false, 
      error: error.message,
      code: error.code
    };
  }
};

module.exports = { sendEmail };