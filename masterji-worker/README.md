# Masterji cloud API

Worker origin: https://notesbhejde-masterji.sundarful.workers.dev

Local-only testing: leave VITE_MASTERJI_API_URL blank and set RUNWARE_API_KEY
in root .env.local. Run npm install and npm run dev.

Cloud testing: the frontend uses the Worker origin by default. No access code
or environment setup is needed. Do not use or share the Runware key in the browser.

Deployment: npx wrangler deploy --config masterji-worker/wrangler.jsonc
Secrets: RUNWARE_API_KEY via wrangler secret put.
Add the deployed frontend origin to ALLOWED_ORIGINS before using a new site.

Routes are POST /api/masterji and POST /api/masterji/ocr, using the same bodies
and responses as the local handlers. GET /health is a non-secret health check.
Hackathon mode: no authentication is required, so public requests can spend the
owner's Runware balance. The IP rate limit is approximate and per location,
not a global spending cap. Add verified login authorization before production.
The main notes/login backend and API can stay independent of this Worker.
