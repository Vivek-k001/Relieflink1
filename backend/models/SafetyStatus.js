const mongoose = require('mongoose');

const safetyStatusSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  phone: { type: String },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },
  updates: [
    {
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  isSafe: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

safetyStatusSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('SafetyStatus', safetyStatusSchema);
