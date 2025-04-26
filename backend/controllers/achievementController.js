const Achievement = require('../models/Achievement');
const User = require('../models/User');

// Lấy tất cả thành tích của người dùng hiện tại
exports.getMyAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ user: req.user.id });

    res.status(200).json({
      status: 'success',
      results: achievements.length,
      data: {
        achievements
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Lấy một thành tích cụ thể
exports.getAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy thành tích với ID này'
      });
    }

    // Kiểm tra xem thành tích có thuộc về người dùng hiện tại không
    if (achievement.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'Bạn không có quyền truy cập thành tích này'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        achievement
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Tạo thành tích mới (thường được gọi từ các controller khác)
exports.createAchievement = async (req, res) => {
  try {
    // Thêm ID người dùng vào dữ liệu thành tích
    req.body.user = req.user.id;

    const newAchievement = await Achievement.create(req.body);

    // Thêm thành tích vào danh sách thành tích của người dùng
    await User.findByIdAndUpdate(req.user.id, {
      $push: { achievements: newAchievement._id }
    });

    // Thêm XP thưởng nếu có
    if (req.body.xpReward && req.body.xpReward > 0) {
      const user = await User.findById(req.user.id);
      user.addXP(req.body.xpReward);
      await user.save({ validateBeforeSave: false });
    }

    res.status(201).json({
      status: 'success',
      data: {
        achievement: newAchievement
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Kiểm tra và cấp thành tích dựa trên tiêu chí
exports.checkAchievements = async (userId) => {
  try {
    const user = await User.findById(userId);
    const newAchievements = [];

    // Kiểm tra các tiêu chí thành tích
    // 1. Thành tích streak
    if (user.streak === 3 || user.streak === 7 || user.streak === 30 || user.streak === 100) {
      const streakAchievement = await Achievement.create({
        title: `Streak ${user.streak} ngày`,
        description: `Bạn đã hoàn thành nhiệm vụ liên tục ${user.streak} ngày!`,
        icon: 'fa-fire',
        user: user._id,
        category: 'streak',
        xpReward: user.streak
      });

      // Thêm thành tích vào danh sách thành tích của người dùng
      await User.findByIdAndUpdate(userId, {
        $push: { achievements: streakAchievement._id }
      });

      // Thêm XP thưởng
      user.addXP(user.streak);
      await user.save({ validateBeforeSave: false });

      newAchievements.push(streakAchievement);
    }

    return newAchievements;
  } catch (error) {
    console.error('Lỗi khi kiểm tra thành tích:', error);
    return [];
  }
};

// Lấy thành tích theo danh mục
exports.getAchievementsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const achievements = await Achievement.find({ 
      user: req.user.id,
      category: category 
    });

    res.status(200).json({
      status: 'success',
      results: achievements.length,
      data: {
        achievements
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};