const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Tạo JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Đăng ký người dùng mới
exports.register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Kiểm tra mật khẩu xác nhận
    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 'fail',
        message: 'Mật khẩu xác nhận không khớp!'
      });
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email này đã được sử dụng!'
      });
    }

    // Tạo người dùng mới
    const newUser = await User.create({
      username,
      email,
      password
    });

    // Loại bỏ mật khẩu từ kết quả
    newUser.password = undefined;

    // Tạo token
    const token = signToken(newUser._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra email và password có tồn tại
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Vui lòng cung cấp email và mật khẩu!'
      });
    }

    // Tìm người dùng và lấy cả trường password
    const user = await User.findOne({ email }).select('+password');

    // Kiểm tra người dùng tồn tại và mật khẩu đúng
    if (!user || !(await user.checkPassword(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Email hoặc mật khẩu không đúng!'
      });
    }

    // Cập nhật streak
    user.updateStreak();
    await user.save({ validateBeforeSave: false });

    // Loại bỏ mật khẩu từ kết quả
    user.password = undefined;

    // Tạo token
    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Lấy thông tin người dùng hiện tại
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('quests')
      .populate('achievements');

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Cập nhật thông tin người dùng
exports.updateMe = async (req, res) => {
  try {
    // Không cho phép cập nhật mật khẩu qua route này
    if (req.body.password || req.body.confirmPassword) {
      return res.status(400).json({
        status: 'fail',
        message: 'Route này không dùng để cập nhật mật khẩu. Vui lòng sử dụng /updatePassword.'
      });
    }

    // Lọc các trường không được phép cập nhật
    const filteredBody = {};
    const allowedFields = ['username', 'email', 'bio', 'avatar'];
    
    Object.keys(req.body).forEach(field => {
      if (allowedFields.includes(field)) {
        filteredBody[field] = req.body[field];
      }
    });

    // Cập nhật người dùng
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Cập nhật mật khẩu
exports.updatePassword = async (req, res) => {
  try {
    // Lấy người dùng từ collection
    const user = await User.findById(req.user.id).select('+password');

    // Kiểm tra mật khẩu hiện tại
    if (!(await user.checkPassword(req.body.currentPassword, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Mật khẩu hiện tại không đúng!'
      });
    }

    // Kiểm tra mật khẩu mới và xác nhận
    if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).json({
        status: 'fail',
        message: 'Mật khẩu xác nhận không khớp!'
      });
    }

    // Cập nhật mật khẩu
    user.password = req.body.password;
    await user.save();

    // Loại bỏ mật khẩu từ kết quả
    user.password = undefined;

    // Tạo token mới
    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Thêm XP cho người dùng
exports.addXP = async (req, res) => {
  try {
    const { xpAmount } = req.body;
    
    if (!xpAmount || xpAmount <= 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Vui lòng cung cấp số lượng XP hợp lệ!'
      });
    }

    const user = await User.findById(req.user.id);
    
    // Thêm XP và kiểm tra lên cấp
    const leveledUp = user.addXP(xpAmount);
    await user.save({ validateBeforeSave: false });

    // Nếu người dùng lên cấp, tạo thành tích mới
    if (leveledUp) {
      const Achievement = require('../models/Achievement');
      await Achievement.create({
        title: `Đạt cấp độ ${user.level}`,
        description: `Bạn đã đạt đến cấp độ ${user.level}!`,
        icon: 'fa-trophy',
        user: user._id,
        category: 'level',
        xpReward: 0
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
        leveledUp
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};