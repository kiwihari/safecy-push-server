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

app.post("/api/send-location", async (req, res) => {
    const { token, lat, lng } = req.body;

    console.log(`Received location: ${lat},${lng}`);
    console.log(`Token: ${token}`);

    // Build FCM message
    const message = {
        token: token,
        notification: {
            title: "Location Received",
            body: `Lat: ${lat}, Lng: ${lng}`,
        },
        data: {
            lat: String(lat),
            lng: String(lng),
            type: "location-test",
        },
    };

    try {
        const response = await admin.messaging().send(message);
        console.log('Location Notification sent');
        res.status(200).send(`Notification sent: ${response}`);
    } catch (err) {
        console.error("Push error:", err.response?.data || err.message);
        res.status(500).json({ success: false, error: "Push failed" });
    }
});

const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (deg) => (deg * Math.PI) / 180;

    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // distance in km
};

app.post("/api/send-warning", async (req, res) => {
    try {
        const { token, lat, lng } = req.body;

        if (!token || !lat || !lng) {
            return res.status(400).json({ error: "token, lat, and lng are required" });
        }

        console.log(`Received location: ${lat},${lng}`);
        console.log(`Token: ${token}`);

        // 🎯 Impacted area (example: 37.4219, -122.084 near Google HQ)
        const targetLat = 37.4219983;
        const targetLng = -122.084;
        const radiusKm = 5; // 5 km radius

        const distance = haversineDistance(
            Number(lat),
            Number(lng),
            targetLat,
            targetLng
        );

        console.log(`Distance from target = ${distance.toFixed(2)} km`);

        if (distance <= radiusKm) {
            // User inside impacted area → send notification
            const message = {
                token: token,
                notification: {
                    title: "Alert: Impacted Area",
                    body: `You are within ${radiusKm} km of the impacted area.`,
                },
                data: {
                    lat: String(lat),
                    lng: String(lng),
                    type: "area-alert",
                    targetLat: String(targetLat),
                    targetLng: String(targetLng),
                    radiusKm: String(radiusKm),
                },
            };

            const response = await admin.messaging().send(message);
            console.log("Alert Notification sent:", response);

            return res.status(200).json({
                success: true,
                insideArea: true,
                distanceKm: distance,
                messageId: response,
            });
        } else {
            console.log("User outside impacted area, no notification sent.");
            return res.status(200).json({
                success: true,
                insideArea: false,
                distanceKm: distance,
                message: "User is outside impacted area.",
            });
        }
    } catch (err) {
        console.error("Push error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 3000;

// Listen on all network interfaces
app.listen(3000, "0.0.0.0", () => {
    console.log("🚀 Server running on port 3000");
});


