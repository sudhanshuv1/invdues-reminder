const User = require('../models/User');
const MailConfig = require('../models/MailConfig');
const axios = require('axios');

// Get mail configuration status
const getMailConfig = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find the user and populate the mailConfig reference
    const user = await User.findById(userId).populate('mailConfig');
    
    if (!user || !user.mailConfig || !user.mailConfig.isConfigured) {
      return res.json({ configured: false });
    }
    
    res.json({
      configured: user.mailConfig.isConfigured,
      provider: user.mailConfig.provider,
      user: user.mailConfig.user
    });
  } catch (error) {
    console.error('Get mail config error:', error);
    res.status(500).json({ message: 'Error fetching mail configuration', error: error.message });
  }
};

// Configure Gmail OAuth
const configureGmail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { code } = req.body;
    
    console.log('Received Gmail configuration request:', { userId, code: code ? 'present' : 'missing' });
    
    if (!code) {
      return res.status(400).json({ message: 'Authorization code is required' });
    }

    // Exchange authorization code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_EMAIL_CLIENT_ID,
      client_secret: process.env.GOOGLE_EMAIL_CLIENT_SECRET,
      redirect_uri: `${process.env.FRONTEND_URL}/dashboard/mail-settings`,
      grant_type: 'authorization_code'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Token exchange successful');

    const { access_token, refresh_token } = tokenResponse.data;

    // Get user's email from Google
    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const userEmail = userResponse.data.email;
    console.log('Retrieved user email:', userEmail);

    // Create or update MailConfig document
    const mailConfig = await MailConfig.findOneAndUpdate(
      { userId }, // Find by userId (not _id)
      {
        provider: 'gmail',
        user: userEmail,
        refreshToken: refresh_token,
        accessToken: access_token,
        isConfigured: true
      },
      { 
        upsert: true, // Create if doesn't exist
        new: true,    // Return updated document
        setDefaultsOnInsert: true
      }
    );

    // Update user with mailConfig reference
    await User.findByIdAndUpdate(userId, {
      mailConfig: mailConfig._id
    });

    console.log('Gmail configured successfully for user:', userId);
    
    res.json({ 
      message: 'Gmail configured successfully',
      email: userEmail,
      configured: true,
      provider: 'gmail'
    });
  } catch (error) {
    console.error('Gmail configuration error:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Error configuring Gmail', 
      error: error.response?.data?.error_description || error.message 
    });
  }
};

// Configure SMTP
const configureSMTP = async (req, res) => {
  try {
    const userId = req.user.id;
    const { host, port, secure, user, pass } = req.body;
    
    console.log('Configuring SMTP for user:', userId, { host, port, secure, user });
    
    if (!host || !port || !user || !pass) {
      return res.status(400).json({ message: 'All SMTP fields are required' });
    }
    
    // Determine provider based on host
    let provider = 'smtp';
    if (host.includes('gmail')) {
      provider = 'gmail';
    } else if (host.includes('outlook') || host.includes('hotmail')) {
      provider = 'smtp'; // Keep as 'smtp' for consistency with your model
    }
    
    // Create or update MailConfig document
    const mailConfig = await MailConfig.findOneAndUpdate(
      { userId }, // Find by userId field (not _id)
      {
        provider: provider,
        user: user,
        host: host,
        port: parseInt(port),
        secure: secure === 'true',
        pass: pass, // In production, encrypt this
        isConfigured: true
      },
      { 
        upsert: true, // Create if doesn't exist
        new: true,    // Return updated document
        setDefaultsOnInsert: true
      }
    );

    // Update user with mailConfig reference
    await User.findByIdAndUpdate(userId, {
      mailConfig: mailConfig._id
    });
    
    console.log('SMTP configured successfully for user:', userId);
    
    res.json({ 
      message: 'Email configured successfully',
      configured: true,
      provider: provider,
      user: user
    });
  } catch (error) {
    console.error('SMTP configuration error:', error);
    res.status(500).json({ message: 'Error configuring email', error: error.message });
  }
};

// Remove mail configuration
const removeMailConfig = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Delete the MailConfig document
    await MailConfig.findOneAndDelete({ userId });
    
    // Remove the mailConfig reference from user
    await User.findByIdAndUpdate(userId, {
      $unset: { mailConfig: 1 }
    });
    
    console.log('Mail configuration removed for user:', userId);
    
    res.json({ message: 'Email configuration removed successfully' });
  } catch (error) {
    console.error('Remove mail config error:', error);
    res.status(500).json({ message: 'Error removing email configuration', error: error.message });
  }
};

module.exports = {
  getMailConfig,
  configureGmail,
  configureSMTP,
  removeMailConfig
};