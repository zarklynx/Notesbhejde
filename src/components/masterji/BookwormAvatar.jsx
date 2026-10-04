import { useEffect, useRef } from 'react'
import './masterji.css'

export default function BookwormAvatar({ mood = 'idle', trackCursor = false, actionId = 0 }) {
  const root = useRef(null)
  useEffect(() => {
    // Restart only finite reactions; preserve cursor tracking and book transitions.
    root.current.getAnimations({ subtree: true }).forEach(animation => {
      if (animation.effect.getTiming().iterations !== Infinity) animation.currentTime = 0
    })
  }, [actionId, mood])
  useEffect(() => {
    if (!trackCursor || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    function move(event) {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const bounds = root.current.getBoundingClientRect()
        // Coordinates are SVG units: use a stronger, bounded gaze even at icon size.
        const dx = (event.clientX - bounds.left - bounds.width * .52) / 95
        const dy = (event.clientY - bounds.top - bounds.height * .48) / 95
        const distance = Math.hypot(dx, dy)
        const strength = Math.tanh(distance)
        root.current.style.setProperty('--eye-x', `${distance ? dx / distance * strength * 8 : 0}px`)
        root.current.style.setProperty('--eye-y', `${distance ? dy / distance * strength * 8 : 0}px`)
      })
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => { window.removeEventListener('pointermove', move); cancelAnimationFrame(frame); root.current?.style.setProperty('--eye-x', '0px'); root.current?.style.setProperty('--eye-y', '0px') }
  }, [trackCursor])
  return <div ref={root} className={`bookworm-avatar bookworm-${mood}`}>
    <svg viewBox="0 0 240 250" role="img" aria-label={`Notebook Masterji, ${mood}`}>
      <ellipse className="bw-shadow" cx="120" cy="236" rx="78" ry="7" fill="#0b2239" opacity=".12" />
      <g className="mj-notebook-character">
        <g stroke="#234b43" strokeWidth="2.5" strokeLinejoin="round">
          <path d="m86 193-3 23h15l4-23m46 0 5 23h16l-5-23" fill="#0b2239" />
          <g className="mj-shoe-left"><path d="M76 214q12-8 25-1l3 20H62q-2-12 14-19" fill="#234b43" stroke="none" /><path d="M62 234h42" stroke="#cddbd0" strokeWidth="4" strokeLinecap="round" /></g>
          <g className="mj-shoe-right"><path d="M150 214q12-8 25 0 15 7 14 19h-43z" fill="#234b43" stroke="none" /><path d="M146 234h43" stroke="#cddbd0" strokeWidth="4" strokeLinecap="round" /></g>
          <path d="M50 147q-23-3-28 20l17 12 21-16" fill="#0b2239" />
          <g className="mj-page-stack" stroke="none">
            <path d="M61 61q7-23 64-24 48 0 63 20v13H61z" fill="#f3cbaa" />
            <path d="M65 57q55-13 122-2v9H63z" fill="#dfb58f" />
            <path d="M70 45q51-14 105 1M67 50q54-14 113 0M65 55q56-13 119-1M64 59q57-12 122-1" fill="none" stroke="#d1a783" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M69 43q54-14 108 4" fill="none" stroke="#ffe4cd" strokeWidth="2.5" strokeLinecap="round" />
          </g>
          <path d="M61 61q52-7 126-5 13 0 13 15v110q0 18-18 20l-121 2q-17 0-17-18V80q0-17 17-19" fill="#318c70" stroke="none" />
          <path d="M59 64v134q-15 0-15-14V80q0-14 15-16" fill="#23735c" stroke="none" />
          <g fill="#202124" stroke="none"><path d="M62 61q-20 5-25-7 5-4 12-2-7-10 1-13 13 3 15 17z" /><path d="M189 59q17 5 19-6-4-5-11-1 6-9-2-12-11 5-9 14z" /></g>
          <g fill="#9bc4b2" stroke="none">{[85, 119, 153].map(y => <rect key={y} x="36" y={y} width="19" height="6" rx="3" />)}</g>
        </g>
        <path className="bw-brow-left" d="M83 88q9-8 19-3" fill="none" stroke="#202124" strokeWidth="5" strokeLinecap="round" />
        <path className="bw-brow-right" d="M143 85q10-6 18 2" fill="none" stroke="#202124" strokeWidth="5" strokeLinecap="round" />
        <g className="mj-notebook-eyes"><g fill="#fbfaf5"><ellipse cx="98" cy="121" rx="20" ry="25" /><ellipse cx="153" cy="121" rx="20" ry="25" /></g><g className="bw-pupils" fill="#234b43"><ellipse cx="98" cy="121" rx="8" ry="12" /><ellipse cx="153" cy="121" rx="8" ry="12" /><g fill="white"><circle cx="101" cy="117" r="2.5" /><circle cx="156" cy="117" r="2.5" /></g></g></g>
        <g className="mj-low-glasses" fill="none" stroke="#e4cf90" strokeWidth="3" strokeLinecap="round"><ellipse cx="97" cy="142" rx="22" ry="17" /><ellipse cx="154" cy="142" rx="22" ry="17" /><path d="M119 140q6-4 13 0M75 140l-10-4m111 4 9-4" /></g>
        <ellipse cx="125" cy="140" rx="6" ry="4.5" fill="#e4cf90" />
        <path className="bw-mouth" d="M113 176q12 12 25-1" stroke="#062f2d" strokeWidth="3" fill="#fff1d5" />
        <g className="mj-speaking-mouth"><ellipse cx="125" cy="181" rx="10" ry="7" fill="#062f2d" /><ellipse cx="125" cy="185" rx="5" ry="2" fill="#e99783" /></g>
        <g className="mj-notebook-moustache"><path d="M125 153q-10-8-23 2-12 11-21 2-2 16 16 18 16 2 28-13 12 15 28 13 18-2 16-18-9 9-21-2-13-10-23-2" fill="#202124" /></g>
        <g className="mj-pointer-arm" stroke="#234b43" strokeWidth="2" strokeLinejoin="round"><path d="M197 150q19 8 20-15l15 4q-6 43-35 26" fill="#234b43" stroke="none" /><g className="mj-pointer"><path d="m214 142 18-89q1-5 5-3 2 1 1 5l-18 89z" fill="#b86b2d" stroke="none" /></g><path d="M216 126q-8-1-12 7-4 9 3 17 10 8 18-2 4-5 3-13-1-10-10-9" fill="#efbb91" /><path d="M210 136q7-2 10 3" fill="none" stroke="#c88e68" strokeWidth="1.5" /></g>
        <g className="mj-held-book" stroke="#234b43" strokeWidth="2" strokeLinejoin="round">
          <g className="mj-book-closed"><path d="m25 148 35-6 12 53-35 6z" fill="#b96535" /><path d="m60 143 6 2 12 47-6 3z" fill="#f4ecd8" /><path d="m30 153 9 41" stroke="#854422" fill="none" /></g>
          <g className="mj-book-open"><path d="M12 148q23-4 40 8 19-13 43-6l-9 44q-19-5-34 5-17-12-33-8z" fill="#b96535" /><path d="M14 142q24-4 39 10 20-13 39-8l-6 8q-18-5-33 6-18-10-35-7z" fill="#fff1d5" /><path d="m53 158-1 41" fill="none" /><g className="mj-book-text" stroke="#e3bd8d" strokeWidth="1.5"><path d="m24 160 19 5m-17 3 17 5m18-7 20-5m-20 13 18-5" /></g><path className="mj-turn-page" d="M53 157q12-24 31-24-9 20-31 24" fill="#fff1d5" strokeWidth="1.5" /></g>
          <path d="M33 169q-9-4-14 5-3 12 8 17 9 7 18 0l-1-6q-8 3-10-2 10 0 10-5-1-7-11-4z" fill="#efbb91" /><path d="m24 182 8 4" stroke="#c88e68" strokeWidth="1.5" fill="none" />
        </g>
        <g className="bw-idea" fill="#dfa73b"><path d="m200 28 3 8 8 3-8 3-3 8-3-8-8-3 8-3z" /><path d="m29 24 2 5 5 2-5 2-2 5-2-5-5-2 5-2z" /></g>
      </g>
      {/* Earlier prototype retained below only as a hidden design reference. */}
      <g display="none">
        <g className="bw-feet" stroke="#0b2239" strokeWidth="8" strokeLinecap="round"><path d="m51 157-10 19-14 0" /><path d="m131 157 8 19 13 0" /></g>
        <g className="bw-left-arm" stroke="#0b2239" strokeWidth="6" fill="none" strokeLinecap="round"><path d="m32 103-18 17 6 8" /></g>
        <rect x="26" y="32" width="135" height="136" rx="12" fill="#117a5a" stroke="#0b2239" strokeWidth="4" />
        <path d="M26 32h20v136H26z" fill="#075c43" />
        <path d="M35 46v101" stroke="#1e8d69" strokeWidth="2" />
        <g className="bw-pages"><path d="M48 21h100v11H48z" fill="#fff4d7" stroke="#0b2239" strokeWidth="3" /><path d="M53 26h89" stroke="#ceb985" strokeWidth="2" /></g>
        <path className="bw-brow-left" d="M64 58q12-10 23 0" fill="none" stroke="#0b2239" strokeWidth="5" strokeLinecap="round" />
        <path className="bw-brow-right" d="M107 58q12-10 23 0" fill="none" stroke="#0b2239" strokeWidth="5" strokeLinecap="round" />
        <g fill="#fff4d7"><circle cx="76" cy="82" r="18" /><circle cx="120" cy="82" r="18" /></g>
        <g className="bw-eyes"><g className="bw-pupils" fill="#0b2239"><ellipse cx="80" cy="83" rx="5" ry="6" /><ellipse cx="116" cy="83" rx="5" ry="6" /><g fill="white"><circle cx="81" cy="81" r="1.5" /><circle cx="117" cy="81" r="1.5" /></g></g></g>
        <g fill="none" stroke="#0b2239" strokeWidth="4"><circle cx="76" cy="82" r="18" /><circle cx="120" cy="82" r="18" /><path d="M94 79h8" /></g>
        <path className="bw-moustache" d="M98 108c-12-11-15 4-29 1 6 17 20 15 29 7 9 8 23 10 29-7-14 3-17-12-29-1" fill="#0b2239" />
        <path className="bw-mouth" d="M87 130q11 12 22 0" fill="none" stroke="#fff4d7" strokeWidth="4" strokeLinecap="round" />
        <g className="bw-pencil-arm"><path d="m153 103 15-15" stroke="#0b2239" strokeWidth="7" strokeLinecap="round" /><g className="bw-pencil"><path d="m169 87 4-23" stroke="#e1a348" strokeWidth="6" /><path d="m173 64 1-7 3 8" fill="#0b2239" /><path d="m168 89 1-5" stroke="#eeb1a1" strokeWidth="6" /></g></g>
        <g className="bw-idea" fill="#e1a348"><path d="m156 13 3 7 7 3-7 3-3 7-3-7-7-3 7-3z" /><path d="m20 47 2 5 5 2-5 2-2 5-2-5-5-2 5-2z" /></g>
      </g>
      <g className="bw-reading-lines" stroke="#117a5a" strokeWidth="2" strokeLinecap="round"><path d="M66 12h31" /><path d="M74 5h34" /></g>
    </svg>
  </div>
}
