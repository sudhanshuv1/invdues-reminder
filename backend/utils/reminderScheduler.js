const cron = require('node-cron');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const { makeTransport } = require('./transporterFactory');
const { getEmailContent } = require('./emailTemplateProcessor');

async function sendPeriodicReminders() {
  try {
    console.log('Starting periodic reminder job...');
    
    // Find users who have BOTH mail configured AND sendReminders enabled
    const activeUsers = await User.find({ 
      sendReminders: true
    }).populate('mailConfig');
    
    console.log(`Found ${activeUsers.length} active users for reminders`);
    
    for (const user of activeUsers) {
      try {
        // Skip if mail not configured
        if (!user.mailConfig || !user.mailConfig.isConfigured) {
          console.log(`Skipping user ${user._id}: Mail not configured`);
          continue;
        }
        
        // Find due invoices for this user
        const dueInvoices = await Invoice.find({
          userId: user._id,
          dueDate: { $lte: new Date() },
          status: { $in: ['unpaid', 'overdue'] }
        });
        
        if (dueInvoices.length > 0) {
          const transporter = await makeTransport(user._id);
          
          // Send reminder for each invoice
          for (const invoice of dueInvoices) {
            // Get email content based on template configuration
            const emailContent = getEmailContent(user.mailConfig, invoice, user);
            
            const mailOptions = {
              from: user.mailConfig.user,
              to: invoice.clientEmail,
              subject: emailContent.subject,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  ${emailContent.content.replace(/\n/g, '<br>')}
                  
                  <hr style="margin-top: 30px;">
                  <p style="font-size: 12px; color: #666;">
                    This is an automated reminder. Please contact ${user.email} if you have any questions.
                  </p>
                </div>
              `
            };
            
            await transporter.sendMail(mailOptions);
            console.log(`Periodic reminder sent for invoice ${invoice._id} to ${invoice.clientEmail}`);
          }
          
          // Update user's last reminder sent time
          await User.findByIdAndUpdate(user._id, {
            lastReminderSent: new Date()
          });
        }
      } catch (error) {
        console.error(`Error sending reminders for user ${user._id}:`, error.message);
      }
    }
    
    console.log('Periodic reminder job completed');
  } catch (error) {
    console.error('Error in periodic reminder job:', error.message);
  }
}

// Schedule to run daily at 9 AM
cron.schedule('0 9 * * *', sendPeriodicReminders);

module.exports = { sendPeriodicReminders };