// models/config/db.js
const mongoose = require("mongoose");

let isConnected = false;

const connectToMongoDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
    });

    isConnected = db.connections[0].readyState === 1;

    if (isConnected) {
      console.log("✅ MongoDB connected");
    }
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    throw err;
  }
};

module.exports = connectToMongoDB;
