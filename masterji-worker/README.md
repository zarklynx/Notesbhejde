# Masterji cloud API

Worker origin: https://notesbhejde-masterji.notesbhejde.workers.dev

Local-only testing: leave VITE_MASTERJI_API_URL blank and set RUNWARE_API_KEY
in root .env.local. Run npm install and npm run dev.

Cloud testing: the frontend uses the Worker origin by default. No access code
or environment setup is needed. Do not use or share the Runware key in the browser.

Deployment: npx wrangler deploy --config masterji-worker/wrangler.jsonc
Secrets: RUNWARE_API_KEY via wrangler secret put.
Set FIREBASE_PROJECT_ID in wrangler.jsonc to the Firebase project ID before deployment.
Add the deployed frontend origin to ALLOWED_ORIGINS before using a new site.

Routes are POST /api/masterji, POST /api/masterji/ocr, and POST /api/validate-note,
using the same bodies and responses as the local handlers. Note uploads and
deletes use POST /api/notes/upload and POST /api/notes/delete. GET /health is a
non-secret health check.
Requests require a verified Firebase ID token. The user/IP rate limit is
approximate and per location, not a global spending cap. Add durable per-user
usage accounting before opening the service to a large audience.
The main notes/login backend and API can stay independent of this Worker.
