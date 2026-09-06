const express = require('express');
const router = express.Router();
const { addDonation, getDonations, receiveDonation, makeDonation } = require('../controllers/donationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/make', makeDonation); // Public endpoint for making donations
router.post('/', protect, authorize('ngo', 'admin'), addDonation);
router.get('/', protect, authorize('ngo', 'admin'), getDonations);
router.put('/:id/receive', protect, authorize('ngo', 'admin'), receiveDonation);

module.exports = router;
