import { Buffer } from 'node:buffer'

export const voices = [
  { name: 'en-IN-Chirp3-HD-Fenrir', family: 'chirp', budget: 900000 },
  { name: 'en-IN-Neural2-C', family: 'neural', budget: 900000 },
  { name: 'en-IN-Wavenet-C', family: 'wavenet', budget: 3600000 },
]
export const chirpChoices = ['Charon', 'Algieba', 'Fenrir', 'Orus', 'Puck', 'Achird']

async function accessToken(credentials) {
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url')
  const now = Math.floor(Date.now() / 1000)
  const unsigned = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({ iss: credentials.client_email, scope: 'https://www.googleapis.com/auth/cloud-platform', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })}`
  const pem = credentials.private_key.replace(/-----[^-]+-----|\s/g, '')
  const key = await crypto.subtle.importKey('pkcs8', Buffer.from(pem, 'base64'), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign'])
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned))
  const response = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${Buffer.from(signature).toString('base64url')}` }), signal: AbortSignal.timeout(15000) })
  if (!response.ok) throw new Error('Google voice authentication failed.')
  return (await response.json()).access_token
}

export async function googleVoice(text, env, choice) {
  if (!env.GOOGLE_TTS_CREDENTIALS || !env.VOICE_USAGE) throw new Error('Google voice is not configured.')
  // A rolling 32-day window is deliberately stricter than a billing month,
  // avoiding timezone/reset-boundary overspending. The legacy column stores days.
  const month = new Date().toISOString().slice(0, 10)
  const cutoff = new Date(Date.now() - 32 * 86400000).toISOString().slice(0, 10)
  const characters = Array.from(text).length
  const token = await accessToken(JSON.parse(env.GOOGLE_TTS_CREDENTIALS))
  const selected = choice ? [{ ...voices[0], name: `en-IN-Chirp3-HD-${choice}` }] : voices
  for (const voice of selected) {
    const result = await env.VOICE_USAGE.batch([
      env.VOICE_USAGE.prepare('INSERT OR IGNORE INTO voice_usage(month, family, characters) VALUES (?, ?, 0)').bind(month, voice.family),
      env.VOICE_USAGE.prepare('UPDATE voice_usage SET characters = characters + ? WHERE month = ? AND family = ? AND (SELECT COALESCE(SUM(characters), 0) FROM voice_usage WHERE family = ? AND (month >= ? OR length(month) = 7)) + ? <= ?').bind(characters, month, voice.family, voice.family, cutoff, characters, voice.budget),
    ])
    if (!result[1].meta.changes) continue
    // Keep reservations on uncertain failures: never accidentally overspend through retries.
    const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: { text }, voice: { languageCode: 'en-IN', name: voice.name }, audioConfig: { audioEncoding: 'MP3' } }),
      signal: AbortSignal.timeout(30000),
    })
    if (!response.ok) throw new Error(`Google voice request failed (${response.status}). Please retry later.`)
    const data = await response.json()
    if (!data.audioContent) throw new Error('Google returned no audio.')
    return { audio: Buffer.from(data.audioContent, 'base64'), voice: voice.name }
  }
  throw new Error('Monthly free voice budgets reached. Text chat still works.')
}
