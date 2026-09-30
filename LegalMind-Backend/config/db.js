const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas using Mongoose.
 * MONGO_URI must be set as an environment variable (MongoDB Atlas URI).
 * Falls back to local only in development.
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('[MongoDB] FATAL: MONGO_URI environment variable is not set!');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[MongoDB] Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Connection Failed: ${error.message}`);
    console.error('[MongoDB] Ensure MONGO_URI is a valid MongoDB Atlas connection string.');
    process.exit(1);
  }
};

module.exports = connectDB;

