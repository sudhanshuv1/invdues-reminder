const cron = require('node-cron');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const { makeTransport } = require('./transporterFactory');

async function sendPeriodicReminders() {
  try {
    console.log('Starting periodic reminder job...');
    
    // Find users who have BOTH mail configured AND sendReminders enabled
    const activeUsers = await User.find({ 
      sendReminders: true,
      'mailConfig.isConfigured': true 
    });
    
    console.log(`Found ${activeUsers.length} active users for reminders`);
    
    for (const user of activeUsers) {
      try {
        // Find due invoices for this user
        const dueInvoices = await Invoice.find({
          userId: user._id,
          dueDate: { $lte: new Date() },
          status: { $in: ['unpaid', 'overdue'] }
        });
        
        if (dueInvoices.length > 0) {
          const transporter = await makeTransport(user.mailConfig);
          
          // Send reminder for each invoice
          for (const invoice of dueInvoices) {
            const mailOptions = {
              from: user.mailConfig.user,
              to: invoice.clientEmail,
              subject: `Payment Reminder - Invoice ${invoice._id}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #333;">Payment Reminder</h2>
                  <p>Dear ${invoice.clientName},</p>
                  <p>This is a periodic reminder that your invoice is overdue for payment.</p>
                  
                  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Invoice Details:</h3>
                    <ul style="list-style: none; padding: 0;">
                      <li><strong>Invoice ID:</strong> ${invoice._id}</li>
                      <li><strong>Amount:</strong> ₹${invoice.amount}</li>
                      <li><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</li>
                      <li><strong>Days Overdue:</strong> ${Math.ceil((new Date() - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24))} days</li>
                    </ul>
                  </div>
                  
                  <p>Please process the payment at your earliest convenience.</p>
                  <p>Best regards,<br>${user.displayName}</p>
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