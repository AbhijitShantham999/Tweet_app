const mongoose = require("mongoose");

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.log("❌ MongoDB connection Error:", err);
  }
};

module.exports = connectToMongoDB;
