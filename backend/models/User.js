const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Vui lòng nhập tên người dùng'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Email không hợp lệ']
  },
  password: {
    type: String,
    required: [true, 'Vui lòng nhập mật khẩu'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  xp: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  streak: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  quests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quest'
  }],
  achievements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement'
  }]
});

// Mã hóa mật khẩu trước khi lưu
userSchema.pre('save', async function(next) {
  // Chỉ mã hóa mật khẩu nếu nó được sửa đổi
  if (!this.isModified('password')) return next();
  
  // Mã hóa mật khẩu với độ phức tạp 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Phương thức kiểm tra mật khẩu
userSchema.methods.checkPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Phương thức thêm XP và kiểm tra lên cấp
userSchema.methods.addXP = function(xpAmount) {
  this.xp += xpAmount;
  
  // Kiểm tra lên cấp (công thức: level * 100 XP để lên cấp)
  const xpNeeded = this.level * 100;
  
  if (this.xp >= xpNeeded) {
    this.level += 1;
    this.xp -= xpNeeded;
    return true; // Đã lên cấp
  }
  
  return false; // Chưa lên cấp
};

// Phương thức cập nhật streak
userSchema.methods.updateStreak = function() {
  const now = new Date();
  const lastActive = this.lastActive;
  
  // Tính số ngày giữa lần hoạt động cuối và hiện tại
  const diffTime = Math.abs(now - lastActive);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    // Người dùng hoạt động liên tiếp
    this.streak += 1;
  } else if (diffDays > 1) {
    // Người dùng bỏ lỡ ít nhất một ngày
    this.streak = 1;
  }
  
  this.lastActive = now;
  return this.streak;
};

const User = mongoose.model('User', userSchema);

module.exports = User;