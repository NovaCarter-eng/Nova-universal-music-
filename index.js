const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

// Engine Check Route
app.get('/', (req, res) => {
    res.json({ status: "Active", message: "Nova Global Engine is 100% Running!" });
});

// Asli Search API (Multi-Source Fallback)
app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.json({ success: false, message: "Bhai gaane ka naam toh likh (q parameter required)" });
    }

    try {
        // ENGINE 1: Primary Global Stream (High Quality)
        const res1 = await axios.get(`https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}`);
        
        if (res1.data && res1.data.success && res1.data.data.results.length > 0) {
            // Frontend ke liye data ekdum simple aur clean kar diya hai
            const songs = res1.data.data.results.map(song => ({
                title: song.name,
                artist: song.artists.primary[0]?.name || "Unknown Artist",
                image: song.image[2]?.url || song.image[0]?.url,
                audioUrl: song.downloadUrl[4]?.url || song.downloadUrl[0]?.url,
                source: "Primary Engine"
            }));
            return res.json({ success: true, data: songs });
        } else {
            throw new Error("Engine 1 par gaana nahi mila.");
        }

    } catch (error) {
        console.log("Primary fail hua, Engine 2 (Fallback) chal raha hai...");
        
        try {
            // ENGINE 2: Fallback Global API (Agar pehla fail ho jaye)
            const res2 = await axios.get(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=10`);
            
            if (res2.data && res2.data.results.length > 0) {
                const songs = res2.data.results.map(song => ({
                    title: song.trackName,
                    artist: song.artistName,
                    image: song.artworkUrl100,
                    audioUrl: song.previewUrl,
                    source: "Fallback Engine"
                }));
                return res.json({ success: true, data: songs });
            } else {
                return res.json({ success: false, message: "Dono engines fail. Gaana internet par nahi mila." });
            }
        } catch (err2) {
            return res.status(500).json({ success: false, message: "Server API error." });
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Nova Music Server running on port ${PORT}`);
});
