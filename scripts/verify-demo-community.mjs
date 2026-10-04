import {readFileSync} from 'node:fs'
import assert from 'node:assert/strict'
import {initializeApp} from 'firebase/app'
import {getAuth,createUserWithEmailAndPassword,deleteUser} from 'firebase/auth'
import {getFirestore,collection,getDocs,query,where} from 'firebase/firestore/lite'
const values=Object.fromEntries(readFileSync('.env.local','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1).trim()]}))
const app=initializeApp({apiKey:values.VITE_FIREBASE_API_KEY,projectId:values.VITE_FIREBASE_PROJECT_ID,authDomain:values.VITE_FIREBASE_AUTH_DOMAIN})
const auth=getAuth(app),db=getFirestore(app)
const {user}=await createUserWithEmailAndPassword(auth,`demo-verify-${Date.now()}@example.com`,crypto.randomUUID()+'Aa1!')
try {
  const notes=await getDocs(query(collection(db,'notes'),where('visibility','==','public')))
  const samples=notes.docs.filter(n=>n.data().demoBatch==='mca-community-v1')
  assert.equal(samples.length,3)
  const token=await user.getIdToken()
  async function call(body) {
    const response=await fetch('https://notesbhejde-masterji.sundarful.workers.dev/api/community',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(body)})
    assert.equal(response.status,200);return response.json()
  }
  const stats=await call({action:'stats'})
  for(const period of ['week','month','year']) {
    const result=await call({action:'stats',period})
    assert.equal(result.period,period);assert.equal(result.timezone,'UTC')
    assert.ok(result.since>0)
    for(const sample of samples) {
      const current=result.items.find(s=>s.id===sample.id),all=stats.items.find(s=>s.id===sample.id)
      assert.ok(current.views<=all.views && current.favourites<=all.favourites)
    }
  }
  for(const note of samples) {
    const stat=stats.items.find(s=>s.id===note.id)
    assert.ok(stat.views>=2);assert.ok(stat.favourites>=2)
    const comments=await call({action:'list',path:`notes/${note.id}/comments`})
    assert.equal(comments.items.filter(c=>c.text.startsWith('Demo feedback:')).length,2)
    const profile=await call({action:'list',path:'publicProfiles',id:note.data().ownerId})
    assert.ok(profile.items[0].displayName.includes('Demo'))
  }
  console.log('PASS Firebase Lite reads; demo profiles, comments, favourites, views and weekly/monthly/yearly statistics verified.')
} finally {await deleteUser(user)}
