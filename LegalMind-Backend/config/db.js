const mongoose = require('mongoose');

/**
 * Connect to MongoDB instance using Mongoose
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/legalmind';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[MongoDB] Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    if (uri.includes('mongodb+srv')) {
      console.log('[MongoDB] Attempting fallback to local instance...');
      try {
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/legalmind', {
          serverSelectionTimeoutMS: 3000,
        });
        console.log(`[MongoDB] Connected to Local Fallback: ${localConn.connection.host}`);
      } catch (localErr) {
        console.log('[MongoDB] Local fallback unavailable. Database status is disconnected.');
      }
    }
  }
};

module.exports = connectDB;

