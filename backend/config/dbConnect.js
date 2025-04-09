const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

const dbConnect = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true, // Ensures support for the new MongoDB connection string parser
      useUnifiedTopology: true, // Enables the Unified Topology layer
    });
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = dbConnect;
