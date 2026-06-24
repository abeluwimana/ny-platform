// backend/utils/emailService.js
const nodemailer = require('nodemailer');
const { Resend } = require('resend');

// ─── CHOOSE EMAIL PROVIDER ──────────────────────────────────────
// Set EMAIL_PROVIDER in .env: 'gmail' or 'resend'
// Default: 'gmail'

const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'gmail';

// ─── RESEND PROVIDER ────────────────────────────────────────────
let resend;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
  console.log('✅ Resend client initialized');
}

// ─── GMAIL PROVIDER ─────────────────────────────────────────────
let transporter;
let gmailReady = false;

if (EMAIL_PROVIDER === 'gmail') {
  const emailUser = process.env.EMAIL_USER || 'nyentertainmentrwanda@gmail.com';
  const emailPass = process.env.EMAIL_PASS || '';
  
  // Remove spaces from password if present
  const cleanedPass = emailPass.replace(/\s/g, '');
  
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: emailUser,
      pass: cleanedPass
    },
    timeout: 30000,
    connectionTimeout: 30000,
    socketTimeout: 30000
  });

  // Verify Gmail connection
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Gmail transporter error:', error.message);
      console.error('💡 Generate App Password: https://myaccount.google.com/apppasswords');
      console.error('💡 Or switch to Resend: EMAIL_PROVIDER=resend');
      gmailReady = false;
    } else {
      console.log('✅ Gmail transporter ready!');
      gmailReady = true;
    }
  });
}

// ─── SEND EMAIL FUNCTION ────────────────────────────────────────
const sendEmail = async (to, subject, html, text = '') => {
  try {
    // Validate email
    if (!to || !to.includes('@')) {
      console.error('❌ Invalid email address:', to);
      return { success: false, error: 'Invalid email address' };
    }

    console.log(`📧 Sending email to: ${to}`);
    console.log(`📝 Subject: ${subject}`);
    console.log(`📌 Provider: ${EMAIL_PROVIDER}`);

    // ─── TRY RESEND FIRST ──────────────────────────────────────
    if (EMAIL_PROVIDER === 'resend' && resend) {
      try {
        const { data, error } = await resend.emails.send({
          from: process.env.EMAIL_FROM || 'NY Entertainment Rwanda <onboarding@resend.dev>',
          to: [to],
          subject: subject,
          html: html
        });

        if (error) {
          console.error('❌ Resend error:', error.message);
          // Fallback to Gmail if Resend fails
          if (gmailReady) {
            console.log('🔄 Falling back to Gmail...');
            return await sendGmail(to, subject, html, text);
          }
          return { success: false, error: error.message };
        }

        console.log(`✅ Email sent via Resend to: ${to}`);
        console.log(`📧 Message ID: ${data?.id}`);
        return { success: true, messageId: data?.id, provider: 'resend' };
      } catch (resendError) {
        console.error('❌ Resend error:', resendError.message);
        if (gmailReady) {
          console.log('🔄 Falling back to Gmail...');
          return await sendGmail(to, subject, html, text);
        }
        return { success: false, error: resendError.message };
      }
    }

    // ─── USE GMAIL ──────────────────────────────────────────────
    return await sendGmail(to, subject, html, text);

  } catch (error) {
    console.error('❌ Email error:', error.message);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// ─── GMAIL SEND FUNCTION ────────────────────────────────────────
const sendGmail = async (to, subject, html, text = '') => {
  try {
    if (!gmailReady) {
      console.error('❌ Gmail not ready. Check EMAIL_PASS in .env');
      return { success: false, error: 'Gmail not configured' };
    }

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

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent via Gmail to: ${to}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    
    return { 
      success: true, 
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      provider: 'gmail'
    };
    
  } catch (error) {
    console.error('❌ Gmail error:', error.message);
    if (error.code === 'EAUTH') {
      console.error('⚠️ Authentication failed! Check EMAIL_PASS in .env');
      console.error('💡 Gmail requires an App Password (not your regular password)');
      console.error('🔑 Generate one at: https://myaccount.google.com/apppasswords');
      console.error('💡 Or switch to Resend: EMAIL_PROVIDER=resend');
    }
    return { 
      success: false, 
      error: error.message,
      code: error.code
    };
  }
};

module.exports = { sendEmail };