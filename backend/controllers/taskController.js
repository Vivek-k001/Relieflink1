const Task = require('../models/Task');
const User = require('../models/User');
const SosRequest = require('../models/SosRequest');
const ReliefRequest = require('../models/ReliefRequest');

// @desc  Get volunteer's tasks
// @route GET /api/tasks
const getMyTasks = async (req, res) => {
  try {
    const { status } = req.query;
    let query = { volunteerId: req.user._id };
    if (status) query.status = status;

    const tasks = await Task.find(query)
      .populate('relatedSos')
      .populate('relatedRelief')
      .sort({ createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get available tasks near volunteer
// @route GET /api/tasks/nearby
const getNearbyTasks = async (req, res) => {
  try {
    const { lat, lng, radius = 30, type } = req.query;
    let geoQuery = {};

    if (lat && lng) {
      geoQuery = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(radius) * 1000,
        },
      };
    }

    const sosPending = await SosRequest.find({
      status: 'pending',
      ...(lat && lng && { location: geoQuery }),
    }).populate('userId', 'name phone');

    const reliefPending = await ReliefRequest.find({
      status: 'approved',
      ...(lat && lng && { location: geoQuery }),
    }).populate('userId', 'name phone');

    res.json({
      success: true,
      nearbyTasks: {
        sos: sosPending,
        relief: reliefPending,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update task status
// @route PUT /api/tasks/:id/status
const updateTaskStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const task = await Task.findOne({ _id: req.params.id, volunteerId: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    task.status = status;
    if (notes) task.notes = notes;
    if (status === 'accepted') task.acceptedAt = new Date();
    if (status === 'in_progress') task.startedAt = new Date();
    if (status === 'completed') {
      task.completedAt = new Date();
      // Increment volunteer tasks completed
      await User.findByIdAndUpdate(req.user._id, { $inc: { tasksCompleted: 1 } });
      // Update related request
      if (task.relatedSos) await SosRequest.findByIdAndUpdate(task.relatedSos, { status: 'resolved' });
      if (task.relatedRelief) await ReliefRequest.findByIdAndUpdate(task.relatedRelief, { status: 'delivered', deliveredAt: new Date() });
    }
    await task.save();

    const io = req.app.get('io');
    if (io) io.emit('task_updated', { taskId: task._id, status });

    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get single task
// @route GET /api/tasks/:id
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('relatedSos')
      .populate('relatedRelief')
      .populate('volunteerId', 'name phone');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMyTasks, getNearbyTasks, updateTaskStatus, getTaskById };
