const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
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

module.exports = router;
