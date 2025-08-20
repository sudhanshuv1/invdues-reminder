// scheduler.js
require('dotenv').config();
const dbConnect = require('./config/dbConnect');
const { sendPeriodicReminders } = require('./utils/reminderScheduler');

// Lambda function for reminder scheduling only
module.exports.reminderScheduler = async (event, context) => {
  console.log('Reminder scheduler triggered');
  try {
    // Connect to database
    await dbConnect();
    
    console.log('Running reminder scheduler at:', new Date().toISOString());
    
    // Call the periodic reminders function from your existing reminderScheduler.js
    await sendPeriodicReminders();
    
    return { 
      statusCode: 200, 
      body: JSON.stringify({ 
        message: 'Reminder processing completed successfully',
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Reminder scheduler error:', error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ 
        message: 'Reminder processing failed', 
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};