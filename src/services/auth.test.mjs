import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {runInNewContext} from 'node:vm'
const source=readFileSync(new URL('./auth.js',import.meta.url),'utf8').replace(/import[\s\S]*?from ["'][^"']+["'];/g,'').replace(/export /g,'')
function service(send) {return runInNewContext(`${source}\n({resetPassword,loginUser})`,{auth:{},sendPasswordResetEmail:send,signInWithEmailAndPassword:async(_,email,password)=>({user:{email,password}})})}
test('reset sends a trimmed email and login preserves password whitespace',async()=>{
  let received;const api=service(async(_,email)=>{received=email})
  await api.resetPassword(' student@example.com ');assert.equal(received,'student@example.com')
  const user=await api.loginUser(' student@example.com ',' password ')
  assert.equal(user.email,'student@example.com');assert.equal(user.password,' password ')
})
test('unknown reset email preserves privacy; network and throttling errors remain visible',async()=>{
  await service(async()=>{throw {code:'auth/user-not-found'}}).resetPassword('unknown@example.com')
  await assert.rejects(()=>service(async()=>{throw {code:'auth/network-request-failed'}}).resetPassword('student@example.com'),/internet connection/)
  await assert.rejects(()=>service(async()=>{throw {code:'auth/too-many-requests'}}).resetPassword('student@example.com'),/Too many attempts/)
})
test('Google sign-in creates a missing student record but preserves existing profile fields',async()=>{
  for(const exists of [false,true]) {
    const writes=[],parameters=[]
    const user={uid:'google-student',email:'student@example.com',displayName:'Student'}
    const api=runInNewContext(`${source}\n({loginWithGoogle})`,{
      auth:{},db:{},GoogleAuthProvider:class {setCustomParameters(value){parameters.push(value)}},
      signInWithPopup:async()=>({user}),doc:(_,collection,id)=>({collection,id}),
      getDoc:async()=>({exists:()=>exists}),serverTimestamp:()=>1,
      setDoc:async(...args)=>writes.push(args),
    })
    assert.equal(await api.loginWithGoogle(),user)
    assert.equal(parameters[0].prompt,'select_account')
    assert.equal(writes.length,exists?0:1)
    if(!exists) {assert.equal(writes[0][1].uid,user.uid);assert.equal(writes[0][2].merge,true)}
  }
})
test('blocked Google popups provide actionable errors',async()=>{
  const api=runInNewContext(`${source}\n({loginWithGoogle})`,{auth:{},GoogleAuthProvider:class{setCustomParameters(){}},signInWithPopup:async()=>{throw {code:'auth/popup-blocked'}}})
  await assert.rejects(()=>api.loginWithGoogle(),/Allow pop-ups/)
})
