const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const seed = async () => {
  try {
    await connectDB();
    
    // Remove the old one just to keep it clean
    await User.deleteMany({ email: 'admin@gmail.com' });
    
    let ngoAdmin = await User.findOne({ email: 'ngo@gmail.com' });
    if (!ngoAdmin) {
      ngoAdmin = new User({
        name: 'NGO Admin',
        email: 'ngo@gmail.com',
        password: 'ngo@123',
        role: 'ngo',
        organizationName: 'ReliefLink NGO',
        registrationNumber: 'NGO-12345',
        isVerified: true,
        isActive: true,
      });
      await ngoAdmin.save();
    } else {
      ngoAdmin.password = 'ngo@123';
      await ngoAdmin.save();
    }
    
    console.log('✅ NGO seeded with ngo@gmail.com / ngo@123');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
seed();
