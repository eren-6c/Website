const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { filename, fileBase64, plan, price } = body;

    if (!filename || !fileBase64) {
      return {
        statusCode: 400,
        body: 'Missing filename or file data',
      };
    }

    // Prepare Discord webhook
    const webhookUrl = "https://discord.com/api/webhooks/1370172729373753385/qctRLVkOCH9kOlys-aBmXrJokfPjJLcG8U7VHx7RNBlhkDsdhO910nwsYVLqVulCwGpf";

    const webhookPayload = {
      username: "Payment Bot",
      embeds: [
        {
          title: "💸 New Payment Proof Uploaded",
          color: 0xfcd34d, // Tailwind yellow-400
          fields: [
            {
              name: "📄 Filename",
              value: filename,
              inline: false,
            },
            {
              name: "💼 Plan",
              value: plan || "N/A",
              inline: true,
            },
            {
              name: "💰 Price",
              value: `$${price || "N/A"}`,
              inline: true,
            }
          ],
          footer: {
            text: "Submitted at"
          },
          timestamp: new Date().toISOString()
        }
      ]
    };

    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookPayload),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Payment proof sent successfully!" }),
    };
  } catch (err) {
    console.error("Webhook error:", err);
    return {
      statusCode: 500,
      body: 'Failed to send webhook message',
    };
  }
};
