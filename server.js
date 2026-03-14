const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors());
app.use(express.json());

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

app.post('/api/notifications/send', async (req, res) => {
    const { playerId, title, message, profilePic, url } = req.body;

    if (!playerId || !title || !message) {
        return res.status(400).json({ error: "Missing required data" });
    }

    try {
        const payload = {
            app_id: ONESIGNAL_APP_ID,
            include_player_ids: [playerId],

            headings: { en: title },

            // WhatsApp style preview
            contents: { en: `${title}: ${message}` },

            // profile image (circle avatar)
            large_icon: profilePic || undefined,

            // optional big preview image
            big_picture: profilePic || undefined,

            // open chat when notification clicked
            url: url || undefined,

            android_channel_id: "chat"
        };

        const response = await axios.post(
            'https://onesignal.com/api/v1/notifications',
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
                }
            }
        );

        res.status(200).json({
            success: true,
            message: "Notification sent successfully",
            data: response.data
        });

    } catch (error) {
        console.error("OneSignal Error:", error.response?.data || error.message);

        res.status(500).json({
            success: false,
            error: "Failed to send notification"
        });
    }
});

app.get('/', (req, res) => {
    res.send("CamCash Push Server is Active!");
});

module.exports = app;
