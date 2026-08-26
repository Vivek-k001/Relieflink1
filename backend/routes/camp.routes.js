const express = require('express');
const router = express.Router();
const { createCamp, getCamps, getCampById, updateCamp, deleteCamp, updateOccupancy } = require('../controllers/campController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getCamps);
router.get('/:id', getCampById);
router.post('/', protect, authorize('ngo', 'admin'), createCamp);
router.put('/:id', protect, authorize('ngo', 'admin'), updateCamp);
router.put('/:id/occupancy', protect, authorize('ngo', 'admin'), updateOccupancy);
router.delete('/:id', protect, authorize('ngo', 'admin'), deleteCamp);

module.exports = router;
