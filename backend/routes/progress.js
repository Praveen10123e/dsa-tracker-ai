const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const Problem = require('../models/Problem');
const User = require('../models/User');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// Spaced Repetition intervals in days
const REVISION_INTERVALS = [1, 3, 7, 14, 30];

// Helper to get formatted date string (YYYY-MM-DD)
const getFormattedDate = (date = new Date()) => {
  return date.toISOString().split('T')[0];
};

// Helper to get date after N days
const getDateAfterDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

// @route   POST api/progress/solve
// @desc    Submit a problem solution, earn XP, update streak, recalculate pattern mastery, schedule revision
// @access  Private
router.post('/solve', auth, async (req, res) => {
  const { problemId, codeSubmitted, notes } = req.body;

  try {
    if (!problemId) {
      return res.status(400).json({ message: 'Problem ID is required' });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 1. Save progress
    let progress = await Progress.findOne({ userId: user._id, problemId });
    let isNewSolve = false;

    if (!progress) {
      isNewSolve = true;
      progress = new Progress({
        userId: user._id,
        problemId,
        status: 'solved',
        codeSubmitted,
        notes,
        revisionCount: 1,
        nextRevisionDate: getDateAfterDays(REVISION_INTERVALS[0]) // due in 1 day
      });
    } else {
      progress.codeSubmitted = codeSubmitted || progress.codeSubmitted;
      progress.notes = notes || progress.notes;
      progress.status = 'solved';
      
      // Bump spaced repetition interval
      const count = Math.min(progress.revisionCount + 1, REVISION_INTERVALS.length);
      progress.revisionCount = count;
      progress.nextRevisionDate = getDateAfterDays(REVISION_INTERVALS[count - 1]);
    }

    await progress.save();

    // 2. Schedule a revision task
    const revisionDateStr = getFormattedDate(progress.nextRevisionDate);
    
    // Check if task already exists for this revision
    const existingTask = await Task.findOne({
      userId: user._id,
      problemId,
      type: 'revision',
      date: revisionDateStr
    });

    if (!existingTask) {
      await Task.create({
        userId: user._id,
        title: `Revise: ${problem.title}`,
        type: 'revision',
        pattern: problem.pattern,
        problemId,
        status: 'todo',
        date: revisionDateStr,
        isSystemGenerated: true
      });
    }

    // 3. Mark matching daily planner task as completed if it exists
    const todayStr = getFormattedDate();
    await Task.updateMany(
      { userId: user._id, problemId, date: todayStr, status: 'todo' },
      { status: 'completed' }
    );

    let xpEarned = 0;
    let leveledUp = false;
    let newBadgesEarned = [];

    if (isNewSolve) {
      // 4. Award XP based on difficulty
      if (problem.difficulty === 'Easy') xpEarned = 10;
      else if (problem.difficulty === 'Medium') xpEarned = 20;
      else if (problem.difficulty === 'Hard') xpEarned = 35;

      user.xp += xpEarned;

      // 5. Level Up Check: XP needed for next level is level * 100
      let xpNeeded = user.level * 100;
      if (user.xp >= xpNeeded) {
        user.xp -= xpNeeded;
        user.level += 1;
        leveledUp = true;
      }

      // 6. Streak calculation
      const yesterdayStr = getFormattedDate(new Date(Date.now() - 86400000));
      
      if (!user.lastActiveDate) {
        user.streak = 1;
      } else if (user.lastActiveDate === yesterdayStr) {
        user.streak += 1;
      } else if (user.lastActiveDate !== todayStr) {
        user.streak = 1; // broken streak reset
      }
      user.lastActiveDate = todayStr;

      // 7. Pattern Mastery recalculation
      const totalInPattern = await Problem.countDocuments({ pattern: problem.pattern });
      const solvedInPatternProgress = await Progress.find({ userId: user._id, status: 'solved' }).populate('problemId');
      const solvedCountInPattern = solvedInPatternProgress.filter(
        p => p.problemId && p.problemId.pattern === problem.pattern
      ).length;

      const masteryScore = totalInPattern > 0 
        ? Math.round((solvedCountInPattern / totalInPattern) * 100) 
        : 100;

      user.patternMastery.set(problem.pattern, masteryScore);

      // 8. Gamification Badges check
      const totalSolvedCount = await Progress.countDocuments({ userId: user._id, status: 'solved' });
      
      const checkBadge = (badgeName) => {
        if (!user.badges.includes(badgeName)) {
          user.badges.push(badgeName);
          newBadgesEarned.push(badgeName);
        }
      };

      if (totalSolvedCount === 1) checkBadge("First Problem Solved");
      if (totalSolvedCount >= 10) checkBadge("DSA Apprentice");
      if (totalSolvedCount >= 50) checkBadge("Algorithm Explorer");
      if (totalSolvedCount >= 100) checkBadge("Elite Coder");
      
      if (user.streak >= 7) checkBadge("7-Day Streak");
      if (user.streak >= 30) checkBadge("Unstoppable");
      
      if (masteryScore === 100) {
        checkBadge(`${problem.pattern} Master`);
      }

      await user.save();
    }

    res.json({
      message: 'Problem solved successfully!',
      xpEarned,
      leveledUp,
      newBadgesEarned,
      user: {
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        badges: user.badges,
        patternMastery: Object.fromEntries(user.patternMastery)
      }
    });
  } catch (error) {
    console.error('Solve problem error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/progress/stats
// @desc    Get dashboard analytics, pattern mastery scores, consistency stats
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = req.user;

    // Get all solved progresses
    const solves = await Progress.find({ userId, status: 'solved' }).populate('problemId');

    // 1. Difficulty distribution
    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;

    solves.forEach(s => {
      if (s.problemId) {
        if (s.problemId.difficulty === 'Easy') easyCount++;
        else if (s.problemId.difficulty === 'Medium') mediumCount++;
        else if (s.problemId.difficulty === 'Hard') hardCount++;
      }
    });

    // 2. Solves per day (last 7 days)
    const dailySolves = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getFormattedDate(d);
      dailySolves[dateStr] = 0;
    }

    solves.forEach(s => {
      const dateStr = getFormattedDate(new Date(s.solvedAt));
      if (dailySolves[dateStr] !== undefined) {
        dailySolves[dateStr]++;
      }
    });

    const weeklyProgressData = Object.entries(dailySolves).map(([date, count]) => ({
      date,
      count
    }));

    // 3. Pattern mastery scores map
    const patternMastery = Object.fromEntries(user.patternMastery || new Map());

    // 4. Strengths and Weaknesses lists
    const weakAreas = [];
    const strongAreas = [];
    
    Object.entries(patternMastery).forEach(([pattern, score]) => {
      if (score < 40) weakAreas.push({ pattern, score });
      else if (score >= 75) strongAreas.push({ pattern, score });
    });

    // 5. Spaced repetition due counts
    const today = new Date();
    const revisionQueueCount = await Progress.countDocuments({
      userId,
      nextRevisionDate: { $lte: today },
      status: 'solved'
    });

    // 6. Consistency index (active days out of last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeDates = new Set();

    solves.forEach(s => {
      if (new Date(s.solvedAt) >= thirtyDaysAgo) {
        activeDates.add(getFormattedDate(new Date(s.solvedAt)));
      }
    });
    
    // Add current streak activity
    const consistencyScore = Math.round((activeDates.size / 30) * 100);

    // 7. Full activity heatmap (all solves with count per day)
    const heatmapData = {};
    solves.forEach(s => {
      const dateStr = getFormattedDate(new Date(s.solvedAt));
      heatmapData[dateStr] = (heatmapData[dateStr] || 0) + 1;
    });

    res.json({
      totalSolved: solves.length,
      difficulty: {
        easy: easyCount,
        medium: mediumCount,
        hard: hardCount
      },
      weeklyProgress: weeklyProgressData,
      patternMastery,
      weakAreas,
      strongAreas,
      revisionQueueCount,
      consistencyScore,
      heatmap: heatmapData
    });
  } catch (error) {
    console.error('Fetch stats error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
