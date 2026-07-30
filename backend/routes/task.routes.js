const express = require('express');
const router = express.Router();
const { getMyTasks, getNearbyTasks, updateTaskStatus, getTaskById } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getMyTasks);
router.get('/nearby', authorize('volunteer'), getNearbyTasks);
router.get('/:id', getTaskById);
router.put('/:id/status', authorize('volunteer'), updateTaskStatus);

module.exports = router;
