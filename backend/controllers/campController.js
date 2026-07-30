const ReliefCamp = require('../models/ReliefCamp');
const Inventory = require('../models/Inventory');

// @desc  Create relief camp
// @route POST /api/camps
const createCamp = async (req, res) => {
  try {
    const { name, description, location, address, district, state, capacity, facilities, contactPhone, contactEmail, disasterTypes } = req.body;
    const camp = await ReliefCamp.create({
      name, description,
      managedBy: req.user._id,
      location: { type: 'Point', coordinates: location.coordinates },
      address, district, state, capacity,
      facilities: facilities || [],
      contactPhone, contactEmail,
      disasterTypes: disasterTypes || [],
    });
    res.status(201).json({ success: true, camp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get all/nearby camps
// @route GET /api/camps
const getCamps = async (req, res) => {
  try {
    const { lat, lng, radius = 100, status } = req.query;
    let query = {};
    if (status) query.status = status;

    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(radius) * 1000,
        },
      };
    }

    // NGO only sees their own camps
    if (req.user.role === 'ngo') query.managedBy = req.user._id;

    const camps = await ReliefCamp.find(query).populate('managedBy', 'name organizationName phone');
    res.json({ success: true, camps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get single camp
// @route GET /api/camps/:id
const getCampById = async (req, res) => {
  try {
    const camp = await ReliefCamp.findById(req.params.id)
      .populate('managedBy', 'name organizationName phone email')
      .populate('volunteers', 'name phone skills');
    if (!camp) return res.status(404).json({ success: false, message: 'Camp not found' });
    const inventory = await Inventory.find({ campId: req.params.id });
    res.json({ success: true, camp, inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update camp
// @route PUT /api/camps/:id
const updateCamp = async (req, res) => {
  try {
    const camp = await ReliefCamp.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!camp) return res.status(404).json({ success: false, message: 'Camp not found' });
    res.json({ success: true, camp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Delete camp
// @route DELETE /api/camps/:id
const deleteCamp = async (req, res) => {
  try {
    await ReliefCamp.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Camp deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update occupancy
// @route PUT /api/camps/:id/occupancy
const updateOccupancy = async (req, res) => {
  try {
    const { currentOccupancy } = req.body;
    const camp = await ReliefCamp.findById(req.params.id);
    if (!camp) return res.status(404).json({ success: false, message: 'Camp not found' });
    camp.currentOccupancy = currentOccupancy;
    if (currentOccupancy >= camp.capacity) {
      camp.status = 'full';
      camp.acceptingRefugees = false;
    } else {
      camp.status = 'active';
      camp.acceptingRefugees = true;
    }
    await camp.save();
    res.json({ success: true, camp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createCamp, getCamps, getCampById, updateCamp, deleteCamp, updateOccupancy };
