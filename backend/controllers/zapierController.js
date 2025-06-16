// controllers/zapierController.js
const User = require('../models/User');
const Invoice = require('../models/Invoice'); // Ensure you have this model defined.
const { postToZapier } = require('../utils/zapierNotifier');

// Subscribe handler: sets sendReminders to true, then sends a POST to Zapier
// with all the due invoices for the user.
const subscribeZapier = async (req, res) => {
  const staticWebhookUrl = process.env.ZAPIER_WEBHOOK_URL;
  if (!staticWebhookUrl) {
    return res.status(500).json({ message: 'Static Zapier webhook URL is not configured.' });
  }

  const userId = req.user ? req.user.id : null;
  console.log(`Zapier subscribe requested by user: ${userId || 'anonymous'}.`);

  if (userId) {
    try {
      // First, update the user so that reminders are enabled.
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { sendReminders: true },
        { new: true }
      );

      // Query for due invoices for this user.
      // Here we assume due invoices are those with a dueDate in the past or today
      // and a status of 'pending'. Adjust the query as needed for your setup.
      const dueInvoices = await Invoice.find({
        userId,
        dueDate: { $lte: new Date() },
        status: { $in: ['unpaid', 'overdue'] }
      });

      // Build the payload with the due invoices.
    const payload = {
        event: 'subscribe_with_due_invoices',
        userId,
        message: 'User subscribed to Zapier reminders with due invoices.',
        dueInvoices: dueInvoices.map(invoice => ({
            invoiceId: invoice._id,
            amount: invoice.amount,
            recepientName: invoice.clientName,
            recepientEmail: invoice.clientEmail,
            userName: updatedUser.displayName,
            userEmail: updatedUser.email,
            dueDate: invoice.dueDate
                ? new Date(invoice.dueDate).toLocaleDateString('en-GB')// DD/MM/YYYY
                : null,
            status: invoice.status
        }))
    };

      // Send the POST request to the Zapier webhook.
      await postToZapier(payload);

      return res.status(201).json({
        subscription_id: 'static',
        target_url: staticWebhookUrl,
        message: 'Zapier webhook subscription configured and due invoices sent.',
        sendReminders: updatedUser.sendReminders,
        dueInvoices // for debugging purposes, you can include the due invoices in the response.
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Error updating subscription in database.',
        error: error.message
      });
    }
  }

  // If user information is not available, just return the static URL.
  return res.status(201).json({
    subscription_id: 'static',
    target_url: staticWebhookUrl,
    message: 'Zapier webhook subscription configured using static URL (User not authenticated)',
  });
};


// Unsubscribe handler: acknowledges the request and sets sendReminders to false.
const unsubscribeZapier = async (req, res) => {
  const userId = req.user ? req.user.id : null;
  console.log(`Zapier unsubscribe requested by user: ${userId || 'anonymous'}.`);

  if (userId) {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { sendReminders: false },
        { new: true }
      );
      return res.status(200).json({
        message: 'Zapier unsubscribe acknowledged: reminders disabled successfully.',
        sendReminders: updatedUser.sendReminders,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error updating subscription in database.', error: error.message });
    }
  }

  return res.status(200).json({
    message: 'Zapier unsubscribe acknowledged. (User not authenticated, so no database update was made.)',
  });
};

// New: Check subscription status handler.
const checkZapierSubscription = async (req, res) => {
  const userId = req.user ? req.user.id : null;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized: No user information found.' });
  }
  
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.status(200).json({ sendReminders: user.sendReminders });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch subscription status.', error: error.message });
  }
};

module.exports = {
  subscribeZapier,
  unsubscribeZapier,
  checkZapierSubscription,
};
