const User = require('../models/User');
const Invoice = require('../models/Invoice');
const { makeTransport } = require('./transporterFactory');
const { getEmailContent } = require('./emailTemplateProcessor');

class ReminderService {
  constructor() {
    this.activeJobs = new Map(); // Track active cron jobs per user
  }

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
      const user = await User.findById(userId).populate('mailConfig');
      
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