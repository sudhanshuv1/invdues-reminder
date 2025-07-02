const User = require('../models/User');
const Invoice = require('../models/Invoice');
const { makeTransport } = require('./transporterFactory');
class ReminderService {
  constructor() {
    this.activeJobs = new Map(); // Track active cron jobs per user
  }

  // In reminderService.js, update the sendImmediateReminders method:
  async sendImmediateReminders(userId) {
    try {
      const user = await User.findById(userId).populate('mailConfig');
      if (!user || !user.mailConfig || !user.mailConfig.isConfigured) {
        throw new Error('User not found or mail not configured');
      }

      // Find overdue/unpaid invoices
      const overdueInvoices = await Invoice.find({
        userId: userId,
        dueDate: { $lte: new Date() },
        status: { $in: ['unpaid', 'overdue'] }
      });

      if (overdueInvoices.length === 0) {
        return { message: 'No overdue invoices found', count: 0 };
      }

      // Use the updated makeTransport function
      const transporter = await makeTransport(userId);
      let sentCount = 0;

      // Send reminder for each overdue invoice
      for (const invoice of overdueInvoices) {
        try {
          const mailOptions = {
            from: user.mailConfig.user,
            to: invoice.clientEmail,
            subject: `Payment Reminder - Invoice ${invoice._id}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Payment Reminder</h2>
                <p>Dear ${invoice.clientName},</p>
                <p>This is a reminder that your invoice is overdue for payment.</p>
                
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Invoice Details:</h3>
                  <ul style="list-style: none; padding: 0;">
                    <li><strong>Invoice ID:</strong> ${invoice._id}</li>
                    <li><strong>Amount:</strong> ₹${invoice.amount}</li>
                    <li><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</li>
                    <li><strong>Days Overdue:</strong> ${Math.ceil((new Date() - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24))} days</li>
                  </ul>
                </div>
                
                <p>Please process the payment at your earliest convenience to avoid any late fees.</p>
                <p>If you have already made the payment, please disregard this message.</p>
                
                <p>Best regards,<br>${user.displayName}</p>
                
                <hr style="margin-top: 30px;">
                <p style="font-size: 12px; color: #666;">
                  This is an automated reminder. Please contact ${user.email} if you have any questions.
                </p>
              </div>
            `
          };

          await transporter.sendMail(mailOptions);
          sentCount++;
          console.log(`Reminder sent for invoice ${invoice._id} to ${invoice.clientEmail}`);
        } catch (emailError) {
          console.error(`Failed to send reminder for invoice ${invoice._id}:`, emailError.message);
        }
      }

      // Update user's last reminder sent time
      await User.findByIdAndUpdate(userId, {
        lastReminderSent: new Date()
      });

      return {
        message: `Reminders sent successfully`,
        count: sentCount,
        total: overdueInvoices.length
      };

    } catch (error) {
      console.error('Error sending immediate reminders:', error.message);
      throw error;
    }
  }

  async startReminders(userId) {
    try {
      // Send immediate reminders first
      const immediateResult = await this.sendImmediateReminders(userId);
      
      // Update user status to enable reminders
      await User.findByIdAndUpdate(userId, {
        sendReminders: true
      });

      return {
        message: 'Reminder system started successfully',
        immediate: immediateResult
      };
    } catch (error) {
      throw new Error('Failed to start reminder system: ' + error.message);
    }
  }

  async stopReminders(userId) {
    try {
      await User.findByIdAndUpdate(userId, {
        sendReminders: false
      });

      return { message: 'Reminder system stopped successfully' };
    } catch (error) {
      throw new Error('Failed to stop reminder system: ' + error.message);
    }
  }

  async getReminderStatus(userId) {
    try {
      const user = await User.findById(userId).select('sendReminders lastReminderSent mailConfig');
      
      return {
        isActive: user.sendReminders || false,
        lastReminderSent: user.lastReminderSent,
        mailConfigured: user.mailConfig && user.mailConfig.isConfigured
      };
    } catch (error) {
      throw new Error('Failed to get reminder status: ' + error.message);
    }
  }
}

module.exports = new ReminderService();