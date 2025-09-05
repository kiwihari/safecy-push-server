const admin = require('firebase-admin');
const express = require('express');
const app = express();

admin.initializeApp({
    credential: admin.credential.cert(require('./service-account.json')),
});

app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST');
    next();
});

app.post('/api/save-token', (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).send('Token is required');
    }
    console.log('Received token:', token);
    res.status(200).send('Token saved');
});

app.post('/api/send-notification', async (req, res) => {
    const { type, targetLat, targetLng, radiusKm, title, body } = req.body;
    const token = req.headers['fcm-token'];

    if (!token) {
        return res.status(400).send('FCM token is required');
    }
    const message = {
        notification: {
            title: title || 'Default Title',
            body: `${body}.... Latitude value is ${targetLat} , Longitude value is ${targetLng} , Radius is ${radiusKm} and type is ${type}`,
        },
        data: {
            type: type || "",
            targetLat: targetLat?.toString() || "",
            targetLng: targetLng?.toString() || "",
            radiusKm: radiusKm?.toString() || "",
        },
        token: token,
    };
    try {
        const response = await admin.messaging().send(message);
        console.log('Notification sent:', response);
        res.status(200).send(`Notification sent: ${response}`);
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).send(`Error: ${error.message}`);
    }
});

const PORT = process.env.PORT || 3000;

// Listen on all network interfaces
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 FCM server listening on port ${PORT}`);
});

