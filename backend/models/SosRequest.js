const mongoose = require('mongoose');

const sosSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String },
    userPhone: { type: String },
    disasterType: {
      type: String,
      enum: ['flood', 'earthquake', 'cyclone', 'landslide', 'fire', 'heatwave', 'other'],
      required: true,
    },
    description: { type: String },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'high' },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'in_progress', 'resolved', 'cancelled'],
      default: 'pending',
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    address: { type: String },
    numberOfPeople: { type: Number, default: 1 },
    medicalEmergency: { type: Boolean, default: false },
    assignedVolunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedAt: { type: Date },
    resolvedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

sosSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('SosRequest', sosSchema);
