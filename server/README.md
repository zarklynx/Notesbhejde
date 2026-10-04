# Note study chat

Local development: enter a Runware key in the ignored root `.env.local` as
`RUNWARE_API_KEY`, then restart `npm run dev`. The Vite development middleware
serves `/api/masterji`; the key is never sent to the frontend. Model defaults to
`openai:gpt@5-nano`, configurable with `RUNWARE_MODEL`.

The client sends the current note's text plus a bounded conversation history.
PDF selectable text is extracted on demand in a lazy-loaded PDF.js worker and
reused for the open note. Limits: 20 MB, 100 pages, 28,000 extracted characters.
Scanned pages are rendered in the browser and sent through `/api/masterji/ocr`
to Runware GPT-5 Nano (maximum 10 pages). OCR incurs a per-page model call;
extracted text is reused while that note stays open. No local OCR engine is used.
Handwriting and diagrams may not be interpreted reliably. Failed extraction
produces an explicit error. Mount `createOcrHandler` at `/api/masterji/ocr` in
production with the same authentication and usage controls as the chat route.
Replies default to English unless another language is explicitly requested.
No chat is saved to storage.

For production, Vite's static build does not include this API middleware. Mount
`createMasterjiHandler` in the real backend at `/api/masterji`, set server secrets,
and add authentication, rate limits and per-user usage limits before public use.
The note validator is available at `/api/validate-note`; it uses the same Runware
configuration and returns a structured content-match result before note publishing.
The standalone `node server/masterji.js` process is a local-only adapter on 8787,
and requires environment variables provided by its launcher.

Run adapter tests with `node --test server/masterji.test.js`.
