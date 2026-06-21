// backend/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config();

const app = express();

// ─── SECURITY MIDDLEWARE ──────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// ─── BODY PARSER ──────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ─── CORS ──────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5000',
    'https://ny-lovat.vercel.app',
    'https://ny-53uarsic5-abel-uwimana.vercel.app',
    'https://*.vercel.app',
    'https://ny-entertainment-backend.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ─── STATIC FILES ──────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── PRISMA CLIENT ─────────────────────────────────────────────
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

// ─── REQUEST LOGGING ──────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.url}`);
  next();
});

// ─── TEST ROUTES ──────────────────────────────────────────────
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API is running!',
    status: 'ok',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      bookings: '/api/bookings',
      videos: '/api/videos',
      purchases: '/api/purchases',
      posts: '/api/posts',
      support: '/api/support',
      payments: '/api/payments',
      notifications: '/api/notifications',
      analytics: '/api/analytics',
      admin: '/api/admin',
      email: '/api/email',
      couples: '/api/couples',
      users: '/api/users'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    prisma: prisma ? 'loaded' : 'not loaded',
    uptime: process.uptime()
  });
});

app.post('/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'Test POST works!',
    data: req.body 
  });
});

// ─── ROUTES ──────────────────────────────────────────────────────

// Auth routes
try {
  const authRoutes = require('./routes/authRoutes');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.error('❌ Error loading auth routes:', error.message);
}

// User routes
try {
  const userRoutes = require('./routes/userRoutes');
  app.use('/api/users', userRoutes);
  console.log('✅ User routes loaded');
} catch (error) {
  console.error('❌ Error loading user routes:', error.message);
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

// Purchase routes
try {
  const purchaseRoutes = require('./routes/purchaseRoutes');
  app.use('/api/purchases', purchaseRoutes);
  console.log('🛒 Purchase routes loaded');
} catch (error) {
  console.error('❌ Error loading purchase routes:', error.message);
}

// Post routes
try {
  const postRoutes = require('./routes/postRoutes');
  app.use('/api/posts', postRoutes);
  console.log('📝 Post routes loaded');
} catch (error) {
  console.error('❌ Error loading post routes:', error.message);
}

// Support routes
try {
  const supportRoutes = require('./routes/supportRoutes');
  app.use('/api/support', supportRoutes);
  console.log('❤️ Support routes loaded');
} catch (error) {
  console.error('❌ Error loading support routes:', error.message);
}

// Payment routes
try {
  const paymentRoutes = require('./routes/paymentRoutes');
  app.use('/api/payments', paymentRoutes);
  console.log('💰 Payment routes loaded');
} catch (error) {
  console.error('❌ Error loading payment routes:', error.message);
}

// Couple routes
try {
  const coupleRoutes = require('./routes/coupleRoutes');
  app.use('/api/couples', coupleRoutes);
  console.log('💑 Couple routes loaded');
} catch (error) {
  console.error('❌ Error loading couple routes:', error.message);
}

// Notification routes
try {
  const notificationRoutes = require('./routes/notificationRoutes');
  app.use('/api/notifications', notificationRoutes);
  console.log('🔔 Notification routes loaded');
} catch (error) {
  console.error('❌ Error loading notification routes:', error.message);
}

// Analytics routes
try {
  const analyticsRoutes = require('./routes/analyticsRoutes');
  app.use('/api/analytics', analyticsRoutes);
  console.log('📊 Analytics routes loaded');
} catch (error) {
  console.error('❌ Error loading analytics routes:', error.message);
}

// Admin routes
try {
  const adminRoutes = require('./routes/adminRoutes');
  app.use('/api/admin', adminRoutes);
  console.log('👑 Admin routes loaded');
} catch (error) {
  console.error('❌ Error loading admin routes:', error.message);
}

// Email routes
try {
  const emailRoutes = require('./routes/emailRoutes');
  app.use('/api/email', emailRoutes);
  console.log('📧 Email routes loaded');
} catch (error) {
  console.error('❌ Error loading email routes:', error.message);
}

// ─── 404 HANDLER ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
});

// ─── ERROR HANDLER ──────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error('Stack:', err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ─── START SERVER ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📝 Test API: http://localhost:${PORT}/api`);
  console.log(`🔍 Health: http://localhost:${PORT}/health`);
  console.log(`\n📋 Endpoints:`);
  console.log(`   🔐 Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   👤 Users: http://localhost:${PORT}/api/users`);
  console.log(`   📅 Bookings: http://localhost:${PORT}/api/bookings`);
  console.log(`   🎬 Videos: http://localhost:${PORT}/api/videos`);
  console.log(`   🛒 Purchases: http://localhost:${PORT}/api/purchases`);
  console.log(`   📝 Posts: http://localhost:${PORT}/api/posts`);
  console.log(`   ❤️ Support: http://localhost:${PORT}/api/support`);
  console.log(`   💳 Payments: http://localhost:${PORT}/api/payments`);
  console.log(`   💑 Couples: http://localhost:${PORT}/api/couples`);
  console.log(`   🔔 Notifications: http://localhost:${PORT}/api/notifications`);
  console.log(`   📊 Analytics: http://localhost:${PORT}/api/analytics`);
  console.log(`   👑 Admin: http://localhost:${PORT}/api/admin`);
  console.log(`   📧 Email: http://localhost:${PORT}/api/email`);
  console.log(`\n✨ Server is ready!`);
});

// ─── GRACEFUL SHUTDOWN ──────────────────────────────────────────
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, closing server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = app;