import {readFileSync} from 'node:fs'
import assert from 'node:assert/strict'
const config=Object.fromEntries(readFileSync('.env.local','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1).trim()]}))
async function identity(action,body){const r=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:${action}?key=${config.VITE_FIREBASE_API_KEY}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw Error(data.error?.message||'Auth check failed');return data}
const account=await identity('signUp',{email:`creator-check-${Date.now()}@example.com`,password:crypto.randomUUID()+'Aa1!',returnSecureToken:true})
async function api(body){const r=await fetch('https://notesbhejde-masterji.sundarful.workers.dev/api/community',{method:'POST',headers:{Authorization:`Bearer ${account.idToken}`,'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:r.status,body:await r.json()}}
try{
  const state=await api({action:'monetization'})
  assert.equal(state.status,200,JSON.stringify(state.body));assert.equal(state.body.eligible,false);assert.equal(state.body.notes,0);assert.equal(state.body.enabled,false)
  const rejected=await api({action:'setMonetization',enabled:true,notes:100,likes:9000,averageRating:5})
  assert.equal(rejected.status,403,'Forged eligibility numbers must be rejected')
  const room=await api({action:'list',path:'publicChat'})
  assert.equal(room.status,200);assert.ok(room.body.items.filter(item=>item.authorName?.includes('Demo')).length>=14)
  console.log('Live checks passed: empty-account eligibility, forged enable rejection and seeded chat messages.')
}finally{await identity('delete',{idToken:account.idToken})}
