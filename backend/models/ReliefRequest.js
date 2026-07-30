const mongoose = require('mongoose');

const reliefItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['food', 'water', 'medicine', 'clothing', 'sanitary', 'baby_care', 'blanket', 'hygiene', 'other'],
  },
  quantity: { type: Number, default: 1 },
  unit: { type: String, default: 'units' },
  fulfilled: { type: Boolean, default: false },
  fulfilledQuantity: { type: Number, default: 0 },
});

const reliefRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String },
    userPhone: { type: String },
    items: [reliefItemSchema],
    status: {
      type: String,
      enum: ['pending', 'approved', 'assigned', 'in_delivery', 'delivered', 'cancelled'],
      default: 'pending',
    },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    address: { type: String },
    notes: { type: String },
    approvedByNGO: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    assignedVolunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deliveredAt: { type: Date },
    disasterType: { type: String },
    numberOfPeople: { type: Number, default: 1 },
  },
  { timestamps: true }
);

reliefRequestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('ReliefRequest', reliefRequestSchema);
