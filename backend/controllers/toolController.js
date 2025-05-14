const { Pomodoro, Checklist, Note } = require('../models/Tool');

// Controller cho Pomodoro Timer
exports.getPomodoroSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let pomodoro = await Pomodoro.findOne({ user: userId });
    
    // Nếu không tìm thấy, tạo mới với giá trị mặc định
    if (!pomodoro) {
      pomodoro = await Pomodoro.create({ user: userId });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        pomodoro
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi lấy cài đặt Pomodoro',
      error: error.message
    });
  }
};

exports.updatePomodoroSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { workTime, breakTime } = req.body;
    
    let pomodoro = await Pomodoro.findOne({ user: userId });
    
    // Nếu không tìm thấy, tạo mới
    if (!pomodoro) {
      pomodoro = await Pomodoro.create({
        user: userId,
        workTime,
        breakTime
      });
    } else {
      // Cập nhật cài đặt
      pomodoro.workTime = workTime || pomodoro.workTime;
      pomodoro.breakTime = breakTime || pomodoro.breakTime;
      pomodoro.lastUsed = Date.now();
      await pomodoro.save();
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        pomodoro
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi cập nhật cài đặt Pomodoro',
      error: error.message
    });
  }
};

exports.incrementPomodoroSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let pomodoro = await Pomodoro.findOne({ user: userId });
    
    // Nếu không tìm thấy, tạo mới
    if (!pomodoro) {
      pomodoro = await Pomodoro.create({
        user: userId,
        completedSessions: 1
      });
    } else {
      // Tăng số phiên đã hoàn thành
      pomodoro.completedSessions += 1;
      pomodoro.lastUsed = Date.now();
      await pomodoro.save();
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        pomodoro
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi cập nhật số phiên Pomodoro',
      error: error.message
    });
  }
};

// Controller cho Quick Checklist
exports.getChecklist = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let checklist = await Checklist.findOne({ user: userId });
    
    // Nếu không tìm thấy, tạo mới với danh sách trống
    if (!checklist) {
      checklist = await Checklist.create({
        user: userId,
        items: []
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        checklist
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi lấy danh sách kiểm tra',
      error: error.message
    });
  }
};

exports.updateChecklist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;
    
    let checklist = await Checklist.findOne({ user: userId });
    
    // Nếu không tìm thấy, tạo mới
    if (!checklist) {
      checklist = await Checklist.create({
        user: userId,
        items
      });
    } else {
      // Cập nhật danh sách
      checklist.items = items;
      checklist.lastUpdated = Date.now();
      await checklist.save();
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        checklist
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi cập nhật danh sách kiểm tra',
      error: error.message
    });
  }
};

// Controller cho Quick Notes
exports.getNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const notes = await Note.find({ user: userId }).sort({ updatedAt: -1 });
    
    res.status(200).json({
      status: 'success',
      data: {
        notes
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi lấy ghi chú',
      error: error.message
    });
  }
};

exports.createNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { content } = req.body;
    
    const note = await Note.create({
      user: userId,
      content
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        note
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi tạo ghi chú',
      error: error.message
    });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    const { content } = req.body;
    
    const note = await Note.findById(noteId);
    
    // Kiểm tra xem ghi chú có tồn tại không
    if (!note) {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy ghi chú'
      });
    }
    
    // Kiểm tra xem người dùng có sở hữu ghi chú này không
    if (note.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'Bạn không có quyền cập nhật ghi chú này'
      });
    }
    
    // Cập nhật ghi chú
    note.content = content;
    note.updatedAt = Date.now();
    await note.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        note
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi cập nhật ghi chú',
      error: error.message
    });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    
    const note = await Note.findById(noteId);
    
    // Kiểm tra xem ghi chú có tồn tại không
    if (!note) {
      return res.status(404).json({
        status: 'fail',
        message: 'Không tìm thấy ghi chú'
      });
    }
    
    // Kiểm tra xem người dùng có sở hữu ghi chú này không
    if (note.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'Bạn không có quyền xóa ghi chú này'
      });
    }
    
    // Xóa ghi chú
    await Note.findByIdAndDelete(noteId);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi xóa ghi chú',
      error: error.message
    });
  }
};