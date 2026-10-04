import { useState } from 'react'

export const PROFILE_AVATARS = [
  { id: 'notebook', name: 'Notebook buddy', color: '#e1f4e8' },
  { id: 'pencil', name: 'Bright pencil', color: '#fff0cc' },
  { id: 'owl', name: 'Night owl', color: '#eae5ff' },
  { id: 'graduate', name: 'Little scholar', color: '#deefff' },
  { id: 'plant', name: 'Growing mind', color: '#e8f4d9' },
  { id: 'robot', name: 'Code companion', color: '#d9f3ef' },
  { id: 'coffee', name: 'Study fuel', color: '#fce7de' },
  { id: 'star', name: 'Curious star', color: '#fff3d4' },
]

function pickAvatar(userId) {
  let hash = 0
  for (const letter of String(userId || 'student')) hash = (Math.imul(hash, 31) + letter.charCodeAt(0)) >>> 0
  return PROFILE_AVATARS[hash % PROFILE_AVATARS.length]
}

function Face({ y = 55, glasses = false }) {
  return <g stroke="#203b35" strokeWidth="2.5" strokeLinecap="round" fill="none">
    <path d={`M43 ${y}v2 M57 ${y}v2`} />
    <path d={`M45 ${y + 10}q5 5 10 0`} />
    {glasses && <><circle cx="43" cy={y + 1} r="7" /><circle cx="57" cy={y + 1} r="7" /><path d={`M50 ${y + 1}h0`} /></>}
    <path d={`M35 ${y + 7}h3 M62 ${y + 7}h3`} stroke="#efac9a" />
  </g>
}

function Illustration({ kind }) {
  const outline = { stroke: '#203b35', strokeWidth: 2.5, strokeLinejoin: 'round', strokeLinecap: 'round' }
  switch (kind) {
    case 'pencil': return <><g transform="rotate(12 50 50)" {...outline}><path d="M37 27h26v43L50 84 37 70Z" fill="#f9c75b" /><path d="M37 27v-8q13-10 26 0v8" fill="#eea08e" /><path d="M37 29h26M45 32v13M55 32v13" fill="none" /><path d="m37 70 13 14 13-14" fill="#fce3be" /><path d="m45 79 5 5 5-5" fill="#203b35" /></g><Face y={52} /></>
    case 'owl': return <><g {...outline}><path d="m26 43-1-21 17 12q8-3 16 0l17-12-1 21q11 38-24 39T26 43" fill="#9c8dc8" /><path d="M29 51q-8 16 0 22M71 51q8 16 0 22" fill="none" /><ellipse cx="39" cy="51" rx="12" ry="14" fill="#fff9eb" /><ellipse cx="61" cy="51" rx="12" ry="14" fill="#fff9eb" /><path d="m45 62 5 7 5-7" fill="#f9c75b" /><path d="M38 83h8M54 83h8" /></g><circle cx="40" cy="51" r="3" fill="#203b35" /><circle cx="60" cy="51" r="3" fill="#203b35" /></>
    case 'graduate': return <><g {...outline}><circle cx="50" cy="55" r="25" fill="#f2c6a3" /><path d="M33 78q17-8 34 0l6 13H27Z" fill="#4787a7" /><path d="M28 38v-8h44v8q-22 10-44 0" fill="#367060" /><path d="m50 16 35 13-35 13-35-13Z" fill="#254e43" /><path d="M83 30v18" fill="none" /><path d="M80 48h6v8h-6Z" fill="#f9c75b" /></g><Face y={53} /></>
    case 'plant': return <><g {...outline}><path d="M50 49V26" fill="none" /><path d="M50 37q-28 1-26-21 27-2 26 21" fill="#73b879" /><path d="M50 31q0-25 26-21 0 23-26 21" fill="#398761" /><path d="m26 47 7 35h34l7-35Z" fill="#d79973" /><path d="M24 44h52v8H24Z" fill="#e8b38e" /></g><Face y={61} /></>
    case 'robot': return <><g {...outline}><path d="M50 29V17" fill="none" /><circle cx="50" cy="14" r="5" fill="#f9c75b" /><rect x="24" y="30" width="52" height="48" rx="13" fill="#83beba" /><path d="M24 48h-7v15h7M76 48h7v15h-7" fill="#4a938b" /><rect x="31" y="39" width="38" height="29" rx="10" fill="#f4fff5" /><path d="M38 79v7M62 79v7" /></g><Face y={47} /></>
    case 'coffee': return <><g {...outline}><path d="M68 40h7q21 0 12 22-4 8-17 5" fill="none" /><path d="M25 38h47v31q0 14-23 14T25 69Z" fill="#fff9eb" /><path d="M22 84h54" fill="none" /><path d="M36 29q-8-7 0-15M51 28q-8-7 0-15M65 29q-8-7 0-15" stroke="#aa8069" fill="none" /></g><Face y={53} /></>
    case 'star': return <><path d="m50 15 11 22 25 4-18 18 4 26-22-12-22 12 4-26-18-18 25-4Z" fill="#f5c65d" {...outline} /><Face y={49} /><path d="M19 17v9M15 21h8M80 73v9M76 77h8" {...outline} stroke="#cf9d2c" fill="none" /></>
    default: return <><g {...outline}><rect x="26" y="19" width="49" height="64" rx="9" fill="#42966c" /><path d="M66 24v54" stroke="#79b58e" /><path d="M22 30h10M22 43h10M22 56h10M22 69h10" stroke="#254e43" /><path d="M39 26h17" stroke="#d3ead6" /></g><Face y={49} glasses /></>
  }
}

/** Tiny, motion-free defaults. A saved variant wins; otherwise the user ID selects a stable buddy. */
export default function ProfileAvatar({ userId, variant, photoURL, size = 40, label = 'Student profile', className = '', style }) {
  const [failedPhoto, setFailedPhoto] = useState(null)
  const choice = PROFILE_AVATARS.find(item => item.id === variant) || pickAvatar(userId)
  const dimensions = { width: size, height: size, minWidth: size, borderRadius: '50%', display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }
  if (photoURL && photoURL !== failedPhoto) return <img src={photoURL} alt={label} className={className} style={{ ...dimensions, objectFit: 'cover' }} onError={() => setFailedPhoto(photoURL)} referrerPolicy="no-referrer" />
  return <svg viewBox="0 0 100 100" role="img" aria-label={label} className={className} style={dimensions} xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" fill={choice.color} /><Illustration kind={choice.id} /></svg>
}
