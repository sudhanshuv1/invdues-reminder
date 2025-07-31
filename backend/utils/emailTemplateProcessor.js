// backend/utils/emailTemplateProcessor.js
const he = require('he'); // HTML entity encoder/decoder

function formatCurrency(amount) {
  return `₹${amount}`;
}

function formatCurrencyForTemplate(amount, templateText, placeholder) {
  // Check if the template already contains currency symbol before the placeholder
  const regex = new RegExp(`₹\\s*\\{\\{${placeholder}\\}\\}`, 'g');
  if (regex.test(templateText)) {
    // Template already has ₹, just return the amount
    return amount.toString();
  }
  // Template doesn't have ₹, add it
  return `₹${amount}`;
}

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-GB'); // DD/MM/YYYY format
}

function escapeHtml(text) {
  if (!text) return text;
  return he.encode(String(text));
}

function calculateDaysOverdue(dueDate) {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = today - due;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

function getEmailContent(mailConfig, invoice, user) {
  // Escape all user inputs to prevent XSS
  const safeClientName = escapeHtml(invoice.clientName);
  const safeInvoiceId = escapeHtml(invoice._id);
  const safeUserName = escapeHtml(user.displayName || '');
  const formattedDueDate = formatDate(invoice.dueDate);
  const daysOverdue = calculateDaysOverdue(invoice.dueDate);

  // Check if custom template is enabled and available
  if (mailConfig.emailTemplate && 
      mailConfig.emailTemplate.useCustomTemplate && 
      mailConfig.emailTemplate.customSubject && 
      mailConfig.emailTemplate.customContent) {
    
    // Smart currency formatting based on template content
    const formattedAmountForSubject = formatCurrencyForTemplate(
      invoice.amount, 
      mailConfig.emailTemplate.customSubject, 
      'amount'
    );
    const formattedAmountForContent = formatCurrencyForTemplate(
      invoice.amount, 
      mailConfig.emailTemplate.customContent, 
      'amount'
    );

    // Replace variables in custom template
    let customSubject = mailConfig.emailTemplate.customSubject
      .replace(/\{\{clientName\}\}/g, safeClientName)
      .replace(/\{\{invoiceId\}\}/g, safeInvoiceId)
      .replace(/\{\{amount\}\}/g, formattedAmountForSubject)
      .replace(/\{\{dueDate\}\}/g, formattedDueDate)
      .replace(/\{\{daysOverdue\}\}/g, daysOverdue)
      .replace(/\{\{userName\}\}/g, safeUserName);

    let customContent = mailConfig.emailTemplate.customContent
      .replace(/\{\{clientName\}\}/g, safeClientName)
      .replace(/\{\{invoiceId\}\}/g, safeInvoiceId)
      .replace(/\{\{amount\}\}/g, formattedAmountForContent)
      .replace(/\{\{dueDate\}\}/g, formattedDueDate)
      .replace(/\{\{daysOverdue\}\}/g, daysOverdue)
      .replace(/\{\{userName\}\}/g, safeUserName);

    return {
      subject: customSubject,
      content: customContent
    };
  }

  // Default template - always use formatted currency
  const formattedAmount = formatCurrency(invoice.amount);
  const defaultSubject = `Invoice ${safeInvoiceId} for ${safeClientName} - ${formattedAmount} due ${formattedDueDate} (${daysOverdue > 0 ? `${daysOverdue} days` : ''} overdue) - ${safeUserName}`;
  
  const defaultContent = `
<p style="font-size: 18px; font-weight: bold;">Payment Reminder</p>
Dear ${safeClientName},
<br>
This is a reminder that your invoice is overdue for payment.
<div style="border-radius: 5px; padding: 10px; background-color: #f9f9f9;">
  Invoice Details:
  - Invoice ID: ${safeInvoiceId}
  - Amount: ${formattedAmount}
  - Due Date: ${formattedDueDate}
  - Days Overdue: ${daysOverdue} days
</div>
Please process the payment at your earliest convenience to avoid any late fees.
If you have already made the payment, please disregard this message.
<br>
Best regards,
${safeUserName}`;

  return {
    subject: defaultSubject,
    content: defaultContent
  };
}

module.exports = { getEmailContent, formatCurrency, formatDate, escapeHtml };