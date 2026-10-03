// Use our hosted AI by default. An explicit empty override uses the local API.
export const aiServer = (import.meta.env.VITE_MASTERJI_API_URL ?? 'https://notesbhejde-masterji.sundarful.workers.dev').replace(/\/$/, '')

export function aiFetch(path, options) {
  return fetch(`${aiServer}${path}`, options)
}
