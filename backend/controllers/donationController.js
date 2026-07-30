const Donation = require('../models/Donation');

// @desc  Add donation
// @route POST /api/donations
const addDonation = async (req, res) => {
  try {
    const { donorName, donorPhone, donorEmail, campId, type, amount, items, notes } = req.body;
    const donation = await Donation.create({
      donorName, donorPhone, donorEmail,
      ngoId: req.user._id,
      campId, type, amount, items, notes,
      receiptNumber: `RL-${Date.now()}`,
    });
    res.status(201).json({ success: true, donation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get NGO donations
// @route GET /api/donations
const getDonations = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { ngoId: req.user._id };
    const donations = await Donation.find(query)
      .populate('campId', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, donations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Acknowledge/receive donation
// @route PUT /api/donations/:id/receive
const receiveDonation = async (req, res) => {
  try {
    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { status: 'received', receivedAt: new Date() },
      { new: true }
    );
    res.json({ success: true, donation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addDonation, getDonations, receiveDonation };
