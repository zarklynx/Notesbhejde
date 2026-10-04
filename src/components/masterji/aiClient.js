import { auth } from '../../lib/firebase'

// Use our hosted AI by default. An explicit empty override uses the local API.
export const aiServer = (import.meta.env.VITE_MASTERJI_API_URL ?? 'https://notesbhejde-masterji.sundarful.workers.dev').replace(/\/$/, '')

export async function aiFetch(path, options = {}) {
  if (!auth?.currentUser) throw new Error('Please sign in before using Masterji.')
  const headers = new Headers(options.headers)
  headers.set('Authorization', `Bearer ${await auth.currentUser.getIdToken()}`)
  // Keep Aditya's file services on the Worker with his Cloudinary configuration.
  const server = path === '/api/notes/upload' || path === '/api/notes/delete'
    ? 'https://notesbhejde-masterji.notesbhejde.workers.dev' : aiServer
  return fetch(`${server}${path}`, { ...options, headers })
}
