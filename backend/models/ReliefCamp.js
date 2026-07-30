const mongoose = require('mongoose');

const reliefCampSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    managedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    address: { type: String, required: true },
    district: { type: String },
    state: { type: String },
    capacity: { type: Number, default: 100 },
    currentOccupancy: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'full', 'closed', 'preparation'],
      default: 'active',
    },
    facilities: [{ type: String }], // e.g., ['medical', 'food', 'water', 'shelter']
    contactPhone: { type: String },
    contactEmail: { type: String },
    disasterTypes: [{ type: String }],
    image: { type: String },
    volunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    acceptingRefugees: { type: Boolean, default: true },
  },
  { timestamps: true }
);

reliefCampSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('ReliefCamp', reliefCampSchema);
