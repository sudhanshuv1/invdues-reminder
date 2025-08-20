const User = require('../models/User');
const MailConfig = require('../models/MailConfig');
const axios = require('axios');
const bcrypt = require('bcrypt'); // Add bcrypt import
const { encrypt, decrypt } = require('../utils/encryption'); // Import encryption utility

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

    const encryptedPassword = encrypt(pass);
    
    console.log('Password encrypted successfully');
    
    
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
        pass: encryptedPassword, // Store encrypted password
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

// Get email template
const getEmailTemplate = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).populate('mailConfig');
    
    if (!user || !user.mailConfig) {
      console.log('No mail config found for user:', userId, 'returning defaults');
      return res.json({ 
        useCustomTemplate: false,
        customSubject: '',
        customContent: '',
        defaultSubject: 'Payment Reminder - Invoice {{invoiceId}}',
        defaultContent: `
          <p style="font-size: 18px; font-weight: bold;">Payment Reminder</p>

          Dear {{clientName}},
          <br>

          This is a reminder that your invoice is overdue for payment.

          <div style="border-radius: 5px; padding: 10px; background-color: #f9f9f9;">
            Invoice Details:
            - Invoice ID: {{invoiceId}}
            - Amount: ₹{{amount}}
            - Due Date: {{dueDate}}
            - Days Overdue: {{daysOverdue}} days
          </div>

          Please process the payment at your earliest convenience to avoid any late fees.
          If you have already made the payment, please disregard this message.

          <br>
          Best regards,
          {{userName}}`
        });
    }
    
    const template = user.mailConfig.emailTemplate || {};
    
    console.log('=== GET EMAIL TEMPLATE DEBUG ===');
    console.log('User ID:', userId);
    console.log('Mail Config ID:', user.mailConfig._id);
    console.log('Raw emailTemplate from DB:', JSON.stringify(template, null, 2));
    console.log('Raw useCustomTemplate value:', template.useCustomTemplate);
    console.log('Type of useCustomTemplate:', typeof template.useCustomTemplate);
    console.log('Boolean conversion result:', Boolean(template.useCustomTemplate));
    console.log('Strict equality checks:');
    console.log('  === true:', template.useCustomTemplate === true);
    console.log('  === false:', template.useCustomTemplate === false);
    console.log('  === undefined:', template.useCustomTemplate === undefined);
    console.log('  === null:', template.useCustomTemplate === null);
    
    // Force explicit boolean conversion
    const useCustomTemplate = template.useCustomTemplate === true;
    
    const responseData = {
      useCustomTemplate: useCustomTemplate,
      customSubject: template.customSubject || '',
      customContent: template.customContent || '',
      defaultSubject: 'Payment Reminder - Invoice {{invoiceId}}',
      defaultContent: `
        <p style="font-size: 18px; font-weight: bold;">Payment Reminder</p>
        
        Dear {{clientName}},
        <br>

        This is a reminder that your invoice is overdue for payment.

        <div style="border-radius: 5px; padding: 10px; background-color: #f9f9f9;">
          Invoice Details:
          - Invoice ID: {{invoiceId}}
          - Amount: ₹{{amount}}
          - Due Date: {{dueDate}}
          - Days Overdue: {{daysOverdue}} days
        </div>

        Please process the payment at your earliest convenience to avoid any late fees.
        If you have already made the payment, please disregard this message.

        <br>
        Best regards,
        {{userName}}`
    };
    
    console.log('Final response data:', JSON.stringify(responseData, null, 2));
    console.log('=== END GET EMAIL TEMPLATE DEBUG ===');
    
    res.json(responseData);
  } catch (error) {
    console.error('Get email template error:', error);
    res.status(500).json({ message: 'Error fetching email template', error: error.message });
  }
};

// Update email template
const updateEmailTemplate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { useCustomTemplate, customSubject, customContent } = req.body;
    
    console.log('=== UPDATE EMAIL TEMPLATE DEBUG ===');
    console.log('User ID:', userId);
    console.log('Raw request body:', JSON.stringify(req.body, null, 2));
    
    // Explicitly handle boolean conversion for useCustomTemplate
    // Handle both string "false" and boolean false
    let shouldUseCustomTemplate;
    if (useCustomTemplate === "false" || useCustomTemplate === false || useCustomTemplate === 0 || useCustomTemplate === null || useCustomTemplate === undefined) {
      shouldUseCustomTemplate = false;
    } else if (useCustomTemplate === "true" || useCustomTemplate === true || useCustomTemplate === 1) {
      shouldUseCustomTemplate = true;
    } else {
      shouldUseCustomTemplate = Boolean(useCustomTemplate);
    }
    
    console.log('Boolean conversion:', {
      original: useCustomTemplate,
      type: typeof useCustomTemplate,
      converted: shouldUseCustomTemplate,
      convertedType: typeof shouldUseCustomTemplate
    });
    
    // Find the user's mail config
    const user = await User.findById(userId).populate('mailConfig');
    
    if (!user || !user.mailConfig) {
      console.log('No mail config found for user:', userId);
      return res.status(400).json({ message: 'Mail configuration not found. Please configure your email settings first.' });
    }
    
    console.log('Mail Config ID:', user.mailConfig._id);
    console.log('Current emailTemplate before update:', JSON.stringify(user.mailConfig.emailTemplate, null, 2));
    
    // Update the email template in MailConfig - always update all fields
    const updateData = {
      'emailTemplate.useCustomTemplate': shouldUseCustomTemplate,
      'emailTemplate.customSubject': customSubject || '',
      'emailTemplate.customContent': customContent || ''
    };
    
    console.log('Update data to be applied:', JSON.stringify(updateData, null, 2));
    
    const updatedMailConfig = await MailConfig.findByIdAndUpdate(
      user.mailConfig._id, 
      { $set: updateData },
      { new: true } // Return the updated document
    );
    
    console.log('Database update completed');
    console.log('Updated emailTemplate from DB:', JSON.stringify(updatedMailConfig.emailTemplate, null, 2));
    
    // Double-check by fetching fresh from database
    const freshMailConfig = await MailConfig.findById(user.mailConfig._id);
    console.log('Fresh fetch from DB:', JSON.stringify(freshMailConfig.emailTemplate, null, 2));
    console.log('=== END UPDATE EMAIL TEMPLATE DEBUG ===');
    
    res.json({ 
      message: 'Email template updated successfully',
      useCustomTemplate: shouldUseCustomTemplate,
      customSubject: customSubject || '',
      customContent: customContent || '',
      debug: {
        originalValue: useCustomTemplate,
        convertedValue: shouldUseCustomTemplate,
        savedValue: freshMailConfig.emailTemplate.useCustomTemplate
      }
    });
  } catch (error) {
    console.error('Update email template error:', error);
    res.status(500).json({ message: 'Error updating email template', error: error.message });
  }
};

// Debug endpoint to check current email template configuration
const debugEmailTemplate = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).populate('mailConfig');
    
    if (!user || !user.mailConfig) {
      return res.json({ 
        message: 'No mail configuration found',
        configured: false 
      });
    }
    
    const templateData = user.mailConfig.emailTemplate || {};
    
    res.json({
      userId: userId,
      mailConfigId: user.mailConfig._id,
      emailTemplate: {
        useCustomTemplate: templateData.useCustomTemplate,
        customSubject: templateData.customSubject,
        customContent: templateData.customContent,
        hasCustomSubject: Boolean(templateData.customSubject),
        hasCustomContent: Boolean(templateData.customContent),
        willUseCustomTemplate: Boolean(
          templateData.useCustomTemplate && 
          templateData.customSubject && 
          templateData.customContent
        )
      },
      rawTemplateData: templateData
    });
  } catch (error) {
    console.error('Debug email template error:', error);
    res.status(500).json({ message: 'Error debugging email template', error: error.message });
  }
};

module.exports = {
  getMailConfig,
  configureGmail,
  configureSMTP,
  removeMailConfig,
  getEmailTemplate,
  updateEmailTemplate,
  debugEmailTemplate
};