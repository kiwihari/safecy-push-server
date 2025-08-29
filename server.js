const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Store the latest push token
let pushToken = null;

let savedTokens = [];

// Save token from client
app.post("/api/save-token", (req, res) => {
    const { token } = req.body;
    if (token && !savedTokens.includes(token)) {
        savedTokens.push(token);
        console.log("Saved token:", token);
    }
    res.json({ success: true });
});

// ---------------------------
// Register device push token
// ---------------------------
app.post('/register-token-safecy', (req, res) => {
    const { token } = req.body;

    // Validate Expo push token format
    if (!token) { //  || !/^ExponentPushToken\[[0-9a-zA-Z]{22}\]$/.test(token)
        console.error('Invalid token received:', token);
        return res.status(400).send('Invalid token format');
    }

    pushToken = token;
    console.log('Registered token:', pushToken);
    res.send('Token registered successfully');
});

// ---------------------------
// Send notification to registered token
// ---------------------------
app.post('/send-notification-safecy', async (req, res) => {
    const { title, body } = req.body;

    if (!title || !body) return res.status(400).send('Missing title or body');
    if (!pushToken) return res.status(400).send('No registered token');

    console.log(pushToken);
    try {
        // Build the message payload
        const message = {
            to: pushToken,
            sound: 'default',      // ensures Android notification shows with sound
            title,
            body,
            data: { example: 'extra info' },
        };

        // Send to Expo Push API
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([message]), // wrapped in array for batch send
        });
        console.log("response received", response);

        const result = await response.json();
        console.log('Expo Push response:', result);

        // Check for errors
        if (result.data[0]?.status === 'error') {
            console.error('Failed to send:', result.data[0]);
            return res.status(500).send(`Failed to send: ${result.data[0].message}`);
        }

        res.send('Notification sent successfully');
    } catch (error) {
        console.error('Error sending notification:', error.message);
        console.log(error.message);
        res.status(500).send('Error sending notification');
    }
});

// ---------------------------
// Start the server
// ---------------------------
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
