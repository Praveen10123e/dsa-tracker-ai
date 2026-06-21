const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['problem', 'revision', 'concept', 'mock'],
    default: 'problem',
    required: true
  },
  pattern: {
    type: String,
    default: ''
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    default: null
  },
  status: {
    type: String,
    enum: ['todo', 'completed'],
    default: 'todo',
    required: true
  },
  date: {
    type: String, // 'YYYY-MM-DD'
    required: true
  },
  isSystemGenerated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', TaskSchema);
