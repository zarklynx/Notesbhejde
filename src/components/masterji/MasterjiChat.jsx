import { useEffect, useRef, useState } from 'react'
import BookwormAvatar from './BookwormAvatar'
import './chat.css'
import { aiFetch } from './aiClient'
import { chatPlan } from './chatPolicy'

export default function MasterjiChat({ note }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [mood, setMood] = useState('idle')
  const [status, setStatus] = useState('Thinking…')
  const pdfText = useRef(null)
  const usedOcr = useRef(false)
  const input = useRef(null), messageList = useRef(null), latestMessage = useRef(null), controller = useRef(null), reaction = useRef(null), launcher = useRef(null)
  const followReply = useRef(true)
  useEffect(() => () => { controller.current?.abort(); clearTimeout(reaction.current) }, [])
  useEffect(() => { if (open) input.current?.focus() }, [open])
  useEffect(() => {
    const list = messageList.current, latest = latestMessage.current
    if (!list || !latest || !followReply.current) return
    if (messages.at(-1)?.role === 'assistant') {
      // Scroll only this chat, and reveal the START of a long reply.
      const top = latest.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop
      list.scrollTop = Math.max(0, top - 12)
    } else {
      list.scrollTop = list.scrollHeight
    }
  }, [messages])
  const content = note.content || note.info || ''
  const activity = status.startsWith('Reading scanned') ? 'Reading the page' : status.startsWith('Reading PDF') ? 'Reading PDF' : status.startsWith('Working through') ? 'Working it out' : status.startsWith('Preparing') ? 'Preparing reply' : 'Thinking'
  async function send(text) {
    if (!text.trim() || busy) return
    followReply.current = true
    clearTimeout(reaction.current)
    const next = [...messages, { role: 'user', content: text.trim() }]
    const plan = chatPlan(text)
    if (plan.reply) {
      setMessages([...next, { role: 'assistant', content: plan.reply }]); setDraft(''); setError(''); setMood('happy')
      reaction.current = setTimeout(() => setMood('idle'), 1800)
      return
    }
    setStatus(plan.effort === 'medium' ? 'Working through your question…' : 'Thinking…')
    setMessages(next); setDraft(''); setError(''); setBusy(true); setMood('thinking')
    controller.current = new AbortController()
    try {
      let source = content
      const isPdf = note.file && (note.file.startsWith('data:application/pdf') || /\.pdf(?:[?#]|$)/i.test(note.file) || /\.pdf$/i.test(note.fileName || ''))
      if (isPdf) {
        setStatus('Reading PDF text…')
        if (pdfText.current === null) {
          const { readPdfText } = await import('./pdfText')
          pdfText.current = await readPdfText(note.file, controller.current.signal, value => {
            if (value.startsWith('Reading scanned')) usedOcr.current = true
            setStatus(value)
          })
        }
        source = `PDF text:\n${pdfText.current}\n\nNote description:\n${content.slice(0, 1000)}`
      }
      setStatus(usedOcr.current ? 'Preparing reply…' : plan.effort === 'medium' ? 'Working through your question…' : 'Thinking…')
      const response = await aiFetch('/api/masterji', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.current.signal, body: JSON.stringify({ note: { id: note.id, title: note.topic, content: source }, messages: next.slice(-11), preferFast: usedOcr.current }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not get an answer.')
      setMessages([...next, { role: 'assistant', content: data.answer }]); setMood('happy')
      reaction.current = setTimeout(() => setMood('idle'), 1800)
    } catch (e) { if (e.name !== 'AbortError') { setError(e.message || 'Connection failed. Please retry.'); setMessages(messages); setDraft(text); setMood('idle') } }
    finally { setBusy(false) }
  }
  function close() { setOpen(false); requestAnimationFrame(() => launcher.current?.focus()) }
  return <div className={`mj-chat-root ${open ? 'is-open' : ''}`} onClick={e => e.stopPropagation()} onKeyDown={e => { if (e.key === 'Escape' && open) { e.stopPropagation(); close() } }}>
    <section className="mj-chat-panel" role="dialog" aria-label={`Study chat for ${note.topic}`} aria-hidden={!open} inert={!open}>
      <header>{open && <BookwormAvatar mood={mood} trackCursor={!busy} />}<div><h2 aria-live="polite" aria-atomic="true">{busy ? <>{activity}<span className="mj-activity-dots" aria-hidden="true">...</span></> : 'Ask Masterji'}</h2>{busy && status.startsWith('Reading') && <span>{status.replace(/…$/, '')}</span>}</div><button onClick={close} aria-label="Close study chat">×</button></header>
      <div ref={messageList} className="mj-chat-messages" role="log" aria-live="polite" onScroll={e => {
        const list = e.currentTarget
        followReply.current = list.scrollHeight - list.scrollTop - list.clientHeight < 80
      }}>
        {!messages.length && <div className="mj-chat-welcome"><div className="mj-chat-suggestions">{['Summarize these notes', 'Explain this in simple words', 'Quiz me on these notes'].map(text => <button key={text} onClick={() => send(text)} disabled={busy}>{text} <span>↗</span></button>)}</div></div>}
        {messages.map((m, i) => <div ref={i === messages.length - 1 ? latestMessage : null} key={i} className={`mj-chat-message mj-chat-${m.role}`}>{m.content}</div>)}
        {busy && <div className="mj-chat-wait" role="status"><span>{status}</span></div>}
        {error && <p className="mj-chat-error" role="alert">{error}</p>}
      </div>
      <form onSubmit={e => { e.preventDefault(); send(draft) }}><input ref={input} value={draft} onChange={e => setDraft(e.target.value)} maxLength={2000} placeholder="Ask about this note…" aria-label="Message" /><button disabled={busy || !draft.trim()} aria-label="Send message">↑</button></form>
      <p className="mj-chat-disclosure">Scanned pages sent to Runware · Answers can contain mistakes</p>
    </section>
    <button ref={launcher} className="mj-chat-launcher" hidden={open} onClick={() => { setOpen(true); if (!busy) setMood('hello') }} aria-label="Ask about this note" aria-expanded={open}>{!open && <BookwormAvatar mood={mood} />}</button>
  </div>
}
