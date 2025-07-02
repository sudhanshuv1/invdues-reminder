// zapierScheduler.js
const cron = require('node-cron');
const User = require('../models/User');
const Invoice = require('../models/Invoice');  // Ensure you have this model defined
const { postToZapier } = require('./zapierNotifier');

// Define a function that finds subscribed users and sends due invoice information.
async function sendWeeklyReminders() {
  try {
    // Find all users who have subscribed to reminders.
    const subscribedUsers = await User.find({ sendReminders: true });
    for (const user of subscribedUsers) {
      // For each user, find due invoices.
      // (Assumes your Invoice model has fields: user, dueDate, status, amount, etc.)
      const dueInvoices = await Invoice.find({
        userId: user._id,
        dueDate: { $lte: new Date() },
        status: { $in: ['unpaid', 'overdue'] }, // or whichever status indicates it’s due
      });
      
      // Only send a reminder if there are due invoices.
      if (dueInvoices.length > 0) {
        const payload = {
          event: 'weekly_reminder',
          userId: user._id,
          email: user.email, // assuming your user model includes an email field
          dueInvoices: dueInvoices.map(invoice => ({
            invoiceId: invoice._id,
            amount: invoice.amount,
            recepientName: invoice.clientName,
            recepientEmail: invoice.clientEmail,
            userName: user.displayName,
            userEmail: user.email,
            dueDate: invoice.dueDate
                ? new Date(invoice.dueDate).toLocaleDateString('en-GB') // DD/MM/YYYY
                : null,
            status: invoice.status
          })),
        };
        await postToZapier(payload);
      }
    }
  } catch (error) {
    console.error('Error in weekly reminder job:', error.message);
  }
}

// Schedule the weekly job.
// For example, run every Monday at 9 AM (server time):
cron.schedule('0 9 * * 1', () => {
  console.log('Running weekly reminder job...');
  sendWeeklyReminders();
});
