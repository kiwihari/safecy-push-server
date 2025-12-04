import express from "express";
import admin from "firebase-admin";
import serviceAccount from "./service-account.json" with { type: "json" };

const app = express();
app.use(express.json());

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// Endpoint to send notification to all devices
app.post("/sendGlobalNotification", async (req, res) => {
    const { title_en, title_el, body_en, body_el, type, targetLat, targetLng, radiusKm } = req.body;

    if (!title_en || !title_el || !body_en || !body_el) {
        return res.status(400).json({ error: "title_en, title_el, body_en, and body_el are required" });
    }

    const timestamp = new Date().toISOString();

    // Message payload
    const message = {
        topic: "all_devices",
        data: {
            // Bilingual support
            title_en: title_en,
            title_el: title_el,
            body_en: body_en,
            body_el: body_el,

            // Location and metadata
            targetLat: targetLat.toString(),
            targetLng: targetLng.toString(),
            radiusKm: radiusKm.toString(),
            type: type,
            timestamp,
        },
        android: {
            priority: "high"
        },
        apns: {
            headers: {
                "apns-priority": "10"
            }
        }
    };

    try {
        const response = await admin.messaging().send(message);
        console.log("Notification sent to all devices", response);
        res.json({ success: true, response });
    } catch (err) {
        console.error("Error sending notification:", err);
        res.status(500).json({ error: "Failed to send notification" });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
