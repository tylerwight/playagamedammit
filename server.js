require('dotenv').config();
const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const app = express();
const PORT = 80;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/games/:steamid', async (req, res) => {
  const steamId = req.params.steamid;
  const apiKey = process.env.STEAM_API_KEY; 
  const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId}&include_appinfo=true`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data.response.games || []);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


