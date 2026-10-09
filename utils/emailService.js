// backend/utils/emailService.js
const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const brevo = require('@getbrevo/brevo');

// ─── PROVIDER SELECTION ─────────────────────────────────────────
const EMAIL_PROVIDER = (process.env.EMAIL_PROVIDER || 'brevo').toLowerCase();
console.log(`📧 Email provider: ${EMAIL_PROVIDER}`);

// ─── BREVO PROVIDER (Modern SDK v6+) ────────────────────────────
let brevoClient = null;
let brevoReady = false;

if (process.env.BREVO_API_KEY) {
  try {
    // Check if the modern SDK is available
    if (typeof brevo.BrevoClient === 'function') {
      brevoClient = new brevo.BrevoClient({
        apiKey: process.env.BREVO_API_KEY
      });
      brevoReady = true;
      console.log('✅ Brevo client initialized (modern SDK)');
    } else {
      console.error('❌ Brevo SDK: BrevoClient not found');
      console.error('   Installed version might be outdated');
    }
  } catch (err) {
    console.error('❌ Brevo init error:', err.message);
    brevoReady = false;
  }
} else {
  console.log('⚠️ BREVO_API_KEY not set — Brevo disabled');
}

// ─── RESEND PROVIDER (fallback) ─────────────────────────────────
let resend = null;
if (process.env.RESEND_API_KEY) {
  try {
    resend = new Resend(process.env.RESEND_API_KEY);
    console.log('✅ Resend client initialized');
  } catch (err) {
    console.error('❌ Resend init error:', err.message);
  }
}

// ─── GMAIL PROVIDER (fallback) ──────────────────────────────────
let transporter = null;
let gmailReady = false;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS.replace(/\s/g, '');

  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: emailUser, pass: emailPass },
    timeout: 30000,
    connectionTimeout: 30000,
    socketTimeout: 30000
  });

  transporter.verify((error) => {
    if (error) {
      console.error('❌ Gmail transporter error:', error.message);
      gmailReady = false;
    } else {
      console.log('✅ Gmail transporter ready!');
      gmailReady = true;
    }
  });
}

// ─── SEND VIA BREVO (Modern SDK) ────────────────────────────────
const sendBrevo = async (to, subject, html) => {
  try {
    if (!brevoReady || !brevoClient) {
      throw new Error('Brevo not configured');
    }

    const result = await brevoClient.transactionalEmails.sendTransacEmail({
      sender: {
        name: 'SHINECONNECT',
        email: 'nyentertainmentrwanda@gmail.com'
      },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html,
      replyTo: {
        email: 'nyentertainmentrwanda@gmail.com',
        name: 'SHINECONNECT'
      }
    });

    console.log(`✅ Email sent via Brevo to: ${to}`);
    console.log(`📧 Message ID: ${result.messageId || result.messageIds}`);

    return {
      success: true,
      messageId: result.messageId || JSON.stringify(result.messageIds),
      provider: 'brevo'
    };
  } catch (error) {
    console.error('❌ Brevo error:', error.message);
    if (error.response?.body) {
      console.error('   Details:', JSON.stringify(error.response.body));
    }
    return { success: false, error: error.message };
  }
};

// ─── SEND VIA RESEND (fallback) ─────────────────────────────────
const sendResend = async (to, subject, html) => {
  try {
    if (!resend) throw new Error('Resend not configured');

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'SHINECONNECT <onboarding@resend.dev>',
      to: [to],
      subject,
      html
    });

    if (error) {
      console.error('❌ Resend error:', error.message);
      return { success: false, error: error.message };
    }

    console.log(`✅ Email sent via Resend to: ${to}`);
    return { success: true, messageId: data?.id, provider: 'resend' };
  } catch (error) {
    console.error('❌ Resend error:', error.message);
    return { success: false, error: error.message };
  }
};

// ─── SEND VIA GMAIL (fallback) ──────────────────────────────────
const sendGmail = async (to, subject, html, text = '') => {
  try {
    if (!gmailReady || !transporter) {
      return { success: false, error: 'Gmail not configured' };
    }

    if (!text && html) {
      text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }

    const info = await transporter.sendMail({
      from: `"SHINECONNECT Rwanda" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: text || 'Please view this email in HTML format',
      html
    });

    console.log(`✅ Email sent via Gmail to: ${to}`);
    return { success: true, messageId: info.messageId, provider: 'gmail' };
  } catch (error) {
    console.error('❌ Gmail error:', error.message);
    return { success: false, error: error.message, code: error.code };
  }
};

// ─── MAIN SEND EMAIL FUNCTION ───────────────────────────────────
const sendEmail = async (to, subject, html, text = '') => {
  if (!to || !to.includes('@')) {
    console.error('❌ Invalid email address:', to);
    return { success: false, error: 'Invalid email address' };
  }

  console.log(`📧 Sending email to: ${to}`);
  console.log(`📝 Subject: ${subject}`);
  console.log(`📌 Provider: ${EMAIL_PROVIDER}`);

  // Primary provider
  if (EMAIL_PROVIDER === 'brevo') {
    if (!brevoReady) {
      console.error('❌ Brevo not ready');
      return { success: false, error: 'Brevo not configured' };
    }
    return await sendBrevo(to, subject, html);
  }

  if (EMAIL_PROVIDER === 'resend') {
    if (!resend) {
      console.error('❌ Resend not ready');
      return { success: false, error: 'Resend not configured' };
    }
    return await sendResend(to, subject, html);
  }

  if (EMAIL_PROVIDER === 'gmail') {
    return await sendGmail(to, subject, html, text);
  }

  // Fallback chain
  if (brevoReady) return await sendBrevo(to, subject, html);
  if (resend) return await sendResend(to, subject, html);
  if (gmailReady) return await sendGmail(to, subject, html, text);

  console.error('❌ No email provider configured!');
  return { success: false, error: 'No email provider configured' };
};

module.exports = { sendEmail };