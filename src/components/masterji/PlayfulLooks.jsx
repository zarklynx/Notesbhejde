export default function PlayfulLooks({ variant }) {
  const ink = '#0b2239', green = '#117a5a', cream = '#fff4d7'
  if (variant === 'book') return <svg viewBox="0 0 180 190" role="img" aria-label="Bookworm Masterji">
    <path d="m40 159-16 19m112-19 18 19" stroke={ink} strokeWidth="8" strokeLinecap="round" />
    <rect x="26" y="32" width="135" height="136" rx="12" fill={green} stroke={ink} strokeWidth="4" /><path d="M26 32h20v136H26z" fill="#075c43" /><path d="M48 21h100v11H48z" fill={cream} stroke={ink} strokeWidth="3" />
    <path d="M64 58q12-10 23 0m20 0q12-10 23 0" fill="none" stroke={ink} strokeWidth="5" strokeLinecap="round" />
    <g fill={cream} stroke={ink} strokeWidth="4"><circle cx="76" cy="82" r="18" /><circle cx="120" cy="82" r="18" /><path d="M94 79h8" /></g><circle cx="80" cy="83" r="5" fill={ink} /><circle cx="116" cy="83" r="5" fill={ink} />
    <path d="M98 108c-12-11-15 4-29 1 6 17 20 15 29 7 9 8 23 10 29-7-14 3-17-12-29-1" fill={ink} /><path d="M87 130q11 12 22 0" fill="none" stroke={cream} strokeWidth="4" strokeLinecap="round" />
    <path d="m32 103-18 17m143-17 18-15" stroke={ink} strokeWidth="7" strokeLinecap="round" /><path d="m170 85 3-23" stroke="#e1a348" strokeWidth="5" />
  </svg>
  if (variant === 'badge') return <svg viewBox="0 0 180 190" role="img" aria-label="Minimal Masterji">
    <circle cx="90" cy="95" r="74" fill={green} /><path d="M40 164q4-38 50-38t50 38" fill={cream} /><path d="M61 112h58v34q-29 21-58 0z" fill="#d79264" /><rect x="44" y="43" width="92" height="88" rx="37" fill="#f4bb8a" />
    <path d="M43 68q-5-37 34-39 24-16 45 8 18 4 15 34-14-3-20-22-13 19-40 9-14 14-34 10" fill={ink} />
    <g stroke={ink} strokeWidth="5" fill={cream}><circle cx="67" cy="84" r="17" /><circle cx="113" cy="84" r="17" /><path d="M84 83h12" /></g><circle cx="68" cy="84" r="5" fill={ink} /><circle cx="112" cy="84" r="5" fill={ink} />
    <path d="M90 104q-11-10-28 4 10 18 28 5 18 13 28-5-17-14-28-4" fill={ink} /><path d="m74 139 16 12 16-12" fill="none" stroke={green} strokeWidth="5" />
  </svg>
  return <svg viewBox="0 0 180 190" role="img" aria-label="Chalkboard comedian Masterji">
    <path d="M47 177v-42q0-25 43-25t43 25v42" fill={green} stroke={ink} strokeWidth="4" /><path d="m74 112 16 17 16-17" fill={cream} /><path d="m85 130 10 0 6 37-11 10-11-10z" fill="#e5ad45" />
    <ellipse cx="38" cy="77" rx="9" ry="14" fill="#df9c68" /><ellipse cx="137" cy="77" rx="9" ry="14" fill="#df9c68" /><path d="M40 47q50-34 95 0v40q-3 34-45 39-45-4-50-39z" fill="#f2b67d" stroke={ink} strokeWidth="3" />
    <path d="M41 56q-9-31 18-38l7 19 12-26 8 25 18-23 1 23 22-10 8 30q-53-12-94 0" fill={ink} /><path d="m51 61 24 5m29-5 20-9" stroke={ink} strokeWidth="5" strokeLinecap="round" />
    <g fill={cream} stroke={ink} strokeWidth="4"><rect x="45" y="70" width="35" height="24" rx="7" /><rect x="99" y="62" width="32" height="25" rx="7" /><path d="m80 78 19-5" /></g><circle cx="66" cy="79" r="4" fill={ink} /><circle cx="114" cy="72" r="4" fill={ink} />
    <path d="m89 78-8 20 18-2" fill="#df9c68" /><path d="M91 100q-18-5-29 9 19 10 29-1 14 8 31-3-17-12-31-5" fill={ink} /><path d="M92 116q10 0 14-6" stroke="#90442e" strokeWidth="3" fill="none" />
    <path d="m133 139 25-19" stroke={ink} strokeWidth="8" strokeLinecap="round" /><path d="m153 119 13-14" stroke={cream} strokeWidth="6" strokeLinecap="round" /><path d="M27 123h31v36H27z" fill={cream} stroke={ink} strokeWidth="3" /><text x="35" y="148" fontSize="19" fill={green} fontFamily="sans-serif" fontWeight="bold">A+</text>
  </svg>
}
