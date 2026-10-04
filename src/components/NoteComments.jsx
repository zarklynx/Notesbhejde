import {useEffect,useState} from 'react'
import {useAuth} from '../context/AuthContext'
import {watchItems,postMessage,deleteMessage} from '../services/community'
import ProfileAvatar from './ProfileAvatar'
import LoadingState from './LoadingState'
import './Community.css'

export default function NoteComments({noteId,onProfile}) {
  const {user}=useAuth()
  const [items,setItems]=useState([]),[profiles,setProfiles]=useState([]),[text,setText]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[sort,setSort]=useState('newest')
  const path=`notes/${noteId}/comments`
  const [loading,setLoading]=useState(true)
  useEffect(()=>{setLoading(true);setItems([]);setError('');return watchItems(path,items=>{setItems(items);setLoading(false)},e=>{setError(e.message);setLoading(false)})},[path])
  useEffect(()=>watchItems('publicProfiles',setProfiles),[])
  async function submit(e) {
    e.preventDefault();setBusy(true);setError('')
    try {await postMessage(path,text);setText('')} catch(e) {setError(e.message)} finally {setBusy(false)}
  }
  const ordered=[...items].sort((a,b)=>((b.createdAt?.toMillis?.()||0)-(a.createdAt?.toMillis?.()||0))*(sort==='newest'?1:-1))
  return <section className="note-comments" aria-label="Note comments">
    <header><h3>Comments <span>{items.length}</span></h3><select aria-label="Sort comments" value={sort} onChange={e=>setSort(e.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></header>
    <form onSubmit={submit}><label htmlFor={`comment-${noteId}`}>Leave a comment</label><textarea id={`comment-${noteId}`} placeholder="Share feedback or ask a question about this note…" rows={3} maxLength={2000} value={text} onChange={e=>setText(e.target.value)} /><div><small>{text.length}/2000</small><button disabled={busy||!text.trim()}>{busy?'Posting…':'Post comment'}</button></div></form>
    {error && <p role="alert">{error}</p>}
    {loading && <LoadingState label="Gathering comments" />}
    <div>{ordered.map(comment=>{
      const profile=profiles.find(p=>p.id===comment.authorId),name=profile?.displayName||comment.authorName||'Student',millis=comment.createdAt?.toMillis?.()||0
      return <article key={comment.id}><button className="comment-avatar" aria-label={`View ${name}'s profile`} onClick={()=>onProfile?.(comment.authorId,name)}><ProfileAvatar userId={comment.authorId} variant={profile?.avatarVariant} photoURL={profile?.photoURL} size={36} label={name}/></button><div><header><button onClick={()=>onProfile?.(comment.authorId,name)}>{name}</button><time dateTime={new Date(millis).toISOString()}>{new Date(millis).toLocaleString(undefined,{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</time></header><p>{comment.text}</p>{comment.authorId===user.uid && <button className="comment-delete" onClick={()=>{if(window.confirm('Delete this comment?'))deleteMessage(path,comment.id).catch(e=>setError(e.message))}}>Delete</button>}</div></article>
    })}{!loading && !error && !items.length && <p className="comments-empty">No comments yet. Be the first to share your thoughts.</p>}</div>
  </section>
}
