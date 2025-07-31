const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String },
  displayName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  profilePhoto: { type: String },
  createdAt: { type: Date, default: Date.now },
  sendReminders: { type: Boolean, default: false },
  mailConfig: { type: mongoose.Schema.Types.ObjectId, ref: 'MailConfig' }, // Add mail configuration
  subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' }, // Add subscription reference
  lastReminderSent: { type: Date, default: null } // Track last reminder sent time
}, {
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  const bcrypt = require('bcrypt');
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;