const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, sparse: true, lowercase: true, trim: true },
    phone: { type: String, sparse: true, trim: true },
    password: { type: String, select: false },
    role: {
      type: String,
      enum: ['affected', 'volunteer', 'ngo', 'admin'],
      required: true,
    },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    profileImage: { type: String },

    // Location
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    address: { type: String },
    district: { type: String },
    state: { type: String },

    // Volunteer specific
    skills: [{ type: String }],
    vehicleType: { type: String },
    isAvailable: { type: Boolean, default: true },
    tasksCompleted: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },

    // NGO specific
    organizationName: { type: String },
    registrationNumber: { type: String },
    website: { type: String },

    // OTP
    otp: { type: String },
    otpExpires: { type: Date },

    // Push notification subscription
    pushSubscription: { type: Object },

    isSafe: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.index({ location: '2dsphere' });

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
