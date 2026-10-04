# Notesbhejde

## Run locally

Run `npm install`, then `npm run dev`. Masterji connects to our hosted AI automatically; no API URL, access code, or Runware key needs configuring. Open a note and ask Masterji.

## Firebase setup

Create a Firebase Web app, enable Email/Password Authentication, and create
Firestore. Copy `.env.example` to `.env.local` and fill the `VITE_FIREBASE_*`
values from the Firebase console. Cloudinary stores uploaded note files so
Firebase Storage billing is not required.

Deploy rules and indexes from this directory with the Firebase CLI after selecting
your project: `firebase use <project-id>` followed by `firebase deploy --only
firestore:rules,firestore:indexes`.

The Masterji Worker also requires the same Firebase project ID in
`masterji-worker/wrangler.jsonc`. Cloudinary and Runware secrets are configured
with `wrangler secret put`; never commit those values.

AI, note uploads, and file deletion require a verified Firebase login. The Worker
limits requests by authenticated user and IP address. Never commit provider keys.

For a separate local AI API, copy `.env.example` to `.env.local`, add your Runware key, and uncomment the empty `VITE_MASTERJI_API_URL` override. See the AI backend documentation for setup.

## Frontend tooling

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
