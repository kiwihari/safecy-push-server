const admin = require('firebase-admin');
const express = require('express');

console.log("Initializing....");

const serviceAccount = JSON.parse(
    Buffer.from(process.env.SERVICE_ACCOUNT, 'base64').toString('utf8')
);

console.log("Service account created...");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// admin.initializeApp({
//     credential: admin.credential.cert(require('./service-account.json')),
// });

const app = express();

app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST');
    next();
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

module.exports=app;


