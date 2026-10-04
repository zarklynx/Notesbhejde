import Monetization from './Monetization'
import LoadingState from "./LoadingState"
import { Fragment, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FaExpand, FaCompress, FaPaperPlane, FaComments } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { watchItems, postMessage, deleteMessage, saveProfile, createChatRoom, watchStats } from '../services/community'
import './Community.css'
import { resizeProfilePhoto } from '../services/profilePhoto'
import ProfileAvatar, { PROFILE_AVATARS } from './ProfileAvatar'
import {studentRankings} from '../services/rankings'

export function ChatRooms({ onProfile }) {
  const [rooms, setRooms] = useState([]), [roomId, setRoomId] = useState('default'), [name, setName] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false)
  const [creating, setCreating] = useState(false)
  const [expanded,setExpanded] = useState(false)
  const [roomDrafts,setRoomDrafts] = useState({})
  useEffect(()=>{if(!expanded)return;const close=e=>{if(e.key==='Escape')setExpanded(false)};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[expanded])
  useEffect(() => watchItems('chatRooms', setRooms, e => setError(e.message)), [])
  async function create(e) {
    e.preventDefault(); setBusy(true); setError('')
    try { const room = await createChatRoom(name); setRoomId(room.id); setName(''); setCreating(false) } catch(e) { setError(e.message) } finally { setBusy(false) }
  }
  const options = [{ id: 'default', name: 'Default chatroom' }, ...[...rooms].sort((a,b) => a.name.localeCompare(b.name))]
  const selected = options.find(r => r.id === roomId)
  const room = <section className={`community-rooms ${expanded?'room-expanded':''}`} role={expanded?'dialog':undefined} aria-modal={expanded || undefined} aria-label="Study chatroom"><header className="room-header"><span className="room-icon"><FaComments /></span><div><strong>Study lounge</strong><small>Learn together</small></div><button className="room-expand" onClick={()=>setExpanded(!expanded)} aria-label={expanded?'Collapse chatroom':'Expand chatroom'}>{expanded?<FaCompress />:<FaExpand />}</button></header><div className="room-picker"><select aria-label="Choose chatroom" value={roomId} onChange={e => { if(e.target.value === '__create') { setCreating(true); setError(''); } else { setRoomId(e.target.value); setCreating(false); } }}>{options.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}<option value="__create">＋ Create room…</option></select><span>Public room</span></div>{creating && <form className="room-create" onSubmit={create}><input autoFocus aria-label="New chatroom name" placeholder="Give your room a name" value={name} maxLength={60} onChange={e=>setName(e.target.value)} /><button disabled={busy || !name.trim()}>{busy?'Creating…':'Create'}</button><button type="button" disabled={busy} onClick={()=>setCreating(false)}>Cancel</button></form>}{error && <p role="alert">{error}</p>}<Messages draft={roomDrafts[roomId] || ''} onDraft={value=>setRoomDrafts(prev=>({...prev,[roomId]:value}))} key={`${roomId}:${expanded}`} path={roomId==='default'?'publicChat':`chatRooms/${roomId}/messages`} title={selected?.name || 'Chatroom'} compact onProfile={(...args)=>{setExpanded(false);onProfile?.(...args)}} /></section>
  return expanded ? createPortal(<div className="room-backdrop" onClick={()=>setExpanded(false)}><div onClick={e=>e.stopPropagation()}>{room}</div></div>,document.body) : room
}

export function dayLabel(millis, now = Date.now()) {
  const date=new Date(millis),today=new Date(now),yesterday=new Date(now);yesterday.setDate(today.getDate()-1)
  if(date.toDateString()===today.toDateString())return 'Today'
  if(date.toDateString()===yesterday.toDateString())return 'Yesterday'
  return date.toLocaleDateString(undefined,{day:'numeric',month:'short',year:date.getFullYear()!==today.getFullYear()?'numeric':undefined})
}
function Avatar({photo,name,userId,variant}) { return <ProfileAvatar userId={userId} variant={variant} photoURL={photo} size={30} label={`${name || 'Student'}'s avatar`} /> }

export function Messages({ path, onProfile, title = 'Comments', compact = false, draft, onDraft }) {
  const { user } = useAuth()
  const [items, setItems] = useState([]), [localText, setLocalText] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false)
  const text = draft ?? localText, setText = onDraft ?? setLocalText
  const [profiles,setProfiles] = useState([])
  const [loading,setLoading]=useState(true)
  const log=useRef(null),follow=useRef(true),initial=useRef(true)
  useEffect(()=>watchItems('publicProfiles',setProfiles),[])
  useEffect(()=>{if(log.current && (initial.current || follow.current)){log.current.scrollTop=log.current.scrollHeight;initial.current=false}},[items])
  useEffect(() => {setLoading(true);setError('');setItems([]);return watchItems(path,items=>{setItems(items);setLoading(false)},e=>{setError(e.message);setLoading(false)},true)}, [path])
  async function send(e) {
    e.preventDefault(); setBusy(true); setError('')
    try { follow.current=true;await postMessage(path, text); setText('') } catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  const ordered=[...items].reverse()
  return <section className="community-messages">{!compact && <h3>{title}</h3>}<div ref={log} className="community-log" onScroll={e=>{const el=e.currentTarget;follow.current=el.scrollHeight-el.scrollTop-el.clientHeight<70}}>{loading && <LoadingState label="Opening the conversation" />}{ordered.map((m,i)=>{const millis=m.createdAt?.toMillis?.() || 0,day=dayLabel(millis),previous=i?dayLabel(ordered[i-1].createdAt?.toMillis?.()):null,profile=profiles.find(p=>p.id===m.authorId),name=profile?.displayName || m.authorName,own=m.authorId===user.uid;return <Fragment key={m.id}>{day!==previous && <div className="chat-day"><span>{day}</span></div>}<article className={`chat-row ${own?'chat-own':''}`}><button className="chat-person" aria-label={`View ${name}'s profile`} onClick={()=>onProfile?.(m.authorId,name)}><Avatar photo={profile?.photoURL} name={name} userId={m.authorId} variant={profile?.avatarVariant} /></button><div className="chat-bubble"><button className="chat-sender" onClick={()=>onProfile?.(m.authorId,name)}>{own?'You':name}</button><p>{m.text}</p><footer><time dateTime={new Date(millis).toISOString()} title={new Date(millis).toLocaleString()}>{new Date(millis).toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'})}</time>{own && <button className="chat-delete" onClick={()=>deleteMessage(path,m.id).catch(e=>setError(e.message))}>Delete</button>}</footer></div></article></Fragment>})}{!loading && !items.length && !error && <div className="chat-empty"><FaComments /><strong>A little help goes a long way.</strong><span>Ask a question or share something useful.</span></div>}</div>{error && <p className="chat-error" role="alert">{error}</p>}<form className="chat-composer" onSubmit={send}><input aria-label={title} value={text} maxLength={2000} onChange={e=>setText(e.target.value)} placeholder="Message your classmates…" /><button aria-label="Send message" disabled={busy || !text.trim()}><FaPaperPlane /></button></form></section>
}

export function ProfileDialog({ uid, name, notes, onClose, onHome, onOpen }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState({ displayName: name || 'Student', bio: '', course: '' }), [error, setError] = useState(''), [busy, setBusy] = useState(false)
  const [stats,setStats] = useState([])
  const [editing,setEditing]=useState(false),[draft,setDraft]=useState(null),[creatorOpen,setCreatorOpen]=useState(false)
  useEffect(() => watchItems('publicProfiles', items => { const found=items.find(p=>p.id===uid);if(found)setProfile(found) }, e=>setError(e.message),false,uid),[uid])
  useEffect(() => watchStats(setStats,e=>setError(e.message)),[])
  const publicIds=new Set(notes.map(note=>note.id))
  const totals = stats.filter(n=>publicIds.has(n.id)).reduce((all,n)=>{ const p=all[n.owner] ||= {views:0,favourites:0};p.views+=n.views;p.favourites+=n.favourites;return all },{})
  const total = totals[uid] || {views:0,favourites:0}
  const own = uid === user.uid
  const standing=studentRankings(notes,stats).find(student=>student.id===uid)
  async function save(e) { e.preventDefault(); setBusy(true); setError(''); try { await saveProfile(draft); setProfile(draft);setEditing(false);setDraft(null);setError('Profile saved.') } catch(e) { setError(e.message) } finally { setBusy(false) } }
  async function photo(e) {const file=e.target.files?.[0];if(!file)return;setBusy(true);try {const photoURL=await resizeProfilePhoto(file);setDraft(current=>({...current,photoURL}));setError('')}catch(error){setError(error.message)}finally{setBusy(false);e.target.value=''}}
  const picture = <ProfileAvatar userId={uid} variant={profile.avatarVariant} photoURL={profile.photoURL} size={80} label={`${profile.displayName}'s avatar`} />
  function chooseAvatar(avatarVariant) {setDraft(current=>({...current,avatarVariant,photoURL:''}))}
  return <main className="profile-page">
    <button type="button" className="profile-home-brand" aria-label="Notes bhejde home" onClick={onHome || onClose}><span>Notes</span><small>bhejde</small></button>
    <button onClick={onClose}>← Back to notes</button>
    <header className="student-profile-header">{picture}<div><span className="profile-eyebrow">Student community</span><h1>{profile.displayName}</h1><p>{profile.course || 'NotesBhejde student'}</p>{own && !editing && <button className="edit-profile-button" onClick={()=>{setDraft({...profile});setEditing(true);setError('')}}>Edit Profile</button>}</div></header>
    {own && <><button className="edit-profile-button" aria-expanded={creatorOpen} onClick={()=>setCreatorOpen(!creatorOpen)}>Monetization</button>{creatorOpen && <Monetization />}</>}
    <p className="student-profile-bio">{profile.bio || (own ? 'Tell classmates a little about yourself. Add a bio in Edit Profile.' : 'Here to learn, share and grow.')}</p>
    <section className="student-standing"><strong>{standing ? `#${standing.averageRank} final rank · ${standing.level}` : 'Not ranked yet'}</strong><span>{standing ? `(${standing.favouritesRank} favourites rank + ${standing.viewsRank} views rank) ÷ 2 · All time` : 'Public notes with reader activity join the rankings'}</span><small>Final rank is the average of the two ranks, so it can include a half (for example #2.5). Lower is better; equal averages tie. This reflects reader activity, not academic grades.</small>{notes.some(note=>note.ownerId===uid && note.isSample) && <small>Includes labelled sample notes and demo engagement for testing; not verified real popularity.</small>}</section>
    {own && editing && <section className="profile-editor" aria-label="Edit your profile"><h2>Edit Profile</h2><p>Your changes appear only after you save.</p><div className="profile-photo-picker"><ProfileAvatar userId={uid} variant={draft.avatarVariant} photoURL={draft.photoURL} size={64} label="Profile photo preview"/><label>Choose a photo<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={photo} /></label><small>Or choose a study buddy.</small><div className="avatar-picker">{PROFILE_AVATARS.map(avatar=><button key={avatar.id} title={avatar.name} aria-label={`Use ${avatar.name} avatar`} aria-pressed={!draft.photoURL && draft.avatarVariant===avatar.id} disabled={busy} onClick={()=>chooseAvatar(avatar.id)}><ProfileAvatar variant={avatar.id} size={48} label={avatar.name} /></button>)}</div></div><form onSubmit={save}>{[['displayName','Name'],['course','Course']].map(([key,label])=><label key={key}>{label}<input required={key==='displayName'} disabled={busy} value={draft[key] || ''} maxLength={100} onChange={e=>setDraft({...draft,[key]:e.target.value})}/></label>)}<label>Bio<textarea rows={3} maxLength={500} disabled={busy} value={draft.bio || ''} placeholder="What are you studying? What do you love learning?" onChange={e=>setDraft({...draft,bio:e.target.value})}/></label><div className="profile-editor-actions"><button type="button" disabled={busy} onClick={()=>{setEditing(false);setDraft(null);setError('')}}>Cancel</button><button className="profile-save" disabled={busy || !draft.displayName?.trim()}>{busy?'Saving…':'Save changes'}</button></div></form></section>}
    <section className="profile-stats"><article><strong>{total.favourites}</strong>Favourites received<small>{standing ? `#${standing.favouritesRank}` : '—'}</small></article><article><strong>{total.views}</strong>Note views<small>{standing ? `#${standing.viewsRank}` : '—'}</small></article><article><strong>{notes.filter(n=>n.ownerId===uid).length}</strong>Shared notes</article></section>
    <small>Rankings use recorded activity. Views count once per signed-in reader per note per day.</small>
    {error && <p role="status">{error}</p>}<h2>Shared notes</h2><div className="profile-notes">{notes.filter(n=>n.ownerId===uid).map(n=>{const stat=stats.find(s=>s.id===n.id);return <button key={n.id} onClick={()=>{onClose();onOpen(n)}}><strong>{n.topic}</strong><span>{n.subject}</span><small>{stat?.views || 0} views · {stat?.favourites || 0} favourites</small></button>})}</div>{!notes.some(n=>n.ownerId===uid) && <p>No public notes shared yet.</p>}
  </main>
}
