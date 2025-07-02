const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Can be SendGrid, Mailgun, etc.
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // App password or API key
  },
});

// Handler for sending due-invoice reminder email
const sendReminder = async (req, res) => {
  const { userId, dueInvoices } = req.body;

  if (!userId || !dueInvoices || dueInvoices.length === 0) {
    return res.status(400).json({ message: 'Invalid request: Missing user or invoice data.' });
  }

  try {
    for (const invoice of dueInvoices) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: invoice.recepientEmail, // Invoice recipient email
        subject: `Invoice Reminder - Invoice #${invoice.invoiceId} Due on ${invoice.dueDate}`,
        html: `
          <p>Dear ${invoice.recepientName},</p>
          <p>Your invoice <strong>#${invoice.invoiceId}</strong> for <strong>$${invoice.amount}</strong> is due on <strong>${invoice.dueDate}</strong>.</p>
          <p>Click below to view and pay:</p>
          <p><a href="${invoice.link}" style="color:#0088cc; text-decoration:none;">View Invoice</a></p>
          <p>Thank you,<br>Your Company</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Invoice email sent to ${invoice.recepientEmail}`);
    }

    return res.status(200).json({ message: 'Subscription processed. Emails sent successfully.' });
  } catch (error) {
    console.error('Error processing subscription:', error.message);
    return res.status(500).json({ message: 'Subscription processing failed.', error: error.message });
  }
};

module.exports = { sendReminder };
