// backend/utils/emailService.js
const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const brevo = require('@getbrevo/brevo');

// ─── CHOOSE EMAIL PROVIDER ──────────────────────────────────────
// Set EMAIL_PROVIDER in .env: 'brevo', 'resend', or 'gmail'
// Default: 'brevo'
const EMAIL_PROVIDER = (process.env.EMAIL_PROVIDER || 'brevo').toLowerCase();

console.log(`📧 Email provider: ${EMAIL_PROVIDER}`);

// ─── BREVO PROVIDER ─────────────────────────────────────────────
let brevoApiInstance = null;
let brevoReady = false;

if (process.env.BREVO_API_KEY) {
  try {
    brevoApiInstance = new brevo.TransactionalEmailsApi();
    brevoApiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );
    brevoReady = true;
    console.log('✅ Brevo client initialized');
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
  resend = new Resend(process.env.RESEND_API_KEY);
  console.log('✅ Resend client initialized');
}

// ─── GMAIL PROVIDER (fallback) ──────────────────────────────────
let transporter = null;
let gmailReady = false;

if (EMAIL_PROVIDER === 'gmail' || !brevoReady) {
  const emailUser = process.env.EMAIL_USER || 'nyentertainmentrwanda@gmail.com';
  const emailPass = (process.env.EMAIL_PASS || '').replace(/\s/g, '');

  if (emailPass) {
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
}

// ─── BREVO SEND FUNCTION ────────────────────────────────────────
const sendBrevo = async (to, subject, html) => {
  try {
    if (!brevoReady || !brevoApiInstance) {
      throw new Error('Brevo not configured');
    }

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;
    sendSmtpEmail.sender = {
      name: 'NY Entertainment',
      email: 'nyentertainmentrwanda@gmail.com'
    };
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.replyTo = {
      email: 'nyentertainmentrwanda@gmail.com',
      name: 'NY Entertainment'
    };

    const data = await brevoApiInstance.sendTransacEmail(sendSmtpEmail);

    console.log(`✅ Email sent via Brevo to: ${to}`);
    console.log(`📧 Message ID: ${data.messageId || data.messageIds}`);

    return {
      success: true,
      messageId: data.messageId || JSON.stringify(data.messageIds),
      provider: 'brevo'
    };
  } catch (error) {
    console.error('❌ Brevo error:', error.message);
    console.error('❌ Full Brevo error:', error);

    const response = error.response;
    if (response) {
      const status = response.statusCode || response.status;
      if (status) console.error('❌ Brevo response status:', status);

      const body = response.body || error.body;
      if (body) console.error('❌ Brevo response body:', body);
    }

    return { success: false, error: error.message };
  }
};

// ─── RESEND SEND FUNCTION ───────────────────────────────────────
const sendResend = async (to, subject, html) => {
  try {
    if (!resend) throw new Error('Resend not configured');

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'NY Entertainment <onboarding@resend.dev>',
      to: [to],
      subject,
      html
    });

    if (error) {
      console.error('❌ Resend error:', error.message);
      return { success: false, error: error.message };
    }

    console.log(`✅ Email sent via Resend to: ${to}`);
    console.log(`📧 Message ID: ${data?.id}`);
    return { success: true, messageId: data?.id, provider: 'resend' };
  } catch (error) {
    console.error('❌ Resend error:', error.message);
    return { success: false, error: error.message };
  }
};

// ─── GMAIL SEND FUNCTION ────────────────────────────────────────
const sendGmail = async (to, subject, html, text = '') => {
  try {
    if (!gmailReady || !transporter) {
      return { success: false, error: 'Gmail not configured' };
    }

    if (!text && html) {
      text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }

    const info = await transporter.sendMail({
      from: `"NY Entertainment Rwanda" <${process.env.EMAIL_USER || 'nyentertainmentrwanda@gmail.com'}>`,
      to,
      subject,
      text: text || 'Please view this email in HTML format',
      html
    });

    console.log(`✅ Email sent via Gmail to: ${to}`);
    console.log(`📧 Message ID: ${info.messageId}`);
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

  // Try primary provider based on EMAIL_PROVIDER
  if (EMAIL_PROVIDER === 'brevo') {
    const result = await sendBrevo(to, subject, html);
    if (result.success) return result;

    console.error('❌ Brevo failed, not falling back:', result.error);
    return result;
  }

  if (EMAIL_PROVIDER === 'resend' && resend) {
    const result = await sendResend(to, subject, html);
    if (result.success) return result;

    if (gmailReady) {
      console.log('🔄 Resend failed, trying Gmail...');
      return await sendGmail(to, subject, html, text);
    }
    return result;
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