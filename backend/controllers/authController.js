// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/emailService');
const { welcomeEmail } = require('../utils/emailTemplates');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

const getAdminEmail = () => process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'nyentertainmentrwanda@gmail.com';

const createTemporaryPassword = () => `google-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const sendRegistrationEmails = async (user) => {
  try {
    const displayName = user.name || user.email?.split('@')[0] || 'there';
    const html = welcomeEmail(displayName);

    await sendEmail(user.email, 'Welcome to NY Entertainment Rwanda! 🎉', html);

    const adminHtml = `
      <h2>New user registered</h2>
      <p><strong>Name:</strong> ${displayName}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Role:</strong> ${user.role || 'CLIENT'}</p>
      <p>A new account was created on the platform.</p>
    `;

    await sendEmail(getAdminEmail(), 'New user registered on NY Entertainment', adminHtml);
  } catch (error) {
    console.error('Registration email error:', error.message);
  }
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

    await sendRegistrationEmails(user);
    
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

    await sendRegistrationEmails(user);
    
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

    await sendRegistrationEmails(user);
    
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

// @desc    Sign in with Google
// @route   POST /api/auth/google
// @access  Public
const googleSignIn = async (req, res) => {
  try {
    const { credential, idToken, email, name, picture } = req.body;
    const prisma = req.prisma;

    let googleEmail = email || null;
    let googleName = name || null;
    let googlePicture = picture || null;

    if (credential || idToken) {
      const token = credential || idToken;
      try {
        const googleResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`);
        if (googleResponse.ok) {
          const payload = await googleResponse.json();
          googleEmail = payload.email || googleEmail;
          googleName = payload.name || payload.given_name || googleName;
          googlePicture = payload.picture || googlePicture;
        }
      } catch (tokenError) {
        console.error('Google token verification error:', tokenError.message);
      }
    }

    if (!googleEmail) {
      return res.status(400).json({
        success: false,
        message: 'Google email is required'
      });
    }

    const normalizedEmail = googleEmail.toLowerCase().trim();
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        clientProfile: true,
        coupleProfile: true,
        creatorProfile: true,
        adminProfile: true
      }
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash(createTemporaryPassword(), 10);
      user = await prisma.user.create({
        data: {
          name: googleName || normalizedEmail.split('@')[0],
          email: normalizedEmail,
          password: hashedPassword,
          phone: '',
          role: 'CLIENT',
          avatar: googlePicture || null,
          clientProfile: { create: {} }
        },
        include: {
          clientProfile: true,
          coupleProfile: true,
          creatorProfile: true,
          adminProfile: true
        }
      });

      await sendRegistrationEmails(user);
    } else {
      const updates = {};
      if (!user.name && googleName) updates.name = googleName;
      if (!user.avatar && googlePicture) updates.avatar = googlePicture;

      if (Object.keys(updates).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updates,
          include: {
            clientProfile: true,
            coupleProfile: true,
            creatorProfile: true,
            adminProfile: true
          }
        });
      }
    }

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword,
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error('Google sign-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Google sign-in'
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
  googleSignIn,
  getMe,
  logout,
  getAllUsers,
  registerCouple,
  registerCreator
};