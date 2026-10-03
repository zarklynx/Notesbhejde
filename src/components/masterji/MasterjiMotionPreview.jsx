import { useEffect, useRef, useState } from 'react'
import MasterjiAvatar from './MasterjiAvatar'
import BookwormAvatar from './BookwormAvatar'
import MasterjiChat from './MasterjiChat'

const names = { original: 'Friendly original', book: 'Masterji' }
const phases = {
  idle: ['Ready when you are', 'Move your cursor around. Both characters follow along.'],
  hello: ['Namaste, beta!', 'A little hello when you open Masterji.'],
  thinking: ['Reading your note…', 'A preview of the waiting animation.'],
  writing: ['Putting it into simple words…', 'A preview of preparing an answer.'],
  happy: ['Aha! That makes sense.', 'The answer is ready. A small moment of delight.'],
}

function Avatar({ kind, phase, actionId }) {
  return kind === 'book' ? <BookwormAvatar mood={phase} actionId={actionId} trackCursor /> : <MasterjiAvatar mood={phase === 'writing' ? 'thinking' : phase} trackCursor />
}

export default function MasterjiMotionPreview() {
  const [phase, setPhase] = useState('idle')
  const [selected, setSelected] = useState('book')
  const [demo, setDemo] = useState(false)
  const [actionId, setActionId] = useState(0)
  const timers = useRef([])
  function clearTimers() { timers.current.forEach(clearTimeout); timers.current = [] }
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  function choosePhase(value) { clearTimers(); setDemo(false); setPhase(value); setActionId(id => id + 1) }
  function playDemo() {
    clearTimers(); setDemo(true); setPhase('hello'); setActionId(id => id + 1)
    timers.current = [
      setTimeout(() => setPhase('thinking'), 1100),
      setTimeout(() => setPhase('writing'), 4800),
      setTimeout(() => setPhase('happy'), 7300),
      setTimeout(() => { setPhase('idle'); setDemo(false) }, 10100),
    ]
  }
  return <main className="mj-motion-page">
    <nav className="mj-motion-nav"><a href="/">Notes<span>Bhejde</span></a><a href="/?masterji-preview&gallery">← All ten looks</a></nav>
    <header className="mj-motion-header"><span className="mj-eyebrow">YOUR NOTEBOOK TEACHER</span><h1>Masterji has a little homework.</h1><p>Low spectacles. A magnificent moustache. His trusty pointer.<br />Watch him open his book when it’s time to think.</p></header>
    <div className="mj-motion-controls" aria-label="Character animation states">{[['idle', 'At rest'], ['hello', 'Say hello'], ['thinking', 'Thinking'], ['writing', 'Preparing answer'], ['happy', 'Answer ready']].map(([value, label]) => <button key={value} aria-pressed={phase === value} onClick={() => choosePhase(value)}>{label}</button>)}</div>
    <div className="mj-motion-grid mj-final-design">{['book'].map((kind) => <article className={`mj-motion-card ${selected === kind ? 'mj-picked' : ''}`} key={kind}>
      <div className="mj-motion-card-top"><span>{kind === 'original' ? '01 / THE TEACHER' : '02 / THE NOTES'}</span><button aria-pressed={selected === kind} onClick={() => setSelected(kind)}>{selected === kind ? '✓ In the corner' : 'Try in corner'}</button></div>
      <button className={`mj-motion-stage mj-stage-${phase}`} onClick={() => choosePhase('hello')} aria-label={`Make ${names[kind]} say hello`}><div className="mj-motion-halo" /><Avatar kind={kind} phase={phase} actionId={actionId} /></button>
      <div className="mj-motion-status" aria-live="polite"><span className={`mj-status-dot mj-dot-${phase}`} />{phases[phase][0]}</div>
      <h2>{names[kind]}</h2><p>A notebook with a teacher’s soul. His book opens as he reads, his eyes scan the page, and his pointer lifts when an idea clicks.</p>
      <div className="mj-personality-tags">{(kind === 'original' ? ['Warm', 'Patient', 'Familiar'] : ['Playful', 'Curious', 'Distinctive']).map(tag => <span key={tag}>{tag}</span>)}</div>
    </article>)}</div>
    <div className="mj-demo-strip"><div><strong>Try the full moment</strong><p>Hello → reading → preparing → answer ready</p></div><button onClick={playDemo}>{demo ? '↻ Replay preview' : '▶ Play conversation preview'}</button></div>
    <p className="mj-motion-footnote">Animation demo only · No AI requests · SVG + CSS · Reduced motion supported</p>
    <MasterjiChat note={{ id: 'preview', topic: 'AWS Cloud Practitioner · sample note', content: 'AWS provides cloud computing services on a pay-as-you-go basis. IAM controls user permissions. EC2 provides virtual servers. S3 stores objects such as files and backups. A VPC isolates resources in a private virtual network.' }} />
  </main>
}
