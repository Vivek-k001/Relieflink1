const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, toggleUserStatus, deleteUser, getReports } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/reports', getReports);

module.exports = router;
