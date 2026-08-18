const express = require('express');
const router = express.Router();
const safetyController = require('../controllers/safetyController');

router.get('/', safetyController.getSafetyStatuses);
router.post('/', safetyController.postSafetyStatus);
router.delete('/:id', safetyController.deleteSafetyStatus);

module.exports = router;
