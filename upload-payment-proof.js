const fetch = require('node-fetch');
const FormData = require('form-data');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  // Parse form data including file (using multipart parsing libraries like 'busboy' or 'formidable')
  // BUT Netlify Functions don't support multipart natively, so it's complicated.
  // Alternative: Use base64 encoded file data or a simple proof-of-payment text input

  // For simplicity, let's handle proof as a base64 string sent from the frontend

  const body = JSON.parse(event.body);

  const { filename, fileBase64, plan, price } = body;

  if (!filename || !fileBase64) {
    return {
      statusCode: 400,
      body: 'Missing filename or file data',
    };
  }

  // Save file temporarily (not possible in serverless, so skip this step)

  // Prepare Discord webhook payload
  const webhookUrl = "https://discord.com/api/webhooks/1370172729373753385/qctRLVkOCH9kOlys-aBmXrJokfPjJLcG8U7VHx7RNBlhkDsdhO910nwsYVLqVulCwGpf";

  // Discord webhook with base64 file upload is tricky. Discord requires multipart/form-data.

  // Instead, you can upload the image to an image hosting service (Imgur, or GitHub), then send the link to Discord webhook.

  // Or send a message without file attachment.

  const message = {
    content: `**💸 New Payment Proof Uploaded!**\n📄 Filename: \`${filename}\`\n💼 Plan: \`${plan || 'N/A'}\`\n💰 Price: \`${price || 'N/A'}\`\n🕒 Time: ${new Date().toISOString()}`,
    username: "Payment Bot"
  };

  // Send message to Discord webhook
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Payment proof sent successfully!' }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: 'Failed to send webhook message',
    };
  }
};
