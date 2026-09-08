const Donation = require('../models/Donation');
const Inventory = require('../models/Inventory');

// @desc  Add donation
// @route POST /api/donations
const addDonation = async (req, res) => {
  try {
    const { donorName, donorPhone, donorEmail, campId, type, amount, items, notes, paymentMethod } = req.body;
    const isMonetary = type === 'monetary';
    const donation = await Donation.create({
      donorName, donorPhone, donorEmail,
      ngoId: req.user._id,
      campId, type, amount, items, notes,
      status: isMonetary ? 'received' : 'pending',
      paymentMethod: isMonetary ? (paymentMethod || 'cash') : undefined,
      receivedAt: isMonetary ? new Date() : undefined,
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
    // Auto-heal: Digital payments (UPI/Card) are directly settled bank credits, mark any legacy pending as received
    await Donation.updateMany(
      { type: 'monetary', status: 'pending' },
      { status: 'received', receivedAt: new Date() }
    );

    // Auto-heal: Ensure legacy monetary donations have a default paymentMethod
    await Donation.updateMany(
      { type: 'monetary', paymentMethod: { $exists: false } },
      { paymentMethod: 'upi' }
    );

    const query = req.user.role === 'admin' ? {} : { ngoId: req.user._id };
    const donations = await Donation.find(query)
      .populate('campId', 'name location')
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

    // Automation: Automatically add donated goods to the camp's inventory
    if (donation && (donation.type === 'goods' || donation.type === 'both') && donation.campId && donation.items && donation.items.length > 0) {
      for (const item of donation.items) {
        if (!item.name) continue;
        const existingItem = await Inventory.findOne({ 
          campId: donation.campId, 
          itemName: { $regex: new RegExp(`^${item.name}$`, 'i') } 
        });

        if (existingItem) {
          existingItem.quantity += (item.quantity || 1);
          existingItem.lastUpdated = new Date();
          await existingItem.save();
        } else {
          await Inventory.create({
            campId: donation.campId,
            ngoId: donation.ngoId,
            itemName: item.name,
            category: 'other',
            quantity: item.quantity || 1,
            unit: item.unit || 'units',
            donor: donation.donorName
          });
        }
      }
    }

    res.json({ success: true, donation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  User makes a donation
// @route POST /api/donations/make
const makeDonation = async (req, res) => {
  try {
    const { ngoId, campId, type, amount, items, notes, donorName, donorPhone, donorEmail, paymentMethod } = req.body;
    
    // Validate required fields
    if (!ngoId) {
      return res.status(400).json({ success: false, message: 'NGO ID is required' });
    }

    // Digital monetary donations through payment gateway are directly settled bank transactions
    const isMonetary = type === 'monetary';

    const donation = await Donation.create({
      donorName: donorName || (req.user ? req.user.name : 'Anonymous User'),
      donorPhone: donorPhone || (req.user ? req.user.phone : undefined),
      donorEmail: donorEmail || (req.user ? req.user.email : undefined),
      donorId: req.user ? req.user._id : undefined,
      ngoId,
      campId,
      type,
      amount,
      items,
      notes,
      status: isMonetary ? 'received' : 'pending',
      paymentMethod: isMonetary ? (paymentMethod || 'upi') : undefined,
      receivedAt: isMonetary ? new Date() : undefined,
      receiptNumber: `RL-${Date.now()}`,
    });
    res.status(201).json({ success: true, donation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addDonation, getDonations, receiveDonation, makeDonation };
