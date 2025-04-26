const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tiêu đề nhiệm vụ'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả nhiệm vụ'],
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  xpReward: {
    type: Number,
    default: function() {
      // Tính XP dựa trên độ khó
      if (this.difficulty === 'easy') return 10;
      if (this.difficulty === 'medium') return 20;
      if (this.difficulty === 'hard') return 30;
      return 10;
    }
  },
  completed: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  dueDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
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
  isDaily: {
    type: Boolean,
    default: false
  },
  isRepeatable: {
    type: Boolean,
    default: false
  },
  repeatInterval: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  }
});

// Phương thức cập nhật tiến độ
questSchema.methods.updateProgress = function(progressValue) {
  this.progress = Math.min(100, Math.max(0, progressValue));
  
  // Kiểm tra hoàn thành
  if (this.progress >= 100) {
    this.completed = true;
    this.completedAt = new Date();
    return true; // Đã hoàn thành
  }
  
  return false; // Chưa hoàn thành
};

// Phương thức đánh dấu hoàn thành
questSchema.methods.markAsCompleted = function() {
  this.completed = true;
  this.progress = 100;
  this.completedAt = new Date();
};

const Quest = mongoose.model('Quest', questSchema);

module.exports = Quest;