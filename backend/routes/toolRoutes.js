const express = require('express');
const router = express.Router();
const toolController = require('../controllers/toolController');
const authMiddleware = require('../middleware/authMiddleware');

// Bảo vệ tất cả các routes với middleware xác thực
router.use(authMiddleware.protect);

// Routes cho Pomodoro Timer
router.get('/pomodoro', toolController.getPomodoroSettings);
router.patch('/pomodoro', toolController.updatePomodoroSettings);
router.post('/pomodoro/increment', toolController.incrementPomodoroSessions);

// Routes cho Quick Checklist
router.get('/checklist', toolController.getChecklist);
router.patch('/checklist', toolController.updateChecklist);

// Routes cho Quick Notes
router.get('/notes', toolController.getNotes);
router.post('/notes', toolController.createNote);
router.patch('/notes/:id', toolController.updateNote);
router.delete('/notes/:id', toolController.deleteNote);

module.exports = router;