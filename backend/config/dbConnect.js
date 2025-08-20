const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

const dbConnect = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.error('Full error:', error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = dbConnect;
