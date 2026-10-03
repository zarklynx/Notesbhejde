const ink = '#0b2239';
const green = '#117a5a';
const cream = '#fff1d5';
const gold = '#e5b443';

export default function ModernLooks({ variant }) {
  return <svg viewBox="0 0 180 190" role="img" aria-label={`${variant} Masterji character`} xmlns="http://www.w3.org/2000/svg">
    {variant === 'cool' && <g stroke={ink} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M32 180v-22q0-32 37-36h42q37 4 37 36v22" fill={green}/>
      <path d="M69 120l21 21 21-21 13 10-17 37H73l-17-37z" fill="#0b6049"/>
      <path d="M75 109v23q15 18 30 0v-23" fill="#d69d71"/>
      <path d="M53 70q-12-4-11 13t13 15m72-28q12-4 11 13t-13 15" fill="#e9b98b"/>
      <path d="M53 49q37-25 74 0v45q-4 33-37 37-33-4-37-37z" fill="#e9b98b"/>
      <path d="M51 66V47q-5-14 11-21 27 1 44-16 4 14-6 21 25-7 28 15v20l-12-19q-36 12-54 0z" fill={ink}/>
      <path d="M53 90q8 10 13 7 24 13 48 0 5 3 13-7-4 38-37 41-32-4-37-41z" fill={ink}/>
      <path d="M80 106q10 7 20 0" fill="none" stroke={cream}/>
      <rect x="58" y="68" width="27" height="21" rx="5" fill={cream}/><rect x="95" y="68" width="27" height="21" rx="5" fill={cream}/>
      <path d="M85 75h10M53 73h5m64 0h5" fill="none"/>
      <circle cx="73" cy="78" r="3" fill={ink} stroke="none"/><circle cx="107" cy="78" r="3" fill={ink} stroke="none"/>
      <path d="M49 71q-7-43 41-43t41 43" fill="none" stroke={gold} strokeWidth="6"/>
      <rect x="41" y="68" width="12" height="31" rx="5" fill={gold}/><rect x="127" y="68" width="12" height="31" rx="5" fill={gold}/>
      <path d="M76 150v18m28-18v18" stroke={cream}/><path d="M61 180v-18m58 18v-18" fill="none"/>
      <path d="M81 175h18" stroke={gold} strokeWidth="5"/>
    </g>}
    {variant === 'robot' && <g stroke={ink} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M48 177v-34q0-19 23-19h38q23 0 23 19v34" fill={green}/>
      <path d="M68 128l22 15 22-15v46H68z" fill={cream}/><path d="M85 145h10l3 24-8 7-8-7z" fill={gold}/>
      <rect x="77" y="111" width="26" height="18" rx="5" fill={gold}/>
      <rect x="39" y="54" width="102" height="65" rx="20" fill={cream}/>
      <rect x="49" y="65" width="82" height="37" rx="12" fill={ink}/>
      <path d="M60 84q8-11 16 0m28 0q8-11 16 0" fill="none" stroke="#63e1b0" strokeWidth="5"/>
      <path d="M90 102q-13-14-27-1-4 8-14 3 9 19 29 9l12-6 12 6q20 10 29-9-10 5-14-3-14-13-27 1z" fill={ink}/>
      <rect x="29" y="72" width="10" height="25" rx="4" fill={green}/><rect x="141" y="72" width="10" height="25" rx="4" fill={green}/>
      <path d="M57 48v15q33 9 66 0V48" fill={green}/>
      <path d="M25 37l65-21 65 21-65 22z" fill={ink}/><path d="M143 41v26" stroke={gold}/><path d="M137 68h12l3 12h-18z" fill={gold}/>
      <path d="M48 146q-15-9-19 3l-4 23m107-26q15-9 19 3l4 23" fill="none" stroke={green} strokeWidth="12"/>
      <circle cx="25" cy="176" r="9" fill={cream}/><circle cx="155" cy="176" r="9" fill={cream}/>
      <circle cx="59" cy="145" r="3" fill={gold} stroke="none"/>
    </g>}
    {variant === 'owl' && <g stroke={ink} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M52 113q-20 19-22 50l20 4m78-54q20 19 22 50l-20 4" fill="#c79155"/>
      <path d="M48 151q-12-42-4-84L37 27l31 19q22-9 44 0l31-19-7 40q8 42-4 84z" fill="#c79155"/>
      <path d="M48 86q-5-35 23-35 19 0 19 21 0-21 19-21 28 0 23 35-7 29-42 30-35-1-42-30z" fill={cream}/>
      <circle cx="66" cy="79" r="23" fill="none" strokeWidth="5"/><circle cx="114" cy="79" r="23" fill="none" strokeWidth="5"/>
      <path d="M89 76h2m-48-6-7-4m101 4 7-4" fill="none" strokeWidth="4"/>
      <ellipse cx="69" cy="81" rx="5" ry="8" fill={ink} stroke="none"/><ellipse cx="111" cy="81" rx="5" ry="8" fill={ink} stroke="none"/>
      <path d="M80 98h20l-10 15z" fill={gold}/>
      <path d="M49 116l24 9 17 18 17-18 24-9v48q-41 26-82 0z" fill={green}/>
      <path d="M77 123l13 20 13-20-13 5z" fill={cream}/><path d="M83 134l7-5 7 5-7 7z" fill={gold}/>
      <path d="M49 145q21-6 41 3 20-9 41-3v32q-20-6-41 2-20-8-41-2z" fill={cream}/>
      <path d="M90 148v31m-32-23 22 3m-22 6 22 3m20-9 22-3m-22 12 22-3" fill="none" strokeWidth="2"/>
      <path d="M39 153q-1-7 8-7l9 2v15q-15 5-17-10m102 0q1-7-8-7l-9 2v15q15 5 17-10" fill="#c79155"/>
      <path d="M63 181l-7 5m13-5v6m42-6v6m6-6 7 5" stroke={gold} strokeWidth="5"/>
    </g>}
  </svg>;
}
