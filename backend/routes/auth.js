const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const auth = require('../middleware/auth');

const CORE_PATTERNS = [
  'Arrays', 'Strings', 'Hashing', 'Prefix Sum', 'Two Pointers',
  'Sliding Window', 'Binary Search', 'Linked List', 'Stack', 'Queue',
  'Heap / Priority Queue', 'Trees', 'Binary Search Trees', 'Trie', 'Greedy',
  'Backtracking', 'Dynamic Programming', 'Graphs', 'Union Find', 'Bit Manipulation'
];

// Helper to generate JWT
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'super_secret_dsa_tracker_key_987654321',
    { expiresIn: '30d' }
  );
};

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    let userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    let usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Initialize pattern mastery map with 0 for all patterns
    const patternMastery = new Map();
    CORE_PATTERNS.forEach(pattern => {
      patternMastery.set(pattern, 0);
    });

    const user = await User.create({
      username,
      email,
      password,
      patternMastery
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        lastActiveDate: user.lastActiveDate,
        badges: user.badges,
        targetProblemsPerDay: user.targetProblemsPerDay,
        selectedCompanies: user.selectedCompanies,
        patternMastery: Object.fromEntries(user.patternMastery)
      }
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        lastActiveDate: user.lastActiveDate,
        badges: user.badges,
        targetProblemsPerDay: user.targetProblemsPerDay,
        selectedCompanies: user.selectedCompanies,
        patternMastery: Object.fromEntries(user.patternMastery || new Map())
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/auth/me
// @desc    Get user data
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      lastActiveDate: user.lastActiveDate,
      badges: user.badges,
      targetProblemsPerDay: user.targetProblemsPerDay,
      selectedCompanies: user.selectedCompanies,
      patternMastery: Object.fromEntries(user.patternMastery || new Map())
    });
  } catch (error) {
    console.error('Get user error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/auth/me/update
// @desc    Update user profile settings
// @access  Private
router.put('/me/update', auth, async (req, res) => {
  const { targetProblemsPerDay, selectedCompanies } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (targetProblemsPerDay !== undefined) {
      user.targetProblemsPerDay = targetProblemsPerDay;
    }
    if (selectedCompanies !== undefined) {
      user.selectedCompanies = selectedCompanies;
    }

    await user.save();

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      lastActiveDate: user.lastActiveDate,
      badges: user.badges,
      targetProblemsPerDay: user.targetProblemsPerDay,
      selectedCompanies: user.selectedCompanies,
      patternMastery: Object.fromEntries(user.patternMastery || new Map())
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Initialize Google OAuth2Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @route   POST api/auth/google
// @desc    Authenticate or register user with Google OAuth
// @access  Public
router.post('/google', async (req, res) => {
  const { credential } = req.body;

  try {
    if (!credential) {
      return res.status(400).json({ message: 'No Google credential token provided' });
    }

    let email, name;

    // Check if Google Client ID is configured. If not, allow mock login for development.
    if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID.startsWith('mock_')) {
      console.log('Google Sign-In: Client ID not set or mock. Performing development fallback...');
      // Extract from a mock token (which is just a JSON payload sent in dev) or use parameters
      if (credential.startsWith('mock_')) {
        email = req.body.email || 'google_developer@example.com';
        name = req.body.name || 'Google Developer';
      } else {
        // Try decoding JWT payload directly without verification since we have no Client ID
        try {
          const parts = credential.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            email = payload.email;
            name = payload.name;
          }
        } catch (e) {
          email = 'google_developer@example.com';
          name = 'Google Developer';
        }
      }
    } else {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name;
    }

    if (!email) {
      return res.status(400).json({ message: 'Invalid token: email not found' });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create user if not exists
      let baseUsername = name ? name.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'user';
      let username = baseUsername;
      let count = 1;
      while (await User.findOne({ username })) {
        username = `${baseUsername}_${count}`;
        count++;
      }

      // Generate a long random password for database validation
      const randomPassword = require('crypto').randomBytes(16).toString('hex');

      // Initialize pattern mastery map
      const patternMastery = new Map();
      CORE_PATTERNS.forEach(pattern => {
        patternMastery.set(pattern, 0);
      });

      user = await User.create({
        username,
        email,
        password: randomPassword,
        patternMastery
      });
      console.log(`Created new user through Google login: ${username} (${email})`);
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        lastActiveDate: user.lastActiveDate,
        badges: user.badges,
        targetProblemsPerDay: user.targetProblemsPerDay,
        selectedCompanies: user.selectedCompanies,
        patternMastery: Object.fromEntries(user.patternMastery || new Map())
      }
    });
  } catch (error) {
    console.error('Google Auth error:', error.message || error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
});

module.exports = router;
