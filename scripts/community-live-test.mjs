import {readFileSync} from 'node:fs'
import assert from 'node:assert/strict'
const config=Object.fromEntries(readFileSync('.env.local','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1).trim()]}))
const root='https://notesbhejde-masterji.sundarful.workers.dev'
const key=config.VITE_FIREBASE_API_KEY
const accounts=[]
async function identity(action,body) {
  const response=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:${action}?key=${key}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
  const result=await response.json();if(!response.ok)throw new Error(result.error?.message || 'Auth failed');return result
}
async function call(account,body,status=200) {
  const response=await fetch(`${root}/api/community`,{method:'POST',headers:{Authorization:`Bearer ${account.idToken}`,'Content-Type':'application/json',Origin:'http://127.0.0.1:5173'},body:JSON.stringify(body)})
  const result=await response.json();assert.equal(response.status,status,JSON.stringify(result));return result
}
const cleanups=[]
try {
  for(let i=0;i<2;i++)accounts.push(await identity('signUp',{email:`community-qa-${Date.now()}-${i}@example.com`,password:crypto.randomUUID()+'Aa1!',returnSecureToken:true}))
  const [a,b]=accounts, base=`users/${a.localId}`
  console.log('Temporary test users:',accounts.map(a=>a.localId).join(','))
  const response=await fetch(`https://firestore.googleapis.com/v1/projects/${config.VITE_FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery`,{method:'POST',headers:{Authorization:`Bearer ${a.idToken}`,'Content-Type':'application/json'},body:JSON.stringify({structuredQuery:{from:[{collectionId:'notes'}],where:{fieldFilter:{field:{fieldPath:'visibility'},op:'EQUAL',value:{stringValue:'public'}}},orderBy:[{field:{fieldPath:'createdAt'},direction:'DESCENDING'}],limit:1}})})
  assert.equal(response.status,200)
  const notes=await response.json(), note=notes.find(n=>n.document)?.document
  assert.ok(note,'Need a public note to test')
  const noteId=note.name.split('/').pop()
  const folder=await call(a,{action:'put',path:`${base}/folders`,data:{name:'QA temporary folder'}})
  cleanups.push(()=>call(a,{action:'deleteFolder',path:`${base}/folders`,id:folder.id}))
  await call(a,{action:'list',path:`users/${b.localId}/folders`},403)
  await call(a,{action:'put',path:`${base}/savedNotes`,id:noteId,data:{folderId:folder.id}})
  cleanups.push(()=>call(a,{action:'delete',path:`${base}/savedNotes`,id:noteId}))
  assert.equal((await call(a,{action:'list',path:`${base}/savedNotes`})).items[0].folderId,folder.id)
  await call(a,{action:'deleteFolder',path:`${base}/folders`,id:folder.id})
  assert.equal((await call(a,{action:'list',path:`${base}/savedNotes`})).items[0].folderId,'default')
  console.log('PASS folders, save, move to General on deletion, privacy')
  await call(a,{action:'put',path:`${base}/favourites`,id:noteId,data:{}})
  cleanups.push(()=>call(a,{action:'delete',path:`${base}/favourites`,id:noteId}))
  await call(a,{action:'put',path:`${base}/recentNotes`,id:noteId,data:{}})
  await call(a,{action:'put',path:`${base}/recentNotes`,id:noteId,data:{}})
  assert.ok((await call(a,{action:'list',path:`${base}/recentNotes`})).items.some(n=>n.noteId===noteId))
  const stats=(await call(a,{action:'stats'})).items.find(n=>n.id===noteId);assert.ok(stats.favourites>=1);assert.ok(stats.views>=1)
  console.log('PASS favourites, recent, view statistics')
  const room=await call(a,{action:'put',path:'chatRooms',data:{name:'QA temporary room'}})
  console.log('Temporary room ID:',room.id)
  for(const path of ['publicChat',`chatRooms/${room.id}/messages`,`notes/${noteId}/comments`]) {
    const message=await call(a,{action:'put',path,data:{text:'QA temporary message'}})
    cleanups.push(()=>call(a,{action:'delete',path,id:message.id}))
    assert.ok((await call(b,{action:'list',path})).items.some(m=>m.id===message.id))
    await call(b,{action:'delete',path,id:message.id})
    assert.ok((await call(a,{action:'list',path})).items.some(m=>m.id===message.id),'Other user deleted a message')
  }
  console.log('PASS default chat, custom chatroom, comments, message ownership')
  await call(a,{action:'put',path:'publicProfiles',id:a.localId,data:{displayName:'QA Student',course:'MCA',bio:'Temporary profile'}})
  assert.ok((await call(b,{action:'list',path:'publicProfiles'})).items.some(p=>p.id===a.localId))
  await call(b,{action:'put',path:'publicProfiles',id:a.localId,data:{displayName:'Wrong user'}},403)
  await call(a,{action:'put',path:'publicChat',data:{text:''}},400)
  await call(a,{action:'put',path:`${base}/notifications`,data:{text:'Fake'}},403)
  console.log('PASS profiles, ownership, invalid input, notification write protection')
  const ai=await fetch(`${root}/api/masterji`,{method:'POST',headers:{Authorization:`Bearer ${a.idToken}`,'Content-Type':'application/json'},body:JSON.stringify({messages:[{role:'user',content:'Hi'}],note:{title:'DBMS',content:'Primary keys uniquely identify rows.'}})})
  assert.equal(ai.status,200);console.log('PASS Masterji greeting endpoint')
} finally {
  for(const cleanup of cleanups.reverse()) await cleanup().catch(e=>console.error('Cleanup:',e.message))
  for(const account of accounts)await identity('delete',{idToken:account.idToken}).catch(e=>console.error('Auth cleanup:',e.message))
}
