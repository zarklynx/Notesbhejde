import { useEffect, useRef } from 'react'
import './masterji.css'

export default function MasterjiAvatar({ mood = 'idle', className = '', trackCursor = false }) {
  const avatar = useRef(null)
  useEffect(() => {
    if (!trackCursor || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    const move = (event) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const bounds = avatar.current.getBoundingClientRect()
        avatar.current.style.setProperty('--eye-x', `${Math.max(-4, Math.min(4, (event.clientX - bounds.left - bounds.width / 2) / 70))}px`)
        avatar.current.style.setProperty('--eye-y', `${Math.max(-3, Math.min(3, (event.clientY - bounds.top - bounds.height / 2) / 70))}px`)
      })
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => { window.removeEventListener('pointermove', move); cancelAnimationFrame(frame) }
  }, [trackCursor])
  function followPointer(event) {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = Math.max(-3, Math.min(3, (event.clientX - bounds.left - bounds.width / 2) / 25))
    const y = Math.max(-2, Math.min(2, (event.clientY - bounds.top - bounds.height / 2) / 30))
    avatar.current.style.setProperty('--eye-x', `${x}px`)
    avatar.current.style.setProperty('--eye-y', `${y}px`)
  }
  function resetEyes() {
    avatar.current.style.setProperty('--eye-x', '0px')
    avatar.current.style.setProperty('--eye-y', '0px')
  }
  return (
    <div ref={avatar} className={`masterji-avatar masterji-${mood} ${className}`} onPointerMove={trackCursor ? undefined : followPointer} onPointerLeave={trackCursor ? undefined : resetEyes}>
      <svg viewBox="0 0 160 170" role="img" aria-label={`Masterji, ${mood === 'idle' ? 'your friendly study teacher' : mood}`}>
        <ellipse className="mj-shadow" cx="80" cy="155" rx="49" ry="6" fill="#183b34" opacity=".12" />
        <g className="mj-body">
          <path d="M31 148c0-31 18-46 49-46s49 15 49 46v5H31z" fill="#166653" />
          <path d="m64 106 16 16 16-16-5-10H69z" fill="#f4b884" />
          <path d="m64 106 16 16-11 12-14-24zm32 0-16 16 11 12 14-24z" fill="#fcf4dc" />
          <path d="M80 124v29" stroke="#0a4c3e" strokeWidth="3" />
          <circle cx="86" cy="139" r="2" fill="#e7c58e" />
          <path d="M105 135h13v12h-13z" fill="#115441" />
          <path d="m110 135 1-15" stroke="#edb44f" strokeWidth="4" strokeLinecap="round" />
        </g>
        <g className="mj-head">
          <ellipse cx="34" cy="75" rx="9" ry="13" fill="#eaa675" />
          <ellipse cx="126" cy="75" rx="9" ry="13" fill="#eaa675" />
          <path d="M35 49c0-28 90-29 90 0v33c0 24-20 39-45 39S35 106 35 82z" fill="#f5bd8e" />
          <path d="M34 62c-9-31 10-49 31-44 11-16 44-7 47 5 19 1 21 26 13 39l-7-23c-17 5-36-1-43-8-8 12-22 14-34 13z" fill="#293c38" />
          <path d="M59 23c5-3 12-3 17-1" stroke="#64776b" strokeWidth="4" strokeLinecap="round" />
          <path className="mj-brow mj-brow-left" d="m47 57 19-2" stroke="#293c38" strokeWidth="4" strokeLinecap="round" />
          <path className="mj-brow mj-brow-right" d="m94 55 19 2" stroke="#293c38" strokeWidth="4" strokeLinecap="round" />
          <g className="mj-eyes">
            <ellipse cx="58" cy="72" rx="13" ry="11" fill="#fff9ed" />
            <ellipse cx="102" cy="72" rx="13" ry="11" fill="#fff9ed" />
            <g className="mj-pupils"><ellipse cx="60" cy="73" rx="4" ry="5" fill="#293c38" /><ellipse cx="100" cy="73" rx="4" ry="5" fill="#293c38" /><circle cx="61" cy="71" r="1.3" fill="white" /><circle cx="101" cy="71" r="1.3" fill="white" /></g>
          </g>
          <g fill="none" stroke="#293c38" strokeWidth="3.5"><rect x="41" y="61" width="34" height="25" rx="10" /><rect x="85" y="61" width="34" height="25" rx="10" /><path d="M75 69q5-4 10 0M34 64l7 3m78 0 7-3" /></g>
          <path d="M78 76v10q2 3 6 0" fill="none" stroke="#d99065" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="47" cy="92" rx="7" ry="4" fill="#e79a77" opacity=".55" /><ellipse cx="113" cy="92" rx="7" ry="4" fill="#e79a77" opacity=".55" />
          <path className="mj-smile" d="M69 101q11 10 22 0" fill="none" stroke="#914e3d" strokeWidth="3" strokeLinecap="round" />
          <path d="M80 91c-9-7-12 4-22 3 3 10 15 10 22 3 7 7 19 7 22-3-10 1-13-10-22-3" fill="#293c38" />
        </g>
        <g className="mj-thought" fill="#e7b548"><circle cx="128" cy="41" r="4" /><circle cx="138" cy="29" r="6" /><circle cx="143" cy="12" r="8" /></g>
        <g className="mj-spark" fill="#e7b548"><path d="m134 30 3 9 9 3-9 3-3 9-3-9-9-3 9-3z" /><path d="m25 37 2 6 6 2-6 2-2 6-2-6-6-2 6-2z" /></g>
      </svg>
    </div>
  )
}
