// utils/zapierNotifier.js
const axios = require('axios');

async function postToZapier(payload) {
  const zapierUrl = process.env.ZAPIER_WEBHOOK_URL;
  if (!zapierUrl) {
    console.error('Zapier webhook URL is not configured.');
    return;
  }
  try {
    const response = await axios.post(zapierUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    console.log('Posted to Zapier successfully:', response.data, "\n with payload: ", payload);
    return response.data;
  } catch (error) {
    console.error('Error posting to Zapier:', error.message);
    // Optionally handle error reporting here.
  }
}

module.exports = { postToZapier };
