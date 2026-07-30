const User = require('../models/User');
const SosRequest = require('../models/SosRequest');
const ReliefRequest = require('../models/ReliefRequest');
const ReliefCamp = require('../models/ReliefCamp');
const DisasterAlert = require('../models/DisasterAlert');
const Task = require('../models/Task');
const Donation = require('../models/Donation');

// @desc  Get system-wide dashboard stats
// @route GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  try {
    const [users, sosPending, sosTotal, reliefPending, reliefTotal, camps, activeAlerts, tasksCompleted, donations] =
      await Promise.all([
        User.countDocuments({ isActive: true }),
        SosRequest.countDocuments({ status: 'pending' }),
        SosRequest.countDocuments(),
        ReliefRequest.countDocuments({ status: 'pending' }),
        ReliefRequest.countDocuments(),
        ReliefCamp.countDocuments({ status: 'active' }),
        DisasterAlert.countDocuments({ isActive: true }),
        Task.countDocuments({ status: 'completed' }),
        Donation.countDocuments({ status: 'received' }),
      ]);

    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    const recentSOS = await SosRequest.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name phone');

    res.json({
      success: true,
      stats: {
        users, sosPending, sosTotal, reliefPending, reliefTotal,
        camps, activeAlerts, tasksCompleted, donations,
        usersByRole,
      },
      recentSOS,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get all users
// @route GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    let query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    const total = await User.countDocuments(query);
    res.json({ success: true, total, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Toggle user active status
// @route PUT /api/admin/users/:id/toggle
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, isActive: user.isActive, message: `User ${user.isActive ? 'activated' : 'deactivated'}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Delete user
// @route DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get system report data
// @route GET /api/admin/reports
const getReports = async (req, res) => {
  try {
    const { from, to } = req.query;
    const dateFilter = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to) dateFilter.$lte = new Date(to);

    const sosByType = await SosRequest.aggregate([
      ...(from || to ? [{ $match: { createdAt: dateFilter } }] : []),
      { $group: { _id: '$disasterType', count: { $sum: 1 } } },
    ]);

    const reliefByStatus = await ReliefRequest.aggregate([
      ...(from || to ? [{ $match: { createdAt: dateFilter } }] : []),
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const campStats = await ReliefCamp.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, totalCapacity: { $sum: '$capacity' }, totalOccupancy: { $sum: '$currentOccupancy' } } },
    ]);

    res.json({ success: true, reports: { sosByType, reliefByStatus, campStats } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardStats, getAllUsers, toggleUserStatus, deleteUser, getReports };
