# Masterji cloud API

AI Worker origin: https://notesbhejde-masterji.sundarful.workers.dev

The frontend sends chat, OCR, validation and voice to the AI Worker. Uploads
and deletion remain on Aditya's https://notesbhejde-masterji.notesbhejde.workers.dev
Worker, with its existing Cloudinary configuration. Firebase login is required.

Local-only testing: leave VITE_MASTERJI_API_URL blank and set RUNWARE_API_KEY
in root .env.local. Run npm install and npm run dev.

Cloud testing: the frontend uses the Worker origin by default. No access code
or environment setup is needed. Do not use or share the Runware key in the browser.

Deployment: npx wrangler deploy --config masterji-worker/wrangler.jsonc
Secrets: RUNWARE_API_KEY via wrangler secret put.
Voice also requires GOOGLE_TTS_CREDENTIALS (service account JSON) as a Worker
secret and the VOICE_USAGE D1 binding. Initialize a new database using
voice-schema.sql. Never commit the service account JSON or any provider keys.
Voice defaults to Fenrir, then Neural2 C, then WaveNet C when the tracked
free budget is exhausted. D1 uses conservative rolling 32-day character caps.
Set FIREBASE_PROJECT_ID in wrangler.jsonc to the Firebase project ID before deployment.
Add the deployed frontend origin to ALLOWED_ORIGINS before using a new site.

Routes are POST /api/masterji, POST /api/masterji/ocr, POST /api/masterji/voice,
and POST /api/validate-note,
using the same bodies and responses as the local handlers. Note uploads and
deletes use POST /api/notes/upload and POST /api/notes/delete. GET /health is a
non-secret health check.
Requests require a verified Firebase ID token. The user/IP rate limit is
approximate and per location, not a global spending cap. Add durable per-user
usage accounting before opening the service to a large audience.
The main notes/login backend and API can stay independent of this Worker.
