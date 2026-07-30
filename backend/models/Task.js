const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['rescue', 'delivery', 'medical', 'evacuation', 'other'], required: true },
    relatedSos: { type: mongoose.Schema.Types.ObjectId, ref: 'SosRequest' },
    relatedRelief: { type: mongoose.Schema.Types.ObjectId, ref: 'ReliefRequest' },
    status: {
      type: String,
      enum: ['assigned', 'accepted', 'in_progress', 'completed', 'cancelled'],
      default: 'assigned',
    },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    description: { type: String },
    startLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] },
    },
    destination: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] },
    },
    destinationAddress: { type: String },
    acceptedAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
    notes: { type: String },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

taskSchema.index({ startLocation: '2dsphere' });
taskSchema.index({ destination: '2dsphere' });

module.exports = mongoose.model('Task', taskSchema);
