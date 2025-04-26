const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware bảo vệ route yêu cầu đăng nhập
exports.protect = async (req, res, next) => {
  try {
    // 1) Kiểm tra xem token có tồn tại không
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'Bạn chưa đăng nhập. Vui lòng đăng nhập để truy cập.'
      });
    }

    // 2) Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Kiểm tra xem người dùng vẫn tồn tại không
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'Người dùng sở hữu token này không còn tồn tại.'
      });
    }

    // 4) Lưu thông tin người dùng vào request
    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Không có quyền truy cập. Vui lòng đăng nhập lại.'
    });
  }
};

// Middleware kiểm tra quyền admin (nếu cần)
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'Bạn không có quyền thực hiện hành động này'
      });
    }
    next();
  };
};