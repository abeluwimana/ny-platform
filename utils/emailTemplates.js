// backend/utils/emailTemplates.js

// Welcome Email Template
const welcomeEmail = (name) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #ffc107; padding: 20px; text-align: center; }
    .header h1 { margin: 0; color: #111; }
    .content { padding: 20px; background: #f5f5f5; }
    .footer { text-align: center; padding: 10px; font-size: 12px; color: #888; }
    .button { background: #ffc107; color: #111; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎬 NY Entertainment Rwanda</h1>
    </div>
    <div class="content">
      <h2>Welcome ${name}! 🎉</h2>
      <p>Thank you for joining NY Entertainment Rwanda! We're excited to have you on board.</p>
      <p>You can now:</p>
      <ul>
        <li>📅 Book events for your special moments</li>
        <li>🎥 Watch beautiful wedding videos</li>
        <li>❤️ Support couples and their love stories</li>
        <li>📝 Share your own stories</li>
      </ul>
      <p>Start exploring today!</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button">Explore Platform →</a>
    </div>
    <div class="footer">
      <p>© 2026 NY Entertainment Rwanda. All rights reserved.</p>
      <p>Kamonyi, Rwanda | +250 780 145 562</p>
    </div>
  </div>
</body>
</html>
`;

// Booking Confirmation Email
const bookingConfirmationEmail = (booking) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #ffc107; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f5f5f5; }
    .details { background: white; padding: 15px; border-radius: 10px; margin: 10px 0; }
    .status { background: #fff3cd; padding: 10px; border-radius: 5px; text-align: center; }
    .footer { text-align: center; padding: 10px; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 Booking Confirmation</h1>
    </div>
    <div class="content">
      <h2>Hello ${booking.userName}!</h2>
      <p>Your booking has been submitted successfully! 🎉</p>
      
      <div class="details">
        <h3>Booking Details:</h3>
        <p><strong>Booking ID:</strong> #${booking.id}</p>
        <p><strong>Event Type:</strong> ${booking.eventType}</p>
        <p><strong>Date:</strong> ${new Date(booking.eventDate).toLocaleDateString()}</p>
        <p><strong>Location:</strong> ${booking.eventLocation}</p>
        <p><strong>Package:</strong> ${booking.package || 'Standard'}</p>
      </div>
      
      <div class="status">
        <p>📌 Status: <strong>Pending Admin Review</strong></p>
        <p>Our team will review your booking within 24 hours and contact you with pricing.</p>
      </div>
      
      <p>Questions? Contact us anytime!</p>
      <a href="https://wa.me/250780145562" class="button">💬 WhatsApp Us</a>
    </div>
    <div class="footer">
      <p>© 2026 NY Entertainment Rwanda</p>
    </div>
  </div>
</body>
</html>
`;

// Payment Receipt Email
const paymentReceiptEmail = (payment) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #ffc107; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f5f5f5; }
    .receipt { background: white; padding: 20px; border-radius: 10px; }
    .amount { font-size: 24px; font-weight: bold; color: #ffc107; }
    .footer { text-align: center; padding: 10px; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 Payment Receipt</h1>
    </div>
    <div class="content">
      <h2>Thank you for your payment! ✅</h2>
      
      <div class="receipt">
        <h3>Payment Details:</h3>
        <p><strong>Transaction ID:</strong> ${payment.transactionId}</p>
        <p><strong>Amount:</strong> <span class="amount">${payment.amount.toLocaleString()} RWF</span></p>
        <p><strong>Date:</strong> ${new Date(payment.date).toLocaleString()}</p>
        <p><strong>Method:</strong> ${payment.method}</p>
        <p><strong>Status:</strong> ✅ Completed</p>
      </div>
      
      <p>Keep this receipt for your records.</p>
    </div>
    <div class="footer">
      <p>© 2026 NY Entertainment Rwanda</p>
    </div>
  </div>
</body>
</html>
`;

// Support Receipt Email
const supportReceiptEmail = (support) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #ffc107; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f5f5f5; }
    .receipt { background: white; padding: 20px; border-radius: 10px; }
    .breakdown { background: #f0f0f0; padding: 10px; border-radius: 5px; margin: 10px 0; }
    .footer { text-align: center; padding: 10px; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>❤️ Support Receipt</h1>
    </div>
    <div class="content">
      <h2>Thank you for your support! 🎉</h2>
      
      <div class="receipt">
        <h3>Support Details:</h3>
        <p><strong>Transaction ID:</strong> ${support.transactionId}</p>
        <p><strong>Couple:</strong> ${support.coupleName}</p>
        <p><strong>Amount:</strong> <span class="amount">${support.amount.toLocaleString()} RWF</span></p>
        <p><strong>Date:</strong> ${new Date(support.date).toLocaleString()}</p>
        
        <div class="breakdown">
          <p><strong>💑 Couple receives:</strong> ${support.coupleAmount.toLocaleString()} RWF (60%)</p>
          <p><strong>🏢 Platform fee:</strong> ${support.platformAmount.toLocaleString()} RWF (40%)</p>
        </div>
      </div>
      
      <p>Your support helps couples share their beautiful moments! ❤️</p>
    </div>
    <div class="footer">
      <p>© 2026 NY Entertainment Rwanda</p>
    </div>
  </div>
</body>
</html>
`;

// Booking Status Update Email
const bookingStatusEmail = (booking, oldStatus, newStatus) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #ffc107; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f5f5f5; }
    .status-update { background: white; padding: 15px; border-radius: 10px; text-align: center; }
    .status-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
    .pending { background: #fff3cd; color: #856404; }
    .confirmed { background: #d4edda; color: #155724; }
    .completed { background: #cce5ff; color: #004085; }
    .cancelled { background: #f8d7da; color: #721c24; }
    .footer { text-align: center; padding: 10px; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 Booking Status Update</h1>
    </div>
    <div class="content">
      <h2>Hello ${booking.userName}!</h2>
      <p>Your booking status has been updated:</p>
      
      <div class="status-update">
        <p><strong>Booking ID:</strong> #${booking.id}</p>
        <p><strong>Old Status:</strong> ${oldStatus}</p>
        <p><strong>New Status:</strong> 
          <span class="status-badge ${newStatus.toLowerCase()}">${newStatus}</span>
        </p>
      </div>
      
      ${newStatus === 'CONFIRMED' ? '<p>🎉 Your booking is confirmed! We will contact you with payment details.</p>' : ''}
      ${newStatus === 'COMPLETED' ? '<p>✅ Your event has been completed! Thank you for choosing NY Entertainment.</p>' : ''}
      ${newStatus === 'CANCELLED' ? '<p>❌ Your booking has been cancelled. Please contact us for more information.</p>' : ''}
      
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/my-bookings" class="button">View My Bookings →</a>
    </div>
    <div class="footer">
      <p>© 2026 NY Entertainment Rwanda</p>
    </div>
  </div>
</body>
</html>
`;

// Password Reset Email
const passwordResetEmail = (name, resetToken) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #ffc107; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f5f5f5; }
    .reset-box { background: white; padding: 20px; border-radius: 10px; text-align: center; }
    .footer { text-align: center; padding: 10px; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Password Reset</h1>
    </div>
    <div class="content">
      <h2>Hello ${name}!</h2>
      <p>We received a request to reset your password.</p>
      
      <div class="reset-box">
        <p>Click the button below to reset your password:</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}" class="button">Reset Password →</a>
        <p style="margin-top: 15px; font-size: 12px;">This link expires in 1 hour.</p>
      </div>
      
      <p>If you didn't request this, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>© 2026 NY Entertainment Rwanda</p>
    </div>
  </div>
</body>
</html>
`;

module.exports = {
  welcomeEmail,
  bookingConfirmationEmail,
  paymentReceiptEmail,
  supportReceiptEmail,
  bookingStatusEmail,
  passwordResetEmail
};