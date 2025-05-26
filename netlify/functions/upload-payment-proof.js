const fetch = require('node-fetch');
const FormData = require('form-data');

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { filename, fileBase64, plan, price, email, whatsapp, transactionId } = body;

    if (!filename || !fileBase64 || !email || !transactionId || !plan || !price) {
      return {
        statusCode: 400,
        body: 'Missing required fields',
      };
    }

    // Decode base64 and upload to uguu.se
    const fileBuffer = Buffer.from(fileBase64, 'base64');
    const formData = new FormData();
    formData.append('files[]', fileBuffer, filename);

    const uguuRes = await fetch('https://uguu.se/upload.php', {
      method: 'POST',
      body: formData,
    });

    const uguuJson = await uguuRes.json();
    if (!uguuJson.files || !uguuJson.files[0] || !uguuJson.files[0].url) {
      throw new Error('Failed to upload to uguu.se');
    }

    const fileUrl = uguuJson.files[0].url;

    // Send to Discord webhook
    const webhookUrl = 'https://discord.com/api/webhooks/XXXX/XXXXXX'; // Replace with your webhook
    const embed = {
      title: '📨 New Binance Pay Submission',
      color: 0xffd700,
      fields: [
        { name: '📧 Email', value: email, inline: false },
        { name: '📱 WhatsApp', value: whatsapp || 'Not provided', inline: false },
        { name: '💸 Plan', value: plan, inline: true },
        { name: '💵 Price', value: `$${price}`, inline: true },
        { name: '🆔 Transaction ID', value: transactionId || 'Not provided', inline: false },
        { name: '📎 Payment Proof', value: `[View Image](${fileUrl})`, inline: false },
      ],
      timestamp: new Date().toISOString(),
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Success', imageUrl: fileUrl }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `Server Error: ${error.message}`,
    };
  }
};
