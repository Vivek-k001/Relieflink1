const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP, register, login, getMe, updateProfile, updateSafeStatus } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/safe-status', protect, updateSafeStatus);

module.exports = router;
