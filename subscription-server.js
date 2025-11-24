import express from "express";
import admin from "firebase-admin";
import cors from "cors";
import serviceAccount from "./service-account.json" with { type: "json" };

const app = express();
app.use(express.json());
app.use(cors());

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// Endpoint to send notification to all devices
app.post("/sendGlobalNotification", async (req, res) => {
    const { title, body, type, targetLat, targetLng, radiusKm } = req.body;

    if (!title || !body) {
        return res.status(400).json({ error: "title and body are required" });
    }

    const timestamp = new Date().toISOString();

    // Message payload
    const message = {
        topic: "all_devices",
        data: {
            title: title || 'Default Title',
            body: `${body}.... Latitude value is ${targetLat} , Longitude value is ${targetLng} , Radius is ${radiusKm} and type is ${type}`,
            targetLat: targetLat.toString(),
            targetLng: targetLng.toString(),
            radiusKm: radiusKm.toString(),
            type: type,
            timestamp,
        },
    };

    try {
        const response = await admin.messaging().send(message);
        console.log("Notification sent to all devices");
        res.json({ success: true, response });
    } catch (err) {
        console.error("Error sending notification:", err);
        res.status(500).json({ error: "Failed to send notification" });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
