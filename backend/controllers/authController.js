// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register user with role selection
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const prisma = req.prisma;
    
    console.log('📝 Registration attempt:', { email, role });
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }
    
    // Validate role
    const validRoles = ['CLIENT', 'COUPLE', 'CREATOR', 'ADMIN'];
    const upperRole = role ? role.toUpperCase() : 'CLIENT';
    if (!validRoles.includes(upperRole)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid account type'
      });
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Build user data with role-specific profile
    let userData = {
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || '',
      role: upperRole,
      isActive: true
    };
    
    // Add role-specific profile
    if (upperRole === 'CLIENT') {
      userData.clientProfile = { create: {} };
    } else if (upperRole === 'COUPLE') {
      userData.coupleProfile = { create: {} };
    } else if (upperRole === 'CREATOR') {
      userData.creatorProfile = { create: {} };
    } else if (upperRole === 'ADMIN') {
      userData.adminProfile = { create: { permissions: 'ALL' } };
    }
    
    // Create user
    const user = await prisma.user.create({
      data: userData,
      include: {
        clientProfile: true,
        coupleProfile: true,
        creatorProfile: true,
        adminProfile: true
      }
    });
    
    console.log('✅ User created:', user.email, 'Role:', user.role);
    
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json({
      success: true,
      user: userWithoutPassword,
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Register couple
// @route   POST /api/auth/register/couple
// @access  Public
const registerCouple = async (req, res) => {
  try {
    const { 
      groomName, brideName, email, password, phone, 
      weddingDate, location, story 
    } = req.body;
    const prisma = req.prisma;
    
    if (!groomName || !brideName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide couple names, email and password'
      });
    }
    
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = await prisma.user.create({
      data: {
        name: `${groomName} & ${brideName}`,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone: phone || '',
        role: 'COUPLE',
        coupleProfile: {
          create: {
            groomName,
            brideName,
            weddingDate: weddingDate ? new Date(weddingDate) : null,
            location: location || '',
            story: story || ''
          }
        }
      },
      include: {
        coupleProfile: true
      }
    });
    
    console.log('✅ Couple registered:', user.email);
    
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json({
      success: true,
      user: userWithoutPassword,
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error('Couple registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during couple registration'
    });
  }
};

// @desc    Register creator
// @route   POST /api/auth/register/creator
// @access  Public
const registerCreator = async (req, res) => {
  try {
    const { 
      name, email, password, phone, specialty, 
      experience, portfolio, rate 
    } = req.body;
    const prisma = req.prisma;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }
    
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone: phone || '',
        role: 'CREATOR',
        creatorProfile: {
          create: {
            specialty: specialty || '',
            experience: experience || '',
            portfolio: portfolio || '',
            rate: rate ? parseFloat(rate) : 0
          }
        }
      },
      include: {
        creatorProfile: true
      }
    });
    
    console.log('✅ Creator registered:', user.email);
    
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json({
      success: true,
      user: userWithoutPassword,
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error('Creator registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during creator registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const prisma = req.prisma;
    
    console.log('🔐 Login attempt for:', email);
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        clientProfile: true,
        coupleProfile: true,
        creatorProfile: true,
        adminProfile: true
      }
    });
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    console.log('✅ User found:', user.email);
    console.log('🔑 Role:', user.role);
    
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔐 Password match:', isMatch);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      user: userWithoutPassword,
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const prisma = req.prisma;
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        clientProfile: true,
        coupleProfile: true,
        creatorProfile: true,
        adminProfile: true
      }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const { password, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Get all users (admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const prisma = req.prisma;
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        coupleProfile: true,
        creatorProfile: true
      }
    });
    
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  getAllUsers,
  registerCouple,
  registerCreator
};