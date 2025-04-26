const Quest = require('../models/Quest');
const User = require('../models/User');
const Achievement = require('../models/Achievement');

// Lấy tất cả nhiệm vụ của người dùng hiện tại
exports.getMyQuests = async (req, res) => {
  try {
    const quests = await Quest.find({ user: req.user.id });

    res.status(200).json({
      status: 'success',
      results: quests.length,
      data: {
        quests
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Lấy một nhiệm vụ cụ thể
exports.getQuest = async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);

    if (!quest) {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy nhiệm vụ với ID này'
      });
    }

    // Kiểm tra xem nhiệm vụ có thuộc về người dùng hiện tại không
    if (quest.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'Bạn không có quyền truy cập nhiệm vụ này'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        quest
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Tạo nhiệm vụ mới
exports.createQuest = async (req, res) => {
  try {
    // Thêm ID người dùng vào dữ liệu nhiệm vụ
    req.body.user = req.user.id;

    const newQuest = await Quest.create(req.body);

    // Thêm nhiệm vụ vào danh sách nhiệm vụ của người dùng
    await User.findByIdAndUpdate(req.user.id, {
      $push: { quests: newQuest._id }
    });

    res.status(201).json({
      status: 'success',
      data: {
        quest: newQuest
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Cập nhật nhiệm vụ
exports.updateQuest = async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);

    if (!quest) {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy nhiệm vụ với ID này'
      });
    }

    // Kiểm tra xem nhiệm vụ có thuộc về người dùng hiện tại không
    if (quest.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'Bạn không có quyền cập nhật nhiệm vụ này'
      });
    }

    // Cập nhật nhiệm vụ
    const updatedQuest = await Quest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        quest: updatedQuest
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Xóa nhiệm vụ
exports.deleteQuest = async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);

    if (!quest) {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy nhiệm vụ với ID này'
      });
    }

    // Kiểm tra xem nhiệm vụ có thuộc về người dùng hiện tại không
    if (quest.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'Bạn không có quyền xóa nhiệm vụ này'
      });
    }

    // Xóa nhiệm vụ
    await Quest.findByIdAndDelete(req.params.id);

    // Xóa nhiệm vụ khỏi danh sách nhiệm vụ của người dùng
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { quests: req.params.id }
    });

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Cập nhật tiến độ nhiệm vụ
exports.updateQuestProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    
    if (progress === undefined || progress < 0 || progress > 100) {
      return res.status(400).json({
        status: 'fail',
        message: 'Vui lòng cung cấp giá trị tiến độ hợp lệ (0-100)!'
      });
    }

    const quest = await Quest.findById(req.params.id);

    if (!quest) {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy nhiệm vụ với ID này'
      });
    }

    // Kiểm tra xem nhiệm vụ có thuộc về người dùng hiện tại không
    if (quest.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'Bạn không có quyền cập nhật nhiệm vụ này'
      });
    }

    // Cập nhật tiến độ và kiểm tra hoàn thành
    const wasCompleted = quest.completed;
    const isNowCompleted = quest.updateProgress(progress);
    await quest.save();

    // Nếu nhiệm vụ vừa hoàn thành, thêm XP cho người dùng
    if (!wasCompleted && isNowCompleted) {
      const user = await User.findById(req.user.id);
      const leveledUp = user.addXP(quest.xpReward);
      await user.save({ validateBeforeSave: false });

      // Nếu người dùng lên cấp, tạo thành tích mới
      if (leveledUp) {
        await Achievement.create({
          title: `Đạt cấp độ ${user.level}`,
          description: `Bạn đã đạt đến cấp độ ${user.level}!`,
          icon: 'fa-trophy',
          user: user._id,
          category: 'level',
          xpReward: 0
        });
      }

      // Kiểm tra và tạo thành tích hoàn thành nhiệm vụ nếu cần
      const completedQuests = await Quest.countDocuments({ 
        user: req.user.id, 
        completed: true 
      });

      // Thành tích cho số lượng nhiệm vụ hoàn thành
      if (completedQuests === 1 || completedQuests === 10 || completedQuests === 50 || completedQuests === 100) {
        await Achievement.create({
          title: `Hoàn thành ${completedQuests} nhiệm vụ`,
          description: `Bạn đã hoàn thành ${completedQuests} nhiệm vụ!`,
          icon: 'fa-check-circle',
          user: user._id,
          category: 'quest',
          xpReward: 0
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          quest,
          xpGained: quest.xpReward,
          leveledUp
        }
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        quest
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Đánh dấu nhiệm vụ hoàn thành
exports.completeQuest = async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);

    if (!quest) {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy nhiệm vụ với ID này'
      });
    }

    // Kiểm tra xem nhiệm vụ có thuộc về người dùng hiện tại không
    if (quest.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'Bạn không có quyền cập nhật nhiệm vụ này'
      });
    }

    // Kiểm tra xem nhiệm vụ đã hoàn thành chưa
    if (quest.completed) {
      return res.status(400).json({
        status: 'fail',
        message: 'Nhiệm vụ này đã được hoàn thành'
      });
    }

    // Đánh dấu nhiệm vụ hoàn thành
    quest.markAsCompleted();
    await quest.save();

    // Thêm XP cho người dùng
    const user = await User.findById(req.user.id);
    const leveledUp = user.addXP(quest.xpReward);
    await user.save({ validateBeforeSave: false });

    // Nếu người dùng lên cấp, tạo thành tích mới
    if (leveledUp) {
      await Achievement.create({
        title: `Đạt cấp độ ${user.level}`,
        description: `Bạn đã đạt đến cấp độ ${user.level}!`,
        icon: 'fa-trophy',
        user: user._id,
        category: 'level',
        xpReward: 0
      });
    }

    // Kiểm tra và tạo thành tích hoàn thành nhiệm vụ nếu cần
    const completedQuests = await Quest.countDocuments({ 
      user: req.user.id, 
      completed: true 
    });

    // Thành tích cho số lượng nhiệm vụ hoàn thành
    if (completedQuests === 1 || completedQuests === 10 || completedQuests === 50 || completedQuests === 100) {
      await Achievement.create({
        title: `Hoàn thành ${completedQuests} nhiệm vụ`,
        description: `Bạn đã hoàn thành ${completedQuests} nhiệm vụ!`,
        icon: 'fa-check-circle',
        user: user._id,
        category: 'quest',
        xpReward: 0
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        quest,
        xpGained: quest.xpReward,
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