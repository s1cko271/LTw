const express = require('express');
const achievementController = require('../controllers/achievementController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Tất cả các route achievement đều yêu cầu xác thực
router.use(authMiddleware.protect);

router.route('/')
  .get(achievementController.getMyAchievements)
  .post(achievementController.createAchievement);

router.route('/:id')
  .get(achievementController.getAchievement);

router.get('/category/:category', achievementController.getAchievementsByCategory);

module.exports = router;