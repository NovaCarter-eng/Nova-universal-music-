const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// CORS Bypass: Ye App ko block hone se rokiya
app.use(cors({
    origin: '*',
    methods: ['GET']
}));

// Route 1: Hindi/Bollywood Songs ke liye (JioSaavn Proxy)
app.get('/api/desi', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Bhai, gaane ka naam toh likh!" });

    try {
        const response = await axios.get(`https://saavn.sumit.co/api/search/songs?query=${encodeURIComponent(query)}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Desi server down hai." });
    }
});

// Route 2: English/Universal Songs ke liye (YouTube/Piped Proxy)
app.get('/api/videsi', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Bhai, gaane ka naam toh likh!" });

    try {
        const response = await axios.get(`https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(query)}&filter=music_songs`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Videsi server down hai." });
    }
});

// Route 3: YouTube ka Direct Audio Stream nikalne ke liye
app.get('/api/stream', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).json({ error: "Video ID missing!" });

    try {
        const response = await axios.get(`https://pipedapi.kavin.rocks/streams/${videoId}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Audio nikalne mein dikkat aayi." });
    }
});

// Server chalu karne ka command
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Nova Music Factory chal padi port ${PORT} par!`);
});
