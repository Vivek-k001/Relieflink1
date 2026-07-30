const express = require('express');
const router = express.Router();
const { createReliefRequest, getReliefRequests, getReliefById, approveRelief, assignVolunteer, updateReliefStatus } = require('../controllers/reliefController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.post('/', authorize('affected', 'admin'), createReliefRequest);
router.get('/', getReliefRequests);
router.get('/:id', getReliefById);
router.put('/:id/approve', authorize('ngo', 'admin'), approveRelief);
router.put('/:id/assign', authorize('ngo', 'admin'), assignVolunteer);
router.put('/:id/status', authorize('volunteer', 'ngo', 'admin'), updateReliefStatus);

module.exports = router;
