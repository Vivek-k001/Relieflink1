const express = require('express');
const router = express.Router();
const { addDonation, getDonations, receiveDonation } = require('../controllers/donationController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.post('/', authorize('ngo', 'admin'), addDonation);
router.get('/', authorize('ngo', 'admin'), getDonations);
router.put('/:id/receive', authorize('ngo', 'admin'), receiveDonation);

module.exports = router;
