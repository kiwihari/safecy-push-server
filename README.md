# SafeCY Push Server - Bilingual Notifications

## Quick Start

```bash
npm install
node subscription-server.js
```

Server runs on `http://localhost:3000`

## Send Bilingual Notification

### Endpoint
`POST http://localhost:3000/sendGlobalNotification`

### Request Body (JSON)

```json
{
  "title_en": "FIRE ALERT",
  "title_el": "ΣΥΝΑΓΕΡΜΟΣ ΦΩΤΙΑΣ",
  "body_en": "Fire reported near Limassol city center. Seek shelter immediately.",
  "body_el": "Πυρκαγιά αναφέρθηκε κοντά στο κέντρο της Λεμεσού. Αναζητήστε καταφύγιο αμέσως.",
  "type": "emergency",
  "targetLat": "34.6851",
  "targetLng": "33.0443",
  "radiusKm": "5.0"
}
```

### Required Fields

- `title_en` (string) - English title
- `title_el` (string) - Greek title
- `body_en` (string) - English message body
- `body_el` (string) - Greek message body
- `type` (string) - Notification type (e.g., "emergency")
- `targetLat` (string) - Latitude of incident
- `targetLng` (string) - Longitude of incident
- `radiusKm` (string) - Radius in kilometers

### Example with curl

```bash
curl -X POST http://localhost:3000/sendGlobalNotification \
  -H "Content-Type: application/json" \
  -d @example-request.json
```

### Example with PowerShell

```powershell
$body = Get-Content example-request.json -Raw
Invoke-RestMethod -Uri "http://localhost:3000/sendGlobalNotification" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

## Notification Templates

### Fire Alert

```json
{
  "title_en": "FIRE ALERT",
  "title_el": "ΣΥΝΑΓΕΡΜΟΣ ΦΩΤΙΑΣ",
  "body_en": "Fire reported in {location}. Seek shelter immediately.",
  "body_el": "Πυρκαγιά αναφέρθηκε στην περιοχή {location}. Αναζητήστε καταφύγιο αμέσως.",
  "type": "fire",
  "targetLat": "34.6851",
  "targetLng": "33.0443",
  "radiusKm": "5.0"
}
```

### Earthquake Alert

```json
{
  "title_en": "EARTHQUAKE ALERT",
  "title_el": "ΣΥΝΑΓΕΡΜΟΣ ΣΕΙΣΜΟΥ",
  "body_en": "Earthquake detected. Magnitude 5.2. Drop, cover, and hold on.",
  "body_el": "Σεισμός ανιχνεύθηκε. Μέγεθος 5.2. Πέστε, καλυφθείτε και κρατηθείτε.",
  "type": "earthquake",
  "targetLat": "35.1264",
  "targetLng": "33.4299",
  "radiusKm": "10.0"
}
```

### General Emergency

```json
{
  "title_en": "EMERGENCY ALERT",
  "title_el": "ΣΥΝΑΓΕΡΜΟΣ ΕΚΤΑΚΤΗΣ ΑΝΑΓΚΗΣ",
  "body_en": "Emergency situation in {location}. Follow safety instructions.",
  "body_el": "Έκτακτη ανάγκη στην περιοχή {location}. Ακολουθήστε τις οδηγίες ασφαλείας.",
  "type": "emergency",
  "targetLat": "34.9166",
  "targetLng": "33.6283",
  "radiusKm": "3.0"
}
```

## Response

### Success (200)
```json
{
  "success": true,
  "response": "projects/safecy-app/messages/0:1234567890"
}
```

### Error (400)
```json
{
  "error": "title_en, title_el, body_en, and body_el are required"
}
```

### Error (500)
```json
{
  "error": "Failed to send notification"
}
```

## How It Works

1. **Backend receives** bilingual request
2. **FCM sends** to topic `all_devices` with high priority
3. **Android app** receives notification (even in doze mode)
4. **Native module** reads user's language preference from SharedPreferences
5. **Notification displays** in correct language:
   - Greek users see `title_el` and `body_el`
   - English users see `title_en` and `body_en`

## Testing

1. **Start server:**
   ```bash
   node subscription-server.js
   ```

2. **Send test notification:**
   ```bash
   curl -X POST http://localhost:3000/sendGlobalNotification \
     -H "Content-Type: application/json" \
     -d @example-request.json
   ```

3. **Verify on device:**
   - Greek language -> Should see Greek notification
   - English language -> Should see English notification

## See Also

- [Mobile App Documentation](../ccdExp/docs/FCM_NOTIFICATION_LOCALIZATION.md)
- [Android Architecture](../ccdExp/docs/ANDROID_ARCHITECTURE.md)
