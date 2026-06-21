const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  status: {
    type: String,
    enum: ['solved', 'attempted'],
    default: 'solved',
    required: true
  },
  codeSubmitted: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  solvedAt: {
    type: Date,
    default: Date.now
  },
  revisionCount: {
    type: Number,
    default: 0
  },
  nextRevisionDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Progress', ProgressSchema);
