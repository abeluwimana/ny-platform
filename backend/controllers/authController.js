const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register regular user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const prisma = req.prisma;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
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
    
    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || '',
        role: 'CLIENT',
        clientProfile: {
          create: {}
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });
    
    res.status(201).json({
      success: true,
      user,
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error(error);
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
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
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
    
    // Create couple user
    const user = await prisma.user.create({
      data: {
        name: `${groomName} & ${brideName}`,
        email,
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
    
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json({
      success: true,
      user: userWithoutPassword,
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error(error);
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
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
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
    
    // Create creator user
    const user = await prisma.user.create({
      data: {
        name,
        email,
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
    
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json({
      success: true,
      user: userWithoutPassword,
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error(error);
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
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    // Find user with their profile
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        clientProfile: true,
        coupleProfile: true,
        creatorProfile: true,
        adminProfile: true
      }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Return response (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      user: userWithoutPassword,
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error(error);
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