// backend/controllers/emailController.js
const { sendEmail } = require('../utils/emailService');
const {
  welcomeEmail,
  bookingConfirmationEmail,
  paymentReceiptEmail,
  supportReceiptEmail,
  bookingStatusEmail,
  passwordResetEmail
} = require('../utils/emailTemplates');

// Send welcome email
const sendWelcomeEmail = async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required'
      });
    }
    
    const html = welcomeEmail(name);
    const result = await sendEmail(email, 'Welcome to NY Entertainment Rwanda! 🎉', html);
    
    if (result.success) {
      res.json({ success: true, message: 'Welcome email sent', result });
    } else {
      res.status(500).json({ success: false, message: result.error });
    }
  } catch (error) {
    console.error('Send welcome email error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send booking confirmation
const sendBookingConfirmation = async (req, res) => {
  try {
    const { email, booking } = req.body;
    
    if (!email || !booking) {
      return res.status(400).json({
        success: false,
        message: 'Email and booking are required'
      });
    }
    
    const html = bookingConfirmationEmail(booking);
    const result = await sendEmail(email, 'Booking Confirmation - NY Entertainment 📅', html);
    
    if (result.success) {
      res.json({ success: true, message: 'Booking confirmation sent', result });
    } else {
      res.status(500).json({ success: false, message: result.error });
    }
  } catch (error) {
    console.error('Send booking confirmation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send payment receipt
const sendPaymentReceipt = async (req, res) => {
  try {
    const { email, payment } = req.body;
    
    if (!email || !payment) {
      return res.status(400).json({
        success: false,
        message: 'Email and payment are required'
      });
    }
    
    const html = paymentReceiptEmail(payment);
    const result = await sendEmail(email, 'Payment Receipt - NY Entertainment 💳', html);
    
    if (result.success) {
      res.json({ success: true, message: 'Payment receipt sent', result });
    } else {
      res.status(500).json({ success: false, message: result.error });
    }
  } catch (error) {
    console.error('Send payment receipt error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send support receipt
const sendSupportReceipt = async (req, res) => {
  try {
    const { email, support } = req.body;
    
    if (!email || !support) {
      return res.status(400).json({
        success: false,
        message: 'Email and support are required'
      });
    }
    
    const html = supportReceiptEmail(support);
    const result = await sendEmail(email, 'Support Receipt - NY Entertainment ❤️', html);
    
    if (result.success) {
      res.json({ success: true, message: 'Support receipt sent', result });
    } else {
      res.status(500).json({ success: false, message: result.error });
    }
  } catch (error) {
    console.error('Send support receipt error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send booking status update
const sendBookingStatusUpdate = async (req, res) => {
  try {
    const { email, booking, oldStatus, newStatus } = req.body;
    
    if (!email || !booking) {
      return res.status(400).json({
        success: false,
        message: 'Email and booking are required'
      });
    }
    
    const html = bookingStatusEmail(booking, oldStatus, newStatus);
    const result = await sendEmail(email, `Booking ${newStatus} - NY Entertainment 📊`, html);
    
    if (result.success) {
      res.json({ success: true, message: 'Status update email sent', result });
    } else {
      res.status(500).json({ success: false, message: result.error });
    }
  } catch (error) {
    console.error('Send status update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send password reset email
const sendPasswordReset = async (req, res) => {
  try {
    const { email, name, resetToken } = req.body;
    
    if (!email || !name || !resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Email, name and reset token are required'
      });
    }
    
    const html = passwordResetEmail(name, resetToken);
    const result = await sendEmail(email, 'Password Reset Request - NY Entertainment 🔐', html);
    
    if (result.success) {
      res.json({ success: true, message: 'Password reset email sent', result });
    } else {
      res.status(500).json({ success: false, message: result.error });
    }
  } catch (error) {
    console.error('Send password reset error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  sendWelcomeEmail,
  sendBookingConfirmation,
  sendPaymentReceipt,
  sendSupportReceipt,
  sendBookingStatusUpdate,
  sendPasswordReset
};