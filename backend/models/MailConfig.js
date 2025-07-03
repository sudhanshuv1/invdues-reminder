const mongoose = require('mongoose');

const MailConfigSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Ensure one mail config per user
  },
  provider: { 
    type: String, 
    enum: ['gmail', 'smtp'], 
    required: true 
  },
  user: { 
    type: String, 
    required: true 
  }, // Email address for sending
  
  // For Gmail OAuth:
  refreshToken: { type: String },
  accessToken: { type: String },
  
  // For SMTP:
  host: { type: String },
  port: { type: Number },
  secure: { type: Boolean },
  pass: { type: String }, // App password or SMTP password
  
  // Email Template Customization
  emailTemplate: {
    useCustomTemplate: { type: Boolean, default: false },
    customSubject: { type: String, default: '' },
    customContent: { type: String, default: '' }
  },
  
  isConfigured: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

const MailConfig = mongoose.model('MailConfig', MailConfigSchema);

module.exports = MailConfig;