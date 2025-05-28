require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const {
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
  BOT_TOKEN,
  GUILD_ID,
  ROLE_ID,
} = process.env;

app.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('Missing code');

  try {
    // Step 1: Exchange code for access token
    const tokenRes = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      scope: 'identify guilds.join'
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });

    const accessToken = tokenRes.data.access_token;

    // Step 2: Get user info
    const userRes = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const user = userRes.data;

    // Step 3: Add user to guild
    await axios.put(`https://discord.com/api/guilds/${GUILD_ID}/members/${user.id}`, {
      access_token: accessToken
    }, {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        'Content-Type': 'application/json',
      }
    });

    // Step 4: Add role to user
    await axios.put(`https://discord.com/api/guilds/${GUILD_ID}/members/${user.id}/roles/${ROLE_ID}`, {}, {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`
      }
    });

    res.send("✅ You've been added to the server and assigned a role. You may close this tab.");
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send('Error during Discord login or role assignment.');
  }
});

app.listen(3000, () => console.log('Server running at http://localhost:3000'));
