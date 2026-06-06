const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = express();

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

// Import and use auth routes (only if prisma is available)
try {
  const authRoutes = require('./routes/authRoutes');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.error('❌ Error loading auth routes:', error.message);
}

// ✅ ADD BOOKING ROUTES
try {
  const bookingRoutes = require('./routes/bookingRoutes');
  app.use('/api/bookings', bookingRoutes);
  console.log('✅ Booking routes loaded');
} catch (error) {
  console.error('❌ Error loading booking routes:', error.message);
}

// ✅ ADD VIDEO ROUTES
try {
  const videoRoutes = require('./routes/videoRoutes');
  app.use('/api/videos', videoRoutes);
  console.log('🎬 Video routes loaded');
} catch (error) {
  console.error('❌ Error loading video routes:', error.message);
}

// ✅ ADD POST ROUTES
try {
  const postRoutes = require('./routes/postRoutes');
  app.use('/api/posts', postRoutes);
  console.log('📝 Post routes loaded');
} catch (error) {
  console.error('❌ Error loading post routes:', error.message);
}

// Error handler
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
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Test API: http://localhost:${PORT}/api`);
  console.log(`🔍 Health: http://localhost:${PORT}/health`);
  console.log(`📋 Bookings API: http://localhost:${PORT}/api/bookings`);
  console.log(`🎬 Videos API: http://localhost:${PORT}/api/videos`);
  console.log(`📝 Posts API: http://localhost:${PORT}/api/posts`);
});

module.exports = app;