const mongoose = require('mongoose');

const connectDB = async (retries = 3, delay = 2500) => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/relieflink';
  const fallbackLocalUri = 'mongodb://127.0.0.1:27017/relieflink';
  
  // 1. Try Primary URI (MongoDB Atlas or env URI)
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 6000,
      });
      console.log('✅ MongoDB Connected successfully');
      return;
    } catch (error) {
      console.warn(`⚠️ MongoDB Connection Attempt ${attempt}/${retries} (${error.message})`);
      if (attempt < retries) {
        console.log(`🔄 Retrying database connection in ${delay / 1000}s...`);
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }

  // 2. If Primary is Atlas and failed, try local MongoDB fallback
  if (primaryUri !== fallbackLocalUri) {
    console.log('🔄 Attempting connection to local MongoDB fallback (127.0.0.1:27017)...');
    try {
      await mongoose.connect(fallbackLocalUri, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log('✅ Connected to local MongoDB fallback successfully');
      return;
    } catch (localErr) {
      console.warn('⚠️ Local MongoDB not running.');
    }
  }

  // 3. Graceful warning (server stays alive, no nodemon crash)
  console.error('❌ Could not connect to MongoDB.');
  console.error('💡 Tip: Check your internet connection or ensure your IP address is whitelisted in MongoDB Atlas (Network Access -> Add IP Address -> Allow Access From Anywhere 0.0.0.0/0).');
};

module.exports = connectDB;