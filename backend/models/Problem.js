const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['LeetCode', 'CodeChef', 'HackerRank'],
    default: 'LeetCode'
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard']
  },
  pattern: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  tags: {
    type: [String],
    default: []
  },
  estimatedSolveTime: {
    type: Number, // in minutes
    required: true,
    default: 20
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Problem', ProblemSchema);
