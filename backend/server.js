const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5000'],
  credentials: true
}));

// Import prisma (lazy load to avoid initialization issues)
let prisma;
try {
  prisma = require('./prismaClient');
  console.log('✅ Prisma client loaded successfully');
} catch (error) {
  console.error('❌ Failed to load Prisma client:', error.message);
}

// Make prisma available in routes
app.use((req, res, next) => {
  if (prisma) {
    req.prisma = prisma;
  }
  next();
});

// Simple test route first (doesn't need prisma)
app.get('/api', (req, res) => {
  res.json({ 
    message: 'API is running!',
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    prisma: prisma ? 'loaded' : 'not loaded'
  });
});

// Test route to verify POST works
app.post('/test', (req, res) => {
  res.json({ message: 'Test POST works!' });
});

// ============ ROUTES ============

// Auth routes
try {
  const authRoutes = require('./routes/authRoutes');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.error('❌ Error loading auth routes:', error.message);
}

// Booking routes
try {
  const bookingRoutes = require('./routes/bookingRoutes');
  app.use('/api/bookings', bookingRoutes);
  console.log('✅ Booking routes loaded');
} catch (error) {
  console.error('❌ Error loading booking routes:', error.message);
}

// Video routes
try {
  const videoRoutes = require('./routes/videoRoutes');
  app.use('/api/videos', videoRoutes);
  console.log('🎬 Video routes loaded');
} catch (error) {
  console.error('❌ Error loading video routes:', error.message);
}

// Post routes
try {
  const postRoutes = require('./routes/postRoutes');
  app.use('/api/posts', postRoutes);
  console.log('📝 Post routes loaded');
} catch (error) {
  console.error('❌ Error loading post routes:', error.message);
}

// Support routes (Phase 5)
try {
  const supportRoutes = require('./routes/supportRoutes');
  app.use('/api/support', supportRoutes);
  console.log('❤️ Support routes loaded');
} catch (error) {
  console.error('❌ Error loading support routes:', error.message);
}

// Payment routes (Phase 6)
try {
  const paymentRoutes = require('./routes/paymentRoutes');
  app.use('/api/payments', paymentRoutes);
  console.log('💰 Payment routes loaded');
} catch (error) {
  console.error('❌ Error loading payment routes:', error.message);
}

// Notification routes (Phase 7)
try {
  const notificationRoutes = require('./routes/notificationRoutes');
  app.use('/api/notifications', notificationRoutes);
  console.log('🔔 Notification routes loaded');
} catch (error) {
  console.error('❌ Error loading notification routes:', error.message);
}

// Analytics routes (Phase 8)
try {
  const analyticsRoutes = require('./routes/analyticsRoutes');
  app.use('/api/analytics', analyticsRoutes);
  console.log('📊 Analytics routes loaded');
} catch (error) {
  console.error('❌ Error loading analytics routes:', error.message);
}

// Admin routes (Phase 9)
try {
  const adminRoutes = require('./routes/adminRoutes');
  app.use('/api/admin', adminRoutes);
  console.log('👑 Admin routes loaded');
} catch (error) {
  console.error('❌ Error loading admin routes:', error.message);
}

// Email routes (Phase 10 - NEW)
try {
  const emailRoutes = require('./routes/emailRoutes');
  app.use('/api/email', emailRoutes);
  console.log('📧 Email routes loaded');
} catch (error) {
  console.error('❌ Error loading email routes:', error.message);
}

// ============ ERROR HANDLER ============
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    success: false, 
    message: err.message || 'Something went wrong!'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📝 Test API: http://localhost:${PORT}/api`);
  console.log(`🔍 Health: http://localhost:${PORT}/health`);
  console.log(`\n📋 Endpoints:`);
  console.log(`   🔐 Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   📅 Bookings: http://localhost:${PORT}/api/bookings`);
  console.log(`   🎬 Videos: http://localhost:${PORT}/api/videos`);
  console.log(`   📝 Posts: http://localhost:${PORT}/api/posts`);
  console.log(`   ❤️ Support: http://localhost:${PORT}/api/support`);
  console.log(`   💳 Payments: http://localhost:${PORT}/api/payments`);
  console.log(`   🔔 Notifications: http://localhost:${PORT}/api/notifications`);
  console.log(`   📊 Analytics: http://localhost:${PORT}/api/analytics`);
  console.log(`   👑 Admin: http://localhost:${PORT}/api/admin`);
  console.log(`   📧 Email: http://localhost:${PORT}/api/email`);
});

module.exports = app;