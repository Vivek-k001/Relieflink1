const express = require('express');
const router = express.Router();
const { createAlert, getAlerts, getAlertById, deactivateAlert } = require('../controllers/alertController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAlerts); // Public - no auth needed for viewing alerts
router.get('/:id', getAlertById);
router.post('/', protect, authorize('admin', 'ngo'), createAlert);
router.put('/:id/deactivate', protect, authorize('admin'), deactivateAlert);

module.exports = router;
