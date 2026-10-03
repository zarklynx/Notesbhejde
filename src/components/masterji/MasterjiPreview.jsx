import { useState } from 'react'
import MasterjiAvatar from './MasterjiAvatar'
import ClassicLooks from './ClassicLooks'
import ModernLooks from './ModernLooks'
import PlayfulLooks from './PlayfulLooks'

const looks = [
  ['original', 'The friendly original', 'FAMILIAR & WARM', 'Round glasses, a generous moustache, and a green waistcoat.'],
  ['stick', 'The old-school sir', 'STRICT, WITH A WINK', 'Bald head, khaki kurta, and that unmistakable classroom stick.'],
  ['professor', 'The mad professor', 'QUIRKY & BRILLIANT', 'Wild white hair, a long nose, and a bow tie. Definitely has a theory.'],
  ['grandpa', 'The wise elder', 'CALM & COMFORTING', 'A Nehru cap, white moustache, and a shawl. Explains everything patiently.'],
  ['cool', 'The cool tuition sir', 'MODERN & APPROACHABLE', 'A hoodie, headphones, and a sharp quiff. Gets your exam panic.'],
  ['robot', 'The robo-Masterji', 'TECHY & CHEERFUL', 'A robot with a graduation cap and a very human moustache.'],
  ['owl', 'The night-study owl', 'WISE & UNEXPECTED', 'Chunky spectacles, a green vest, and a book. Built for late-night revision.'],
  ['comic', 'The classroom comedian', 'FUNNY & EXPRESSIVE', 'Crooked glasses, wild fringe, and one cheeky eyebrow.'],
  ['badge', 'The pocket Masterji', 'CLEAN & COMPACT', 'A bold, simple face badge that reads well in a tiny chat button.'],
  ['book', 'The actual bookworm', 'PLAYFUL & MEMORABLE', 'Your notes grew glasses and a moustache. He is literally a book.'],
]

function Character({ id }) {
  if (id === 'original') return <MasterjiAvatar />
  if (['stick', 'professor', 'grandpa'].includes(id)) return <ClassicLooks variant={id} />
  if (['cool', 'robot', 'owl'].includes(id)) return <ModernLooks variant={id} />
  return <PlayfulLooks variant={id} />
}

export default function MasterjiPreview() {
  const [selected, setSelected] = useState('original')
  return (
    <main className="mj-gallery">
      <a className="mj-back" href="/">← Back to NotesBhejde</a>
      <div className="mj-gallery-header">
        <span className="mj-eyebrow">MEET YOUR STUDY COMPANION</span>
        <h1>Same job. Ten personalities.</h1>
        <p>Choose the teacher you’d want beside your notes. Click any look to see it in the corner.</p>
      </div>
      <div className="mj-look-grid">{looks.map(([id, name, tag, description], index) => <button key={id} className={`mj-look-card ${selected === id ? 'is-selected' : ''}`} onClick={() => setSelected(id)} aria-pressed={selected === id}>
        <div className="mj-look-art"><span className="mj-look-number">{String(index + 1).padStart(2, '0')}</span><Character id={id} /><span className="mj-small-sample"><Character id={id} /></span></div>
        <div className="mj-look-copy"><span className="mj-look-tag">{tag}</span><h2>{name}</h2><p>{description}</p><span className="mj-selection-label">{selected === id ? '✓ In your preview' : 'Try this look ↗'}</span></div>
      </button>)}</div>
      <footer className="mj-gallery-footer">Original SVG characters · App’s green, navy & soft backgrounds · Static designs for now</footer>
      <div className="mj-gallery-launcher">
        <span className="mj-launcher-hint">Your selected look, at real size</span>
        <button className="mj-launcher" aria-label="Selected Masterji appearance">
          <Character id={selected} /><span>Masterji<span className="mj-online-dot" /></span>
        </button>
      </div>
    </main>
  )
}
