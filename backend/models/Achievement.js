const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tiêu đề thành tích'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả thành tích'],
    trim: true
  },
  icon: {
    type: String,
    default: 'fa-trophy'
  },
  date: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    default: 'general'
  },
  xpReward: {
    type: Number,
    default: 0
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  criteria: {
    type: Object,
    default: {}
  }
});

const Achievement = mongoose.model('Achievement', achievementSchema);

module.exports = Achievement;