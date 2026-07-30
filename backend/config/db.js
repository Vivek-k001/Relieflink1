const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Try standard connection
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`⚠️ Regular MongoDB connection failed. Falling back to mongodb-memory-server... (${error.message})`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      console.log(`✅ InMemory MongoDB Connected: ${conn.connection.host}`);
    } catch (inMemoryErr) {
      console.error(`❌ In-Memory MongoDB Connection Error: ${inMemoryErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
