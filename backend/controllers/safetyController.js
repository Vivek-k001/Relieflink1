const SafetyStatus = require('../models/SafetyStatus');

// Seed default safety broadcasts if DB has 0 items
const DEFAULT_SAFETY_BROADCASTS = [
  {
    name: 'Rahul Sharma',
    phone: '+91 9876543210',
    location: { type: 'Point', coordinates: [76.2673, 9.9312] }, // Kochi, Kerala
    isSafe: true,
    updates: [
      { text: 'Moved to a tree, moved to here because water rised on house', timestamp: new Date(Date.now() - 1000 * 60 * 15) },
      { text: 'I am currently at the top of our house', timestamp: new Date(Date.now() - 1000 * 60 * 120) }
    ]
  },
  {
    name: 'Ananya Nair',
    phone: '+91 9898989898',
    location: { type: 'Point', coordinates: [75.7804, 11.2588] }, // Wayanad
    isSafe: true,
    updates: [
      { text: 'Reached St. Joseph Relief Camp, food and medical aid available here', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
      { text: 'Evacuated from flood area with family', timestamp: new Date(Date.now() - 1000 * 60 * 240) }
    ]
  },
  {
    name: 'Vikram Patel',
    phone: '+91 9712345678',
    location: { type: 'Point', coordinates: [72.8777, 19.0760] }, // Mumbai
    isSafe: true,
    updates: [
      { text: 'Sheltered safely at Dadar Community Hall', timestamp: new Date(Date.now() - 1000 * 60 * 45) }
    ]
  }
];

exports.getSafetyStatuses = async (req, res) => {
  try {
    let list = await SafetyStatus.find().sort({ updatedAt: -1 });
    
    // Auto-seed if 0 broadcasts exist
    if (list.length === 0) {
      await SafetyStatus.insertMany(DEFAULT_SAFETY_BROADCASTS);
      list = await SafetyStatus.find().sort({ updatedAt: -1 });
    }

    res.json({ success: true, count: list.length, broadcasts: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.postSafetyStatus = async (req, res) => {
  try {
    const { name, phone, lng, lat, text } = req.body;

    if (!name || !text || !lat || !lng) {
      return res.status(400).json({ success: false, message: 'Name, location, and status text are required' });
    }

    // Check if broadcast exists for this phone or name
    let existing = await SafetyStatus.findOne({
      $or: [
        { phone: phone ? phone.trim() : 'N/A' },
        { name: name.trim() }
      ]
    });

    if (existing) {
      // Prepend new update to top of updates timeline
      existing.updates.unshift({ text, timestamp: new Date() });
      existing.location = { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] };
      existing.updatedAt = new Date();
      await existing.save();
      return res.json({ success: true, message: 'Safety status updated!', broadcast: existing });
    }

    // Create new broadcast
    const newBroadcast = await SafetyStatus.create({
      user: req.user?._id || null,
      name,
      phone: phone || 'N/A',
      location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
      updates: [{ text, timestamp: new Date() }],
      isSafe: true
    });

    res.status(201).json({ success: true, message: 'Safety broadcast posted!', broadcast: newBroadcast });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
