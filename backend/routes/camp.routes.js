const express = require('express');
const router = express.Router();
const { createCamp, getCamps, getCampById, updateCamp, deleteCamp, updateOccupancy } = require('../controllers/campController');
const { getAvailableCamps, assignUserToCamp, getCampAssignments, getAllMyAssignments, updateAssignmentStatus } = require('../controllers/campAssignmentController');
const { protect, authorize } = require('../middleware/auth');

// --- Camp CRUD ---
router.get('/', getCamps);
router.post('/', protect, authorize('ngo', 'admin'), createCamp);
router.put('/:id', protect, authorize('ngo', 'admin'), updateCamp);
router.put('/:id/occupancy', protect, authorize('ngo', 'admin'), updateOccupancy);
router.delete('/:id', protect, authorize('ngo', 'admin'), deleteCamp);

// --- Camp Assignment (Volunteer assigns user to camp) ---
// Must be BEFORE /:id to avoid "available" being treated as an ID
router.get('/available', protect, authorize('volunteer', 'admin'), getAvailableCamps);
router.get('/assignments/my', protect, authorize('ngo', 'admin'), getAllMyAssignments);
router.put('/assignments/:assignmentId/status', protect, authorize('ngo', 'admin', 'volunteer'), updateAssignmentStatus);
router.post('/:campId/assign', protect, authorize('volunteer', 'admin'), assignUserToCamp);
router.get('/:campId/assignments', protect, authorize('ngo', 'admin'), getCampAssignments);

// --- Must be last (catches /:id) ---
router.get('/:id', getCampById);

module.exports = router;
