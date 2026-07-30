const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

const generateOTP = () => {
  // In production, replace with real SMS via Twilio/MSG91
  // For dev, OTP is always '123456' for easy testing
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc  Send OTP to phone (affected person login)
// @route POST /api/auth/send-otp
const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'Phone number is required' });

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + parseInt(process.env.OTP_EXPIRY_MINUTES || 10) * 60 * 1000);

    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({ name: 'User', phone, role: 'affected', otp, otpExpires, isVerified: false });
    } else {
      user.otp = otp;
      user.otpExpires = otpExpires;
    }
    await user.save();

    // TODO: In production, send OTP via Twilio/MSG91
    // For dev: log OTP to console
    console.log(`📱 OTP for ${phone}: ${otp}`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      // Only expose OTP in development mode
      ...(process.env.NODE_ENV === 'development' && { devOtp: otp }),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Verify OTP
// @route POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
  try {
    const { phone, otp, name } = req.body;
    if (!phone || !otp) return res.status(400).json({ success: false, message: 'Phone and OTP are required' });

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });
    if (user.otpExpires < new Date()) return res.status(400).json({ success: false, message: 'OTP expired' });

    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
    if (name && !user.name) user.name = name;
    await user.save();

    const token = generateToken(user._id);
    res.json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Register volunteer/NGO/Admin
// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, skills, vehicleType, organizationName, registrationNumber } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and role are required' });
    }
    if (!['volunteer', 'ngo', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role for registration' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({
      name, email, password, role, phone,
      skills: role === 'volunteer' ? skills : undefined,
      vehicleType: role === 'volunteer' ? vehicleType : undefined,
      organizationName: role === 'ngo' ? organizationName : undefined,
      registrationNumber: role === 'ngo' ? registrationNumber : undefined,
      isVerified: true,
    });

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Login with email/password
// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!user.isActive) return res.status(401).json({ success: false, message: 'Account is deactivated' });

    const token = generateToken(user._id);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get current user profile
// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// @desc  Update user profile
// @route PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, address, district, state, skills, languages, experience, vehicleType, isAvailable } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, address, district, state, skills, languages, experience, vehicleType, isAvailable },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc  Update I'm Safe status
// @route PUT /api/auth/safe-status
const updateSafeStatus = async (req, res) => {
  try {
    const { isSafe, location } = req.body;
    const update = { isSafe };
    if (location) {
      update.location = { type: 'Point', coordinates: [location.lng, location.lat] };
    }
    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true });
    res.json({ success: true, isSafe: user.isSafe, message: isSafe ? "✅ Marked as Safe" : "Status updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { sendOTP, verifyOTP, register, login, getMe, updateProfile, updateSafeStatus };
