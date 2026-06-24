// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {
  register,
  login,
  googleSignIn,
  getMe,
  logout,
  getAllUsers,
  registerCouple,
  registerCreator
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/register/couple', registerCouple);
router.post('/register/creator', registerCreator);
router.post('/login', login);
router.post('/google', googleSignIn);

// Private routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

// Admin only routes
router.get('/users', protect, authorize('ADMIN'), getAllUsers);

module.exports = router;