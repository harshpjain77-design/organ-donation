const mongoose = require('mongoose');

// In-Memory Fallback Collections for Zero-Config Execution
const memoryStore = {
  users: [],
  donors: [],
  recipients: [],
  organs: [],
  matches: [],
  auditLogs: []
};

async function connectDB() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/organ_donation_db';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`[MongoDB] Connected to database: ${MONGO_URI}`);
    return true;
  } catch (err) {
    console.log(`[MongoDB] Local MongoDB server not running on ${MONGO_URI}. Utilizing fast in-memory store for seamless execution.`);
    return false;
  }
}

module.exports = {
  connectDB,
  memoryStore
};
