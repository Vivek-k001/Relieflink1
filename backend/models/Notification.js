const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['sos', 'relief', 'task', 'alert', 'system', 'donation', 'inventory'],
      default: 'system',
    },
    isRead: { type: Boolean, default: false },
    link: { type: String }, // frontend route to navigate to
    relatedId: { type: mongoose.Schema.Types.ObjectId }, // related doc ID
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
