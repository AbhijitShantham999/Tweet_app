const mongoose = require("mongoose");

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.log("❌ MongoDB connection Error:", err);
  }
};

module.exports = connectToMongoDB;
