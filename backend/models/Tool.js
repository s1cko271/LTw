const mongoose = require('mongoose');

// Schema cho Pomodoro Timer
const pomodoroSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workTime: {
    type: Number,
    default: 25 * 60 // 25 phút tính bằng giây
  },
  breakTime: {
    type: Number,
    default: 5 * 60 // 5 phút tính bằng giây
  },
  completedSessions: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
});

// Schema cho Quick Checklist
const checklistItemSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const checklistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [checklistItemSchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Schema cho Quick Notes
const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Tạo các model
const Pomodoro = mongoose.model('Pomodoro', pomodoroSchema);
const Checklist = mongoose.model('Checklist', checklistSchema);
const Note = mongoose.model('Note', noteSchema);

module.exports = {
  Pomodoro,
  Checklist,
  Note
};