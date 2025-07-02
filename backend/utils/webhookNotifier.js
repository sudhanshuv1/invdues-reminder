// utils/webhookNotifier.js
const axios = require('axios');

async function postToWebhook(payload) {
  const webhookUrl = `${process.env.BACKEND_URL}/webhook/send-reminder`; // e.g., http://your-backend.com/webhook/send-reminder
  if (!webhookUrl) {
    console.error('Webhook subscription URL is not configured.');
    return;
  }
  
  try {
    const response = await axios.post(webhookUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    console.log('Posted to webhook successfully:', response.data, '\nPayload:', payload);
    return response.data;
  } catch (error) {
    console.error('Error posting to webhook:', error.message);
    // Optionally add error handling here if needed.
  }
}

module.exports = { postToWebhook };
