const express = require('express');
const questController = require('../controllers/questController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Tất cả các route quest đều yêu cầu xác thực
router.use(authMiddleware.protect);

router.route('/')
  .get(questController.getMyQuests)
  .post(questController.createQuest);

router.route('/:id')
  .get(questController.getQuest)
  .patch(questController.updateQuest)
  .delete(questController.deleteQuest);

router.patch('/:id/progress', questController.updateQuestProgress);
router.patch('/:id/complete', questController.completeQuest);

module.exports = router;