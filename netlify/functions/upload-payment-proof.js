const fetch = require('node-fetch');
const FormData = require('form-data');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);
    const { filename, fileBase64, plan, price, email, whatsapp, transactionId } = body;

    if (!filename || !fileBase64 || !email) {
      return { statusCode: 400, body: 'Missing required fields (filename, fileBase64, or email)' };
    }

    // Convert base64 to Buffer
    const buffer = Buffer.from(fileBase64, 'base64');

    // Upload to uguu.se
    const form = new FormData();
    form.append('files[]', buffer, filename);

    const uguuRes = await fetch('https://uguu.se/upload.php', {
      method: 'POST',
      body: form,
    });

    const uguuData = await uguuRes.json();
    if (!uguuData || !uguuData.files || !uguuData.files[0]) {
      return { statusCode: 500, body: 'Failed to upload file to Uguu' };
    }

    const imageUrl = uguuData.files[0].url;

    // Send to Discord
   const webhookUrl = "https://discord.com/api/webhooks/1419266736271785994/hd8l2pKi0s81wKaQuSSVQFJDquMJT3H7_nCsHT2QmgcjG6rqU9BukQE_q1Es7dmzXgE9";

const discordPayload = {
  username: "Payment Bot",
  content: "<@1249079341766283340>", // ✅ This is required for actual mention
  embeds: [
    {
      title: "💸 New Payment Proof Uploaded",
      color: 0xfcd34d,
      fields: [
        { name: "📄 Filename", value: filename, inline: true },
        { name: "💼 Plan", value: plan || "N/A", inline: true },
        { name: "💰 Price", value: `$${price || "N/A"}`, inline: true },
        { name: "📧 Email", value: email, inline: false },
        { name: "📱 WhatsApp", value: whatsapp || "Not provided", inline: false },
        { name: "🆔 Transaction ID", value: transactionId || "Not provided", inline: false },
      ],
      image: { url: imageUrl },
      timestamp: new Date().toISOString(),
    },
  ],
};


    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Payment proof sent via Uguu + Discord!' }),
    };

  } catch (err) {
    console.error('Error:', err);
    return { statusCode: 500, body: 'Server error' };
  }
};
