const mongoose = require('mongoose');

/**
 * CampAssignment — audit trail for every user → relief camp assignment.
 * Who: which volunteer assigned which affected user to which camp.
 * Linked to: SOS request that triggered the rescue.
 */
const campAssignmentSchema = new mongoose.Schema(
  {
    // The affected person being assigned to the camp
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String },
    userPhone: { type: String },

    // The volunteer who performed the assignment
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedByName: { type: String },

    // The camp they're being assigned to
    campId: { type: mongoose.Schema.Types.ObjectId, ref: 'ReliefCamp', required: true },
    campName: { type: String },

    // Number of people assigned in this group/SOS
    numberOfPeople: { type: Number, default: 1 },

    // The SOS request that led to this assignment (optional but useful for tracing)
    relatedSos: { type: mongoose.Schema.Types.ObjectId, ref: 'SosRequest' },

    // Status tracking
    status: {
      type: String,
      enum: ['assigned', 'arrived', 'checked_out', 'transferred'],
      default: 'assigned',
    },

    assignedAt: { type: Date, default: Date.now },
    arrivedAt: { type: Date },
    checkedOutAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CampAssignment', campAssignmentSchema);
