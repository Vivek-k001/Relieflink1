const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    campId: { type: mongoose.Schema.Types.ObjectId, ref: 'ReliefCamp', required: true },
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    itemName: { type: String, required: true },
    category: {
      type: String,
      enum: ['food', 'water', 'medicine', 'clothing', 'sanitary', 'baby_care', 'blanket', 'hygiene', 'equipment', 'other'],
      required: true,
    },
    quantity: { type: Number, required: true, default: 0 },
    unit: { type: String, default: 'units' },
    minStockLevel: { type: Number, default: 10 },
    lastUpdated: { type: Date, default: Date.now },
    expiryDate: { type: Date },
    donor: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inventory', inventorySchema);
