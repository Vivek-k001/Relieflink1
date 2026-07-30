const SosRequest = require('../models/SosRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Task = require('../models/Task');

// @desc  Create SOS request
// @route POST /api/sos
const createSOS = async (req, res) => {
  try {
    const { disasterType, description, priority, location, address, numberOfPeople, medicalEmergency } = req.body;
    if (!location || !location.coordinates) {
      return res.status(400).json({ success: false, message: 'Location is required for SOS' });
    }

    const sos = await SosRequest.create({
      userId: req.user._id,
      userName: req.user.name,
      userPhone: req.user.phone,
      disasterType,
      description,
      priority: priority || 'high',
      location: { type: 'Point', coordinates: location.coordinates },
      address,
      numberOfPeople: numberOfPeople || 1,
      medicalEmergency: medicalEmergency || false,
    });

    // Notify nearby volunteers via socket
    const io = req.app.get('io');
    if (io) {
      io.emit('new_sos', {
        sosId: sos._id,
        priority: sos.priority,
        disasterType: sos.disasterType,
        location: sos.location,
        address: sos.address,
        message: `🆘 New ${priority || 'high'} priority SOS near ${address || 'your area'}`,
      });
    }

    res.status(201).json({ success: true, message: 'SOS request sent successfully', sos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get all SOS (admin/volunteer with nearby filter)
// @route GET /api/sos
const getAllSOS = async (req, res) => {
  try {
    const { status, lat, lng, radius = 50, page = 1, limit = 20 } = req.query;
    let query = {};

    if (req.user.role === 'affected') {
      query.userId = req.user._id;
    }
    if (status) query.status = status;

    // Geospatial filter for volunteers
    if (lat && lng && req.user.role === 'volunteer') {
      const radiusInMeters = parseFloat(radius) * 1000;
      query.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: radiusInMeters,
        },
      };
    }

    const sosList = await SosRequest.find(query)
      .populate('userId', 'name phone')
      .populate('assignedVolunteer', 'name phone')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await SosRequest.countDocuments(query);
    res.json({ success: true, total, page: parseInt(page), sosList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get single SOS
// @route GET /api/sos/:id
const getSOSById = async (req, res) => {
  try {
    const sos = await SosRequest.findById(req.params.id)
      .populate('userId', 'name phone location')
      .populate('assignedVolunteer', 'name phone location');
    if (!sos) return res.status(404).json({ success: false, message: 'SOS request not found' });
    res.json({ success: true, sos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Accept SOS (volunteer)
// @route PUT /api/sos/:id/accept
const acceptSOS = async (req, res) => {
  try {
    const sos = await SosRequest.findById(req.params.id);
    if (!sos) return res.status(404).json({ success: false, message: 'SOS not found' });
    if (sos.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'SOS is already assigned' });
    }

    sos.assignedVolunteer = req.user._id;
    sos.status = 'assigned';
    sos.assignedAt = new Date();
    await sos.save();

    // Create a task for the volunteer
    await Task.create({
      volunteerId: req.user._id,
      type: 'rescue',
      relatedSos: sos._id,
      status: 'assigned',
      priority: sos.priority,
      destination: sos.location,
      destinationAddress: sos.address,
      description: `Rescue: ${sos.disasterType} - ${sos.description}`,
    });

    // Notify the affected person
    await Notification.create({
      userId: sos.userId,
      title: 'Help is on the way!',
      message: `A volunteer has accepted your SOS request and is on their way.`,
      type: 'sos',
      relatedId: sos._id,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(sos.userId.toString()).emit('sos_accepted', { sosId: sos._id });
    }

    res.json({ success: true, message: 'SOS accepted', sos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update SOS status
// @route PUT /api/sos/:id/status
const updateSOSStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const sos = await SosRequest.findByIdAndUpdate(
      req.params.id,
      { status, notes, ...(status === 'resolved' && { resolvedAt: new Date() }) },
      { new: true }
    );
    if (!sos) return res.status(404).json({ success: false, message: 'SOS not found' });

    const io = req.app.get('io');
    if (io) io.emit('sos_updated', { sosId: sos._id, status });

    res.json({ success: true, sos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Delete/Cancel SOS
// @route DELETE /api/sos/:id
const cancelSOS = async (req, res) => {
  try {
    await SosRequest.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
    res.json({ success: true, message: 'SOS cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createSOS, getAllSOS, getSOSById, acceptSOS, updateSOSStatus, cancelSOS };
