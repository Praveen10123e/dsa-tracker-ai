const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET api/leaderboard
// @desc    Get top users by level & XP
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Sort by level descending, then XP descending
    const users = await User.find({})
      .select('username level xp streak badges')
      .sort({ level: -1, xp: -1 })
      .limit(20);

    const rankings = users.map((user, idx) => ({
      rank: idx + 1,
      id: user._id,
      username: user.username,
      level: user.level,
      xp: user.xp,
      streak: user.streak,
      badgesCount: user.badges.length
    }));

    res.json(rankings);
  } catch (error) {
    console.error('Fetch leaderboard error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
