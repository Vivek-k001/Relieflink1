const express = require('express');
const router = express.Router();
const { createSOS, getAllSOS, getSOSById, acceptSOS, updateSOSStatus, cancelSOS } = require('../controllers/sosController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.post('/', authorize('affected', 'admin'), createSOS);
router.get('/', getAllSOS);
router.get('/:id', getSOSById);
router.put('/:id/accept', authorize('volunteer'), acceptSOS);
router.put('/:id/status', authorize('volunteer', 'admin'), updateSOSStatus);
router.delete('/:id', authorize('affected', 'admin'), cancelSOS);

module.exports = router;
