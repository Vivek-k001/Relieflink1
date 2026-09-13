const mongoose = require('mongoose');

const connectDB = async (retries = 5, delay = 3000) => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/relieflink';
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
      });
      console.log('✅ MongoDB Connected successfully');
      return;
    } catch (error) {
      console.warn(`⚠️ MongoDB Connection Attempt ${attempt}/${retries} Failed: ${error.message}`);
      if (attempt < retries) {
        console.log(`🔄 Retrying in ${delay / 1000}s...`);
        await new Promise((res) => setTimeout(res, delay));
      } else {
        console.error('❌ Could not connect to MongoDB Atlas after multiple attempts.');
        console.error('💡 Tip: Check your internet connection or MongoDB Atlas IP whitelist.');
      }
    }
  }
};

module.exports = connectDB;