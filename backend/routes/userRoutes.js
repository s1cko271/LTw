const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Route công khai
router.post('/register', userController.register);
router.post('/login', userController.login);

// Route yêu cầu xác thực
router.use(authMiddleware.protect); // Middleware bảo vệ tất cả các route bên dưới

router.get('/me', userController.getMe);
router.patch('/updateMe', userController.updateMe);
router.patch('/updatePassword', userController.updatePassword);
router.post('/addXP', userController.addXP);

module.exports = router;