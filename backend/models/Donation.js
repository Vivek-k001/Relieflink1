const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    donorName: { type: String, required: true },
    donorPhone: { type: String },
    donorEmail: { type: String },
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    campId: { type: mongoose.Schema.Types.ObjectId, ref: 'ReliefCamp' },
    type: { type: String, enum: ['monetary', 'goods', 'both'], required: true },
    amount: { type: Number }, // for monetary
    items: [
      {
        name: { type: String },
        quantity: { type: Number },
        unit: { type: String },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'received', 'acknowledged'],
      default: 'pending',
    },
    notes: { type: String },
    receivedAt: { type: Date },
    receiptNumber: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Donation', donationSchema);
