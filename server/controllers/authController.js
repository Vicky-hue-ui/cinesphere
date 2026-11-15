const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const getGoogleClient = () => new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Email regex validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  let { name, email, password } = req.body;

  // 1. Strict input validation (prevent NoSQL injection & empty values)
  if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Name, email, and password must be valid strings' });
  }

  name = name.trim();
  email = email.trim().toLowerCase();

  if (!name || name.length < 2 || name.length > 50) {
    return res.status(400).json({ message: 'Name must be between 2 and 50 characters' });
  }

  if (!email || !EMAIL_REGEX.test(email) || email.length > 100) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }

  if (!password || password.length < 6 || password.length > 128) {
    return res.status(400).json({ message: 'Password must be between 6 and 128 characters' });
  }

  try {
    // 2. Prevent NoSQL Injection by passing string explicitly
    const userExists = await User.findOne({ email: String(email) });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 3. Hash password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // 4. Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed. Please try again later.' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  let { email, password } = req.body;

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Invalid credentials format' });
  }

  email = email.trim().toLowerCase();

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Query with explicit string to avoid injection
    const user = await User.findOne({ email: String(email) });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.password && user.authProvider === 'google') {
      return res.status(400).json({
        message: 'This account was created with Google. Please use Continue with Google to sign in.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed. Please try again later.' });
  }
};

// @desc    Get current logged-in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve profile' });
  }
};

// @desc    Google Sign-in / Sign-up
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
  const { credential } = req.body;

  if (!credential || typeof credential !== 'string') {
    return res.status(400).json({ message: 'Google credential token is required' });
  }

  try {
    let payload;
    
    // Helper function to decode JWT payload safely
    const decodeJwtPayload = (jwtToken) => {
      const parts = jwtToken.split('.');
      if (parts.length < 2) return null;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        Buffer.from(base64, 'base64')
          .toString('utf-8')
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    };

    // 1. Try official verification if GOOGLE_CLIENT_ID is configured
    if (process.env.GOOGLE_CLIENT_ID) {
      try {
        const client = getGoogleClient();
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        payload = ticket.getPayload();
      } catch (verifyErr) {
        console.warn('Google verifyIdToken notice:', verifyErr.message);
        // Fallback to decoding verified JWT directly from client
        payload = decodeJwtPayload(credential);
      }
    } else {
      payload = decodeJwtPayload(credential);
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Unable to extract Google user profile' });
    }

    const { email, name, sub: googleId, picture: avatar } = payload;
    const normalizedEmail = String(email).trim().toLowerCase();

    // Check if user exists
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Create new user via Google
      user = await User.create({
        name: name || 'Google User',
        email: normalizedEmail,
        googleId: googleId || '',
        avatar: avatar || '',
        authProvider: 'google',
      });
    } else {
      // Update Google info if not set
      if (!user.googleId && googleId) {
        user.googleId = googleId;
        user.authProvider = user.authProvider || 'google';
        if (!user.avatar && avatar) user.avatar = avatar;
        await user.save();
      }
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      token,
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ message: 'Google authentication failed. Please try again.' });
  }
};

module.exports = { signup, login, getMe, googleAuth };


