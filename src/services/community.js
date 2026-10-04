import { auth } from '../lib/firebase'
import { updateProfile } from 'firebase/auth'
import { aiFetch } from '../components/masterji/aiClient'
const listeners = new Set()
const subscriptions = new Map()
function user() { if (!auth?.currentUser) throw new Error('Please sign in.'); return auth.currentUser }
export async function communityRequest(body) {
  const response = await aiFetch('/api/community', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
  const result = await response.json()
  if(!response.ok) throw new Error(result.error || 'Community request failed.')
  return result
}
function timestamp(item) { const millis = item.createdAt; return {...item,createdAt:{toMillis:()=>millis,toDate:()=>new Date(millis)}} }
function subscribe(body, receive, fail, transform = items => items) {
  const key = `${user().uid}:${JSON.stringify(body)}`
  let entry = subscriptions.get(key)
  if (!entry) {
    entry = {clients:new Set(),pending:false,items:null,signature:''}
    entry.refresh = async () => {
      if(entry.pending || document.hidden || !entry.clients.size) return
      entry.pending=true
      try {
        const result=await communityRequest(body)
        const signature=JSON.stringify(result.items)
        if(signature!==entry.signature && entry.clients.size) {
          entry.signature=signature;entry.items=transform(result.items)
          entry.clients.forEach(client=>client.receive(entry.items))
        }
      } catch(error) { entry.clients.forEach(client=>client.fail?.(error)) }
      finally { entry.pending=false }
    }
    subscriptions.set(key,entry)
    listeners.add(entry.refresh)
    entry.timer=setInterval(entry.refresh,15000)
    document.addEventListener('visibilitychange',entry.refresh)
  }
  const client={receive,fail};entry.clients.add(client)
  if(entry.items) receive(entry.items)
  else entry.refresh()
  return () => {
    entry.clients.delete(client)
    if(!entry.clients.size) {
      clearInterval(entry.timer);listeners.delete(entry.refresh)
      document.removeEventListener('visibilitychange',entry.refresh)
      subscriptions.delete(key)
    }
  }
}
export function watchItems(path, receive, fail, _sorted = false, id) {
  return subscribe({action:'list',path,id},receive,fail,items=>items.map(timestamp))
}
async function change(body) { const result = await communityRequest(body); listeners.forEach(refresh=>refresh()); return result }
const own = collection => `users/${user().uid}/${collection}`
export const saveNote = (noteId,folderId) => change({action:'put',path:own('savedNotes'),id:noteId,data:{folderId}})
export const unsaveNote = noteId => change({action:'delete',path:own('savedNotes'),id:noteId})
export const toggleFavourite = (noteId,enabled) => change({action:enabled?'delete':'put',path:own('favourites'),id:noteId,data:{}})
export const recordRecent = noteId => change({action:'put',path:own('recentNotes'),id:noteId,data:{}})
export const removeNoteActivity = id => change({action:'removeNote',id})
export const createFolder = name => change({action:'put',path:own('folders'),data:{name}})
export const deleteFolder = id => change({action:'deleteFolder',path:own('folders'),id})
export const createChatRoom = name => change({action:'put',path:'chatRooms',data:{name}})
export const postMessage = (path,text) => change({action:'put',path,data:{text}})
export const deleteMessage = (path,id) => change({action:'delete',path,id})
export async function saveProfile(data) {
  const current=user()
  await change({action:'put',path:'publicProfiles',id:current.uid,data})
  await updateProfile(current,{displayName:data.displayName.trim()})
  await current.getIdToken(true)
}
export async function indexNotes(notes) {
  for(let i=0;i<notes.length;i+=10) await communityRequest({action:'index',ids:notes.slice(i,i+10).map(n=>n.id)})
  listeners.forEach(refresh=>refresh())
}
export function watchStats(receive,fail,period='all') {
  return subscribe({action:'stats',period},receive,fail)
}
