/**
 * Process email template with dynamic values
 * @param {string} template - Template string with placeholders
 * @param {object} data - Data to replace placeholders
 * @returns {string} - Processed template
 */
function processTemplate(template, data) {
  if (!template) return '';
  
  return template
    .replace(/\{\{invoiceId\}\}/g, data.invoiceId || '')
    .replace(/\{\{clientName\}\}/g, data.clientName || '')
    .replace(/\{\{amount\}\}/g, data.amount || '')
    .replace(/\{\{dueDate\}\}/g, data.dueDate || '')
    .replace(/\{\{daysOverdue\}\}/g, data.daysOverdue || '')
    .replace(/\{\{userName\}\}/g, data.userName || '');
}

/**
 * Get email content based on template configuration
 * @param {object} mailConfig - Mail configuration with template settings
 * @param {object} invoice - Invoice data
 * @param {object} user - User data
 * @returns {object} - Subject and content
 */
function getEmailContent(mailConfig, invoice, user) {
  const templateData = {
    invoiceId: invoice._id,
    clientName: invoice.clientName,
    amount: invoice.amount,
    dueDate: new Date(invoice.dueDate).toLocaleDateString(),
    daysOverdue: Math.ceil((new Date() - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24)),
    userName: user.displayName
  };

  const template = mailConfig.emailTemplate || {};
  
  if (template.useCustomTemplate && template.customSubject && template.customContent) {
    // Use custom template
    return {
      subject: processTemplate(template.customSubject, templateData),
      content: processTemplate(template.customContent, templateData)
    };
  } else {
    // Use default template
    const defaultSubject = `Payment Reminder - Invoice ${templateData.invoiceId}`;
    const defaultContent = `

    <p style="font-size: 18px; font-weight: bold;">Payment Reminder</p>

    Dear ${templateData.clientName},

    This is a reminder that your invoice is overdue for payment.

    <div style="border-radius: 5px; padding: 10px; background-color: #f9f9f9;">
      Invoice Details:
      - Invoice ID: ${templateData.invoiceId}
      - Amount: ₹${templateData.amount}
      - Due Date: ${templateData.dueDate}
      - Days Overdue: ${templateData.daysOverdue} days
    </div>

    Please process the payment at your earliest convenience to avoid any late fees.
    If you have already made the payment, please disregard this message.

    Best regards,
    ${templateData.userName}`;

    return {
      subject: defaultSubject,
      content: defaultContent
    };
  }
}

module.exports = {
  processTemplate,
  getEmailContent
};