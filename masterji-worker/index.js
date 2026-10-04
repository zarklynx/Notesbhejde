import { Buffer } from 'node:buffer'
import { createMasterjiHandler } from '../server/masterji.js'
import { createOcrHandler } from '../server/ocr.js'
import { createNoteValidator } from '../server/noteValidator.js'
import { verifyFirebaseToken } from './firebaseAuth.js'
import { deleteCloudinaryFile, uploadCloudinaryFile } from './cloudinary.js'

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname
    const origin = request.headers.get('Origin')
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').includes(origin)
    const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Vary': 'Origin' }
    if (allowed) Object.assign(headers, { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' })
    const reply = (status, body) => new Response(JSON.stringify(body), { status, headers })
    if (path === '/health' && request.method === 'GET') return reply(200, { ok: true })
    if (!['/api/masterji', '/api/masterji/ocr', '/api/validate-note', '/api/notes/upload', '/api/notes/delete'].includes(path)) return reply(404, { error: 'Not found.' })
    if (origin && !allowed) return reply(403, { error: 'Website origin not allowed.' })
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers })
    if (request.method !== 'POST') return reply(405, { error: 'Use POST.' })
    const authorization = request.headers.get('Authorization') || ''
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
    let user
    try {
      user = await verifyFirebaseToken(token, env.FIREBASE_PROJECT_ID)
    } catch {
      return reply(401, { error: 'Please sign in before using Masterji.' })
    }
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
    const limited = await env.AI_LIMIT.limit({ key: `${user.sub}:${ip}` })
    if (!limited.success) return reply(429, { error: 'Too many requests. Try again in a minute.' })
    if (path === '/api/notes/upload') {
      const result = await uploadCloudinaryFile(request, env, user)
      return reply(result.status, result.body)
    }
    if (path === '/api/notes/delete') {
      const result = await deleteCloudinaryFile(request, env, user)
      return reply(result.status, result.body)
    }
    try {
      // Reuse the same bounded validators and provider handlers as local development.
      const req = {
        method: 'POST', headers: { authorization },
        async *[Symbol.asyncIterator]() {
          for await (const chunk of request.body) yield Buffer.from(chunk)
        },
      }
      let status = 500, body = '{}'
      const res = { writeHead(code) { status = code }, end(value) { body = value } }
      const handler = path.endsWith('/ocr')
        ? createOcrHandler({ apiKey: env.RUNWARE_API_KEY })
        : path === '/api/validate-note'
          ? createNoteValidator({ apiKey: env.RUNWARE_API_KEY })
          : createMasterjiHandler({ apiKey: env.RUNWARE_API_KEY })
      await handler(req, res)
      return new Response(body, { status, headers })
    } catch { return reply(502, { error: 'AI service unavailable. Please retry.' }) }
  },
}
