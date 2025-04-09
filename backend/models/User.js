const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String }, // Google OAuth ID (optional for email/password users)
  displayName: { type: String, required: true }, // User's name
  email: { type: String, required: true, unique: true }, // Email (common for both login methods)
  password: { type: String }, // Hashed password (required for email/password users)
  profilePhoto: { type: String }, // Profile photo URL (optional)
  createdAt: { type: Date, default: Date.now } // Timestamp for user creation
});

// Add a method to compare passwords for email/password login
userSchema.methods.comparePassword = async function (candidatePassword) {
  const bcrypt = require('bcrypt');
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;