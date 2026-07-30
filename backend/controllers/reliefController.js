const ReliefRequest = require('../models/ReliefRequest');
const Notification = require('../models/Notification');
const Task = require('../models/Task');

// @desc  Create relief request
// @route POST /api/relief
const createReliefRequest = async (req, res) => {
  try {
    const { items, location, address, notes, disasterType, numberOfPeople, priority } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one item is required' });
    }

    const relief = await ReliefRequest.create({
      userId: req.user._id,
      userName: req.user.name,
      userPhone: req.user.phone,
      items,
      location: { type: 'Point', coordinates: location.coordinates },
      address,
      notes,
      disasterType,
      numberOfPeople: numberOfPeople || 1,
      priority: priority || 'medium',
    });

    const io = req.app.get('io');
    if (io) io.emit('new_relief_request', { reliefId: relief._id, priority: relief.priority, address });

    res.status(201).json({ success: true, message: 'Relief request submitted', relief });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get relief requests
// @route GET /api/relief
const getReliefRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = {};
    if (req.user.role === 'affected') query.userId = req.user._id;
    if (status) query.status = status;

    const list = await ReliefRequest.find(query)
      .populate('userId', 'name phone')
      .populate('approvedByNGO', 'name organizationName')
      .populate('assignedVolunteer', 'name phone')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await ReliefRequest.countDocuments(query);
    res.json({ success: true, total, list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get single relief request
// @route GET /api/relief/:id
const getReliefById = async (req, res) => {
  try {
    const relief = await ReliefRequest.findById(req.params.id)
      .populate('userId', 'name phone location')
      .populate('approvedByNGO', 'name organizationName')
      .populate('assignedVolunteer', 'name phone');
    if (!relief) return res.status(404).json({ success: false, message: 'Relief request not found' });
    res.json({ success: true, relief });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Approve relief request (NGO)
// @route PUT /api/relief/:id/approve
const approveRelief = async (req, res) => {
  try {
    const relief = await ReliefRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', approvedByNGO: req.user._id, approvedAt: new Date() },
      { new: true }
    );
    if (!relief) return res.status(404).json({ success: false, message: 'Relief request not found' });

    await Notification.create({
      userId: relief.userId,
      title: 'Relief Request Approved',
      message: 'Your relief request has been approved and will be fulfilled soon.',
      type: 'relief',
      relatedId: relief._id,
    });

    const io = req.app.get('io');
    if (io) io.to(relief.userId.toString()).emit('relief_approved', { reliefId: relief._id });

    res.json({ success: true, message: 'Relief request approved', relief });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Assign volunteer to relief delivery
// @route PUT /api/relief/:id/assign
const assignVolunteer = async (req, res) => {
  try {
    const { volunteerId } = req.body;
    const relief = await ReliefRequest.findByIdAndUpdate(
      req.params.id,
      { assignedVolunteer: volunteerId, status: 'assigned' },
      { new: true }
    ).populate('userId', 'name');

    await Task.create({
      volunteerId,
      type: 'delivery',
      relatedRelief: relief._id,
      status: 'assigned',
      priority: relief.priority,
      destination: relief.location,
      destinationAddress: relief.address,
      description: `Deliver relief items to ${relief.userName}`,
    });

    res.json({ success: true, message: 'Volunteer assigned', relief });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update status
// @route PUT /api/relief/:id/status
const updateReliefStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const relief = await ReliefRequest.findByIdAndUpdate(
      req.params.id,
      { status, ...(status === 'delivered' && { deliveredAt: new Date() }) },
      { new: true }
    );
    const io = req.app.get('io');
    if (io) io.emit('relief_updated', { reliefId: relief._id, status });
    res.json({ success: true, relief });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createReliefRequest, getReliefRequests, getReliefById, approveRelief, assignVolunteer, updateReliefStatus };
