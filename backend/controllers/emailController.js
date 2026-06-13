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
    const html = welcomeEmail(name);
    const result = await sendEmail(email, 'Welcome to NY Entertainment Rwanda!', html);
    
    res.json({ success: true, message: 'Welcome email sent', result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send booking confirmation
const sendBookingConfirmation = async (req, res) => {
  try {
    const { email, booking } = req.body;
    const html = bookingConfirmationEmail(booking);
    const result = await sendEmail(email, 'Booking Confirmation - NY Entertainment', html);
    
    res.json({ success: true, message: 'Booking confirmation sent', result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send payment receipt
const sendPaymentReceipt = async (req, res) => {
  try {
    const { email, payment } = req.body;
    const html = paymentReceiptEmail(payment);
    const result = await sendEmail(email, 'Payment Receipt - NY Entertainment', html);
    
    res.json({ success: true, message: 'Payment receipt sent', result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send support receipt
const sendSupportReceipt = async (req, res) => {
  try {
    const { email, support } = req.body;
    const html = supportReceiptEmail(support);
    const result = await sendEmail(email, 'Support Receipt - NY Entertainment', html);
    
    res.json({ success: true, message: 'Support receipt sent', result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send booking status update
const sendBookingStatusUpdate = async (req, res) => {
  try {
    const { email, booking, oldStatus, newStatus } = req.body;
    const html = bookingStatusEmail(booking, oldStatus, newStatus);
    const result = await sendEmail(email, `Booking ${newStatus} - NY Entertainment`, html);
    
    res.json({ success: true, message: 'Status update email sent', result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send password reset email
const sendPasswordReset = async (req, res) => {
  try {
    const { email, name, resetToken } = req.body;
    const html = passwordResetEmail(name, resetToken);
    const result = await sendEmail(email, 'Password Reset Request - NY Entertainment', html);
    
    res.json({ success: true, message: 'Password reset email sent', result });
  } catch (error) {
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