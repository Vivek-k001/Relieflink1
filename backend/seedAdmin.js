const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const email = 'admin@gmail.com'; // Using 'admin@gmail.com' as email
    const password = 'admin@123';

    let admin = await User.findOne({ email });
    if (!admin) {
      admin = new User({
        name: 'Super Admin',
        email,
        password,
        role: 'admin',
        isVerified: true,
        isActive: true,
      });
      await admin.save();
      console.log('✅ Admin user created successfully:');
      console.log(`Username/Email: ${email}`);
      console.log(`Password: ${password}`);
    } else {
      admin.password = password;
      await admin.save();
      console.log('✅ Admin user updated successfully:');
      console.log(`Username/Email: ${email}`);
      console.log(`Password: ${password}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
