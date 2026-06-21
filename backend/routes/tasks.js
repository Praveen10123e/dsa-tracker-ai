const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Problem = require('../models/Problem');
const Progress = require('../models/Progress');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Helper to get formatted date string (YYYY-MM-DD)
const getFormattedDate = (date = new Date()) => {
  return date.toISOString().split('T')[0];
};

// @route   GET api/tasks/today
// @desc    Get today's tasks and automatically roll over unfinished tasks from yesterday
// @access  Private
router.get('/today', auth, async (req, res) => {
  const userId = req.user.id;
  const todayStr = getFormattedDate();

  try {
    // 1. Roll over unfinished tasks: Find any tasks before today that are still 'todo'
    const unfinishedTasks = await Task.find({
      userId,
      status: 'todo',
      date: { $lt: todayStr }
    });

    if (unfinishedTasks.length > 0) {
      // Move them to today's list
      await Task.updateMany(
        { userId, status: 'todo', date: { $lt: todayStr } },
        { date: todayStr }
      );
      console.log(`Rolled over ${unfinishedTasks.length} unfinished tasks to today.`);
    }

    // 2. Fetch all tasks for today
    let todayTasks = await Task.find({ userId, date: todayStr }).populate('problemId');

    // 3. If empty, auto-generate standard tasks based on goals
    if (todayTasks.length === 0) {
      const user = await User.findById(userId);
      const targetCount = user.targetProblemsPerDay || 3;

      // Find recommended unsolved problems
      const progress = await Progress.find({ userId, status: 'solved' });
      const solvedProblemIds = progress.map(p => p.problemId);

      // Get some recommended problems
      let recommended = await Problem.find({
        _id: { $nin: solvedProblemIds }
      }).limit(targetCount);

      if (recommended.length === 0) {
        recommended = await Problem.find({}).limit(targetCount);
      }

      // Add them as today's tasks
      for (const problem of recommended) {
        await Task.create({
          userId,
          title: `Solve ${problem.platform} ${problem.title}`,
          type: 'problem',
          pattern: problem.pattern,
          problemId: problem._id,
          status: 'todo',
          date: todayStr,
          isSystemGenerated: true
        });
      }

      // Add one Concept Review task
      const randomPattern = recommended[0]?.pattern || 'Arrays';
      await Task.create({
        userId,
        title: `Review ${randomPattern} template & tips`,
        type: 'concept',
        pattern: randomPattern,
        status: 'todo',
        date: todayStr,
        isSystemGenerated: true
      });

      // Fetch the newly created tasks
      todayTasks = await Task.find({ userId, date: todayStr }).populate('problemId');
    }

    res.json(todayTasks);
  } catch (error) {
    console.error('Fetch tasks error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/tasks/create
// @desc    Create a custom task
// @access  Private
router.post('/create', auth, async (req, res) => {
  const { title, type, pattern, problemId } = req.body;
  const todayStr = getFormattedDate();

  try {
    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const task = await Task.create({
      userId: req.user.id,
      title,
      type: type || 'problem',
      pattern: pattern || '',
      problemId: problemId || null,
      status: 'todo',
      date: todayStr
    });

    const populatedTask = await Task.findById(task._id).populate('problemId');
    res.status(201).json(populatedTask);
  } catch (error) {
    console.error('Create task error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/tasks/toggle/:taskId
// @desc    Toggle task status (completing gives minor XP)
// @access  Private
router.put('/toggle/:taskId', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.taskId, userId: req.user.id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const oldStatus = task.status;
    const newStatus = oldStatus === 'todo' ? 'completed' : 'todo';
    task.status = newStatus;
    await task.save();

    // Minor motivation XP reward for completing tasks directly (+5 XP)
    const user = await User.findById(req.user.id);
    let xpEarned = 0;
    let leveledUp = false;

    if (oldStatus === 'todo' && newStatus === 'completed') {
      xpEarned = 5;
      user.xp += xpEarned;
      
      let xpNeeded = user.level * 100;
      if (user.xp >= xpNeeded) {
        user.xp -= xpNeeded;
        user.level += 1;
        leveledUp = true;
      }
      await user.save();
    } else if (oldStatus === 'completed' && newStatus === 'todo') {
      // Deduct if unmarked
      user.xp = Math.max(0, user.xp - 5);
      await user.save();
    }

    res.json({
      task,
      xpEarned,
      leveledUp,
      user: {
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        badges: user.badges
      }
    });
  } catch (error) {
    console.error('Toggle task error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/tasks/auto-generate
// @desc    Auto-generate an additional set of practice plans for today
// @access  Private
router.post('/auto-generate', auth, async (req, res) => {
  const userId = req.user.id;
  const todayStr = getFormattedDate();

  try {
    // Fetch user preferences
    const user = await User.findById(userId);
    const target = user.targetProblemsPerDay || 3;

    // Find solved problems to exclude
    const progress = await Progress.find({ userId, status: 'solved' });
    const solvedProblemIds = progress.map(p => p.problemId);

    // Fetch existing tasks problem IDs for today to prevent duplicates
    const todayTasks = await Task.find({ userId, date: todayStr, problemId: { $ne: null } });
    const todayTaskProblemIds = todayTasks.map(t => t.problemId.toString());

    // Recommend problems
    let recommended = await Problem.find({
      _id: { $nin: [...solvedProblemIds, ...todayTaskProblemIds] }
    }).limit(target);

    if (recommended.length === 0) {
      return res.json({ message: 'No new problems to recommend at this time.', count: 0 });
    }

    const createdTasks = [];
    for (const problem of recommended) {
      const task = await Task.create({
        userId,
        title: `Solve ${problem.platform} ${problem.title}`,
        type: 'problem',
        pattern: problem.pattern,
        problemId: problem._id,
        status: 'todo',
        date: todayStr,
        isSystemGenerated: true
      });
      createdTasks.push(task);
    }

    // Return today's updated tasks
    const allTodayTasks = await Task.find({ userId, date: todayStr }).populate('problemId');
    res.json(allTodayTasks);
  } catch (error) {
    console.error('Auto generate tasks error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
