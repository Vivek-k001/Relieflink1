const mongoose = require('mongoose');

const missingPersonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  age: {
    type: Number,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Unknown'],
    default: 'Unknown',
  },
  photoUrl: {
    type: String,
    default: '',
  },
  lastSeenLocation: {
    type: String,
    required: [true, 'Last seen location is required'],
  },
  lastSeenDate: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
    default: '',
  },
  contactName: {
    type: String,
    required: [true, 'Contact person name is required'],
  },
  contactPhone: {
    type: String,
    required: [true, 'Contact phone number is required'],
  },
  status: {
    type: String,
    enum: ['missing', 'found', 'reunited'],
    default: 'missing',
  },
  campId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReliefCamp',
    default: null,
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('MissingPerson', missingPersonSchema);
