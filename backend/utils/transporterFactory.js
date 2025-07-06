const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const User = require('../models/User');
const { decrypt } = require('./encryption'); // Import decryption utility

async function makeTransport(userId) {
  try {
    // Get user with populated mailConfig
    const user = await User.findById(userId).populate('mailConfig');
    
    if (!user || !user.mailConfig || !user.mailConfig.isConfigured) {
      throw new Error('Mail configuration not found or not configured');
    }

    const mailConfig = user.mailConfig;
    console.log('Creating transporter for provider:', mailConfig.provider);

    if (mailConfig.provider === 'gmail' && mailConfig.refreshToken) {
      // Gmail OAuth approach
      const oAuth2 = new google.auth.OAuth2(
        process.env.GOOGLE_EMAIL_CLIENT_ID,
        process.env.GOOGLE_EMAIL_CLIENT_SECRET,
        `${process.env.FRONTEND_URL}/dashboard/mail-settings`
      );
      
      oAuth2.setCredentials({ 
        refresh_token: mailConfig.refreshToken 
      });
      
      const { token: accessToken } = await oAuth2.getAccessToken();

      return nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: mailConfig.user,
          clientId: process.env.GOOGLE_EMAIL_CLIENT_ID,
          clientSecret: process.env.GOOGLE_EMAIL_CLIENT_SECRET,
          refreshToken: mailConfig.refreshToken,
          accessToken: accessToken
        }
      });
    } else {
      // SMTP approach (including Gmail SMTP)

      const decryptedPassword = decrypt(mailConfig.pass); // Decrypt the password


      const transportConfig = {
        host: mailConfig.host,
        port: mailConfig.port,
        secure: mailConfig.secure,
        auth: {
          user: mailConfig.user,
          pass: decryptedPassword // Use decrypted password
        }
      };

      // Add service for Gmail SMTP
      if (mailConfig.host && mailConfig.host.includes('gmail')) {
        transportConfig.service = 'gmail';
      }

      console.log('SMTP Transporter config:', {
        host: transportConfig.host,
        port: transportConfig.port,
        secure: transportConfig.secure,
        user: transportConfig.auth.user
      });

      return nodemailer.createTransporter(transportConfig); 
    }
  } catch (error) {
    console.error('Error creating mail transporter:', error);
    throw new Error('Failed to create mail transporter: ' + error.message);
  }
}

module.exports = { makeTransport };