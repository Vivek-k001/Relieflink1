const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const cleanup = async () => {
  try {
    await connectDB();
    
    // Remove the admin users I created
    await User.deleteMany({ role: 'admin' });
    console.log('Removed admin users.');

    const email = 'admin@gmail.com';
    const password = 'admin@123';
    
    let ngoAdmin = await User.findOne({ email });
    if (!ngoAdmin) {
      ngoAdmin = new User({
        name: 'NGO Admin',
        email,
        password,
        role: 'ngo',
        organizationName: 'ReliefLink NGO',
        registrationNumber: 'NGO-12345',
        isVerified: true,
        isActive: true,
      });
      await ngoAdmin.save();
    } else {
      ngoAdmin.role = 'ngo';
      ngoAdmin.organizationName = 'ReliefLink NGO';
      ngoAdmin.registrationNumber = 'NGO-12345';
      await ngoAdmin.save();
    }
    
    console.log('✅ Seeded NGO Admin user successfully.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
cleanup();
