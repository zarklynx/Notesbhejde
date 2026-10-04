import { Buffer } from 'node:buffer'
import {rankingPeriod} from './rankingPeriod.js'
import {eligibility} from './monetization.js'

function check(value, max, label) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw Object.assign(new Error(`Invalid ${label}.`), { status: 400 })
  return value.trim()
}
export function authorizePath(path, uid) {
  if (typeof path !== 'string') return false
  const parts = path.split('/')
  return path === 'publicChat' || path === 'chatRooms' || path === 'publicProfiles' ||
    /^chatRooms\/[\w-]{1,128}\/messages$/.test(path) || /^notes\/[\w-]{1,128}\/comments$/.test(path) ||
    (parts.length === 3 && parts[0] === 'users' && parts[1] === uid && ['savedNotes','favourites','recentNotes','folders','notifications'].includes(parts[2]))
}
async function noteInfo(id, request, env, db) {
  check(id, 128, 'note ID')
  if (!/^[\w-]+$/.test(id)) throw Object.assign(new Error('Invalid note ID.'), { status: 400 })
  const response = await fetch(`https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/notes/${id}`, {
    headers: { Authorization: request.headers.get('Authorization') }, signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) throw Object.assign(new Error('This note is unavailable.'), { status: 404 })
  const fields = (await response.json()).fields || {}
  if (fields.visibility?.stringValue !== 'public') throw Object.assign(new Error('This note is private.'), { status: 403 })
  const owner = fields.ownerId?.stringValue
  if (!owner) throw Object.assign(new Error('Note owner missing.'), { status: 400 })
  const title = fields.topic?.stringValue || fields.title?.stringValue || 'Notes'
  await db.prepare('INSERT INTO community_notes(id,owner,title) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET owner=excluded.owner,title=excluded.title').bind(id, owner, title).run()
  return { owner, title }
}
export async function community(request, env, user) {
  const db = env.VOICE_USAGE, uid = user.sub
  const chunks = []; let size = 0
  for await (const chunk of request.body) { size += chunk.byteLength; if(size > 16000) return { status:413, body:{error:'Request too large.'} }; chunks.push(Buffer.from(chunk)) }
  let input
  try { input = JSON.parse(Buffer.concat(chunks).toString()) } catch { return {status:400,body:{error:'Invalid JSON.'}} }
  try {
    const { action, path, id } = input
    const now = Date.now()
    const stmt = (sql,...args) => db.prepare(sql).bind(...args)
    const list = async (sql,...args) => (await stmt(sql,...args).all()).results
    const rows = async (p,filterId) => (await (filterId
      ? list('SELECT id,data,created FROM community_items WHERE path=? AND id=?',p,filterId)
      : list('SELECT id,data,created FROM community_items WHERE path=? ORDER BY created DESC LIMIT 100',p))).map(r => ({...JSON.parse(r.data),id:r.id,createdAt:r.created}))
    const put = (p,i,data) => stmt('INSERT INTO community_items(path,id,owner,data,created) VALUES(?,?,?,?,?) ON CONFLICT(path,id) DO UPDATE SET data=excluded.data,created=excluded.created',p,i,uid,JSON.stringify(data),now)
    const notify = (owner,text,noteId) => put(`users/${owner}/notifications`,crypto.randomUUID(),{authorId:uid,authorName:user.name || 'Student',text,noteId})
    if(action === 'rate') {
      const note=await noteInfo(id,request,env,db)
      if(note.owner===uid)return {status:403,body:{error:'You cannot rate your own note.'}}
      if(!Number.isInteger(input.rating) || input.rating<1 || input.rating>5)return {status:400,body:{error:'Choose a rating from 1 to 5.'}}
      await put(`ratings/${id}`,uid,{rating:input.rating}).run()
      return {status:200,body:{ok:true}}
    }
    if(action === 'rating') {
      await noteInfo(id,request,env,db)
      const ratings=await list("SELECT id,json_extract(data,'$.rating') rating FROM community_items WHERE path=?",`ratings/${id}`)
      return {status:200,body:{count:ratings.length,average:ratings.length?ratings.reduce((sum,r)=>sum+r.rating,0)/ratings.length:0,mine:ratings.find(r=>r.id===uid)?.rating || 0}}
    }
    if(action === 'monetization' || action === 'setMonetization') {
      const response=await fetch(`https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery`,{method:'POST',headers:{Authorization:request.headers.get('Authorization'),'Content-Type':'application/json'},body:JSON.stringify({structuredQuery:{from:[{collectionId:'notes'}],where:{compositeFilter:{op:'AND',filters:[{fieldFilter:{field:{fieldPath:'ownerId'},op:'EQUAL',value:{stringValue:uid}}},{fieldFilter:{field:{fieldPath:'visibility'},op:'EQUAL',value:{stringValue:'public'}}}]}},limit:1001}}),signal:AbortSignal.timeout(10000)})
      if(!response.ok)throw Object.assign(new Error('Could not verify your posted notes. Please retry.'),{status:503})
      const documents=(await response.json()).filter(row=>row.document).map(row=>row.document)
      if(documents.length>1000)throw Object.assign(new Error('Creator review is required for this account.'),{status:409})
      const ids=new Set(documents.filter(d=>!d.fields?.isSample?.booleanValue && !d.fields?.isDemo?.booleanValue).map(d=>d.name.split('/').pop()))
      const likes=await list('SELECT note,COUNT(*) count FROM community_likes WHERE viewer<>? GROUP BY note',uid)
      const ratings=await list("SELECT path,owner,json_extract(data,'$.rating') rating FROM community_items WHERE path LIKE 'ratings/%' AND owner<>?",uid)
      const validRatings=ratings.filter(r=>ids.has(r.path.split('/')[1]) && r.rating>=1 && r.rating<=5)
      const state=eligibility({notes:ids.size,likes:likes.filter(r=>ids.has(r.note)).reduce((sum,r)=>sum+r.count,0),ratingCount:validRatings.length,averageRating:validRatings.length?validRatings.reduce((sum,r)=>sum+r.rating,0)/validRatings.length:0})
      const settingsPath=`creator/${uid}`
      if(action==='setMonetization') {
        if(typeof input.enabled!=='boolean')return {status:400,body:{error:'Invalid switch value.'}}
        if(input.enabled && !state.eligible)return {status:403,body:{error:'Meet all three eligibility requirements before enabling monetization.'}}
        await put(settingsPath,'settings',{enabled:input.enabled}).run()
      }
      const settings=await rows(settingsPath,'settings')
      return {status:200,body:{...state,enabled:state.eligible && settings[0]?.enabled===true,mode:'preview',paymentsReady:false}}
    }
    if(action === 'removeNote') {
      check(id,128,'note ID')
      const note=await stmt('SELECT owner FROM community_notes WHERE id=?',id).first()
      if(!note) return {status:200,body:{ok:true}}
      if(note.owner !== uid) return {status:403,body:{error:'Not your note.'}}
      // Ownership was verified against Firestore when this index entry was made.
      // Missing Firestore documents may return permission-denied, not 404.
      await db.batch([
        stmt('DELETE FROM community_notes WHERE id=?',id),stmt('DELETE FROM community_likes WHERE note=?',id),stmt('DELETE FROM community_views WHERE note=?',id),
        stmt('DELETE FROM community_items WHERE path=?',`notes/${id}/comments`),
        stmt('DELETE FROM community_items WHERE path=?',`ratings/${id}`),
        stmt("DELETE FROM community_items WHERE id=? AND (path LIKE 'users/%/savedNotes' OR path LIKE 'users/%/favourites' OR path LIKE 'users/%/recentNotes')",id),
      ])
      return {status:200,body:{ok:true}}
    }
    if(action === 'stats') {
      const period=rankingPeriod(input.period || 'all',now)
      const stats = period.period==='all'
        ? await list('SELECT n.id,n.owner,n.title,(SELECT COUNT(*) FROM community_likes l WHERE l.note=n.id) favourites,(SELECT COUNT(*) FROM community_views v WHERE v.note=n.id) views FROM community_notes n LIMIT 2000')
        : await list("SELECT n.id,n.owner,n.title,(SELECT COUNT(*) FROM community_likes l JOIN community_items i ON i.path='users/' || l.viewer || '/favourites' AND i.id=l.note WHERE l.note=n.id AND i.created>=?) favourites,(SELECT COUNT(*) FROM community_views v WHERE v.note=n.id AND v.day>=?) views FROM community_notes n LIMIT 2000",period.start,period.day)
      return {status:200,body:{items:stats,period:period.period,since:period.start,timezone:'UTC'}}
    }
    if(action === 'index') {
      const ids = input.ids
      if (!Array.isArray(ids) || ids.length > 10) throw Object.assign(new Error('Send at most 10 note IDs.'),{status:400})
      for (const noteId of ids) await noteInfo(noteId,request,env,db)
      return {status:200,body:{ok:true}}
    }
    if (!authorizePath(path,uid)) return {status:403,body:{error:'Access denied.'}}
    if(action === 'list') {
      if(path.startsWith('notes/')) await noteInfo(path.split('/')[1],request,env,db)
      if(path.startsWith('chatRooms/') && !await stmt('SELECT id FROM community_items WHERE path=? AND id=?','chatRooms',path.split('/')[1]).first()) return {status:404,body:{error:'Room not found.'}}
      return {status:200,body:{items:await rows(path,path === 'publicProfiles' ? id : null)}}
    }
    if(action === 'deleteFolder') {
      if(!path.endsWith('/folders') || id === 'default') return {status:400,body:{error:'Cannot delete this folder.'}}
      await db.batch([stmt("UPDATE community_items SET data=json_set(data,'$.folderId','default') WHERE path=? AND json_extract(data,'$.folderId')=?",`users/${uid}/savedNotes`,id),stmt('DELETE FROM community_items WHERE path=? AND id=?',path,id)])
      return {status:200,body:{ok:true}}
    }
    if(action === 'delete') {
      check(id,128,'ID')
      if(path === 'chatRooms' || path === 'publicProfiles' || path.endsWith('/recentNotes')) return {status:403,body:{error:'Delete not allowed.'}}
      if(path.endsWith('/folders')) return {status:400,body:{error:'Use delete folder.'}}
      if(path.endsWith('/favourites')) await db.batch([stmt('DELETE FROM community_likes WHERE note=? AND viewer=?',id,uid),stmt('DELETE FROM community_items WHERE path=? AND id=? AND owner=?',path,id,uid)])
      else await stmt('DELETE FROM community_items WHERE path=? AND id=? AND owner=?',path,id,uid).run()
      return {status:200,body:{ok:true}}
    }
    if(action !== 'put') return {status:400,body:{error:'Unknown action.'}}
    const data = input.data || {}, key = id || crypto.randomUUID()
    check(key,128,'ID')
    let clean, note
    if(path.endsWith('/folders') || path === 'chatRooms') clean = {name:check(data.name,60,'name'),ownerId:uid}
    else if(path === 'publicProfiles') {
      if(key !== uid) return {status:403,body:{error:'Only edit your own profile.'}}
      const photoURL = data.photoURL || ''
      if(typeof photoURL !== 'string' || photoURL.length>10000 || (photoURL && !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(photoURL)))return {status:400,body:{error:'Invalid profile photo.'}}
      clean = {displayName:check(data.displayName,100,'name'),bio:typeof data.bio === 'string' ? data.bio.slice(0,500):'',course:typeof data.course === 'string'?data.course.slice(0,100):'',photoURL,avatarVariant:typeof data.avatarVariant==='string'?data.avatarVariant.slice(0,30):''}
    } else if(/\/(savedNotes|favourites|recentNotes)$/.test(path)) {
      note = await noteInfo(key,request,env,db)
      clean = {noteId:key}
      if(path.endsWith('/savedNotes')) {
        const folderId = data.folderId || 'default'
        if(folderId !== 'default' && !await stmt('SELECT id FROM community_items WHERE path=? AND id=?',`users/${uid}/folders`,folderId).first()) return {status:400,body:{error:'Folder no longer exists.'}}
        clean.folderId = folderId
      }
    } else if(path === 'publicChat' || path.endsWith('/messages') || path.endsWith('/comments')) {
      clean = {text:check(data.text,2000,'message'),authorId:uid,authorName:user.name || 'Student'}
      if(path.endsWith('/messages') && !await stmt('SELECT id FROM community_items WHERE path=? AND id=?','chatRooms',path.split('/')[1]).first()) return {status:404,body:{error:'Room not found.'}}
      if(path.endsWith('/comments')) note = await noteInfo(path.split('/')[1],request,env,db)
    } else return {status:403,body:{error:'Write not allowed.'}}
    const existing = await stmt('SELECT owner FROM community_items WHERE path=? AND id=?',path,key).first()
    if(existing && existing.owner !== uid) return {status:403,body:{error:'Not your item.'}}
    const changes = [path.endsWith('/savedNotes')
      ? stmt("INSERT INTO community_items(path,id,owner,data,created) VALUES(?,?,?,json_set(?, '$.folderId', CASE WHEN ?='default' OR EXISTS(SELECT 1 FROM community_items WHERE path=? AND id=?) THEN ? ELSE 'default' END),?) ON CONFLICT(path,id) DO UPDATE SET data=excluded.data,created=excluded.created",path,key,uid,JSON.stringify(clean),clean.folderId,`users/${uid}/folders`,clean.folderId,clean.folderId,now)
      : path.endsWith('/favourites')
        ? stmt('INSERT INTO community_items(path,id,owner,data,created) VALUES(?,?,?,?,?) ON CONFLICT(path,id) DO NOTHING',path,key,uid,JSON.stringify(clean),now)
        : put(path,key,clean)]
    if(path.endsWith('/favourites')) {
      changes.push(stmt('INSERT OR IGNORE INTO community_likes(note,viewer) VALUES(?,?)',key,uid))
      if(!existing && note.owner !== uid) changes.push(notify(note.owner,`favourited “${note.title}”`,key))
    }
    if(path.endsWith('/recentNotes') && note.owner !== uid) changes.push(stmt('INSERT OR IGNORE INTO community_views(note,viewer,day) VALUES(?,?,?)',key,uid,new Date().toISOString().slice(0,10)))
    if(path.endsWith('/comments') && note.owner !== uid) changes.push(notify(note.owner,`commented on “${note.title}”: ${clean.text.slice(0,120)}`,path.split('/')[1]))
    await db.batch(changes)
    return {status:200,body:{id:key,ok:true}}
  } catch(error) {
    if(!error.status) console.error(JSON.stringify({event:'community_error',message:error.message}))
    return {status:error.status || 500,body:{error:error.status?error.message:'Community service unavailable. Please retry.'}}
  }
}
