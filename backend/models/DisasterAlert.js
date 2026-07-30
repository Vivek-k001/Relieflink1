const mongoose = require('mongoose');

const disasterAlertSchema = new mongoose.Schema(
  {
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    disasterType: {
      type: String,
      enum: ['flood', 'earthquake', 'cyclone', 'landslide', 'fire', 'heatwave', 'tsunami', 'drought', 'other'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical', 'emergency'],
      default: 'warning',
    },
    affectedAreas: [{ type: String }],
    broadcastZone: {
      type: {
        type: String,
        enum: ['Point', 'Polygon'],
        default: 'Point',
      },
      coordinates: { type: mongoose.Schema.Types.Mixed },
    },
    radius: { type: Number }, // in km, used with Point zone
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date },
    source: { type: String, default: 'admin' }, // 'admin', 'ngo', 'government'
    actionRequired: { type: String },
    evacuationRoute: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DisasterAlert', disasterAlertSchema);
