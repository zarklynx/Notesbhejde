import {readFileSync} from 'node:fs'
import assert from 'node:assert/strict'
const config=Object.fromEntries(readFileSync('.env.local','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1).trim()]}))
const root='https://notesbhejde-masterji.sundarful.workers.dev'
const key=config.VITE_FIREBASE_API_KEY
async function identity(action,body) {
 const r=await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:${action}?key=${key}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const result=await r.json();assert.equal(r.status,200);return result
}
const email=`masterji-qa-${Date.now()}@example.com`,password=crypto.randomUUID()+'Aa1!'
const account=await identity('signUp',{email,password,returnSecureToken:true})
let asset
const headers={Authorization:`Bearer ${account.idToken}`,'Content-Type':'application/json',Origin:process.env.TEST_ORIGIN || 'http://127.0.0.1:5173'}
async function call(path,body) {
 const response=await fetch(`${root}${path}`,{method:'POST',headers,body:JSON.stringify(body)});const result=await response.json();assert.equal(response.status,200,JSON.stringify(result));return result
}
try {
 await identity('signInWithPassword',{email,password,returnSecureToken:true}); console.log('PASS registration/login')
 const marathi=await call('/api/masterji',{note:{title:'DBMS',content:'A primary key uniquely identifies each row and cannot be NULL.'},messages:[{role:'user',content:'Explain primary key in Marathi in two sentences.'}]});assert.match(marathi.answer,/[\u0900-\u097f]/);assert.doesNotMatch(marathi.answer,/only.*English|explain.*English/i);console.log('PASS first-request Marathi:',marathi.answer)
 const unrelated=await call('/api/masterji',{note:{title:'DBMS',content:'Primary keys identify rows.'},messages:[{role:'user',content:'What is Freefire?'}]});assert.equal(unrelated.mode,'off-topic');console.log('PASS off-topic redirect')
 const result=await call('/api/masterji',{note:{title:'DBMS',content:'A primary key uniquely identifies each table row. A primary key cannot contain NULL values.'},messages:[{role:'user',content:'What is a primary key? Answer in one sentence.'}]});assert.ok(result.answer);console.log('PASS Runware answer:',result.answer)
 const validated=await call('/api/validate-note',{title:'DBMS primary keys',description:'Primary keys identify rows in database tables.',content:'A primary key uniquely identifies each row in a relational database table. It cannot contain NULL values and must be unique. A composite primary key combines two or more columns.'});console.log('PASS validator:',JSON.stringify(validated))
 const voice=await fetch(`${root}/api/masterji/voice`,{method:'POST',headers,body:JSON.stringify({text:'Hello! Let us learn about primary keys, one step at a time.'})});assert.equal(voice.status,200);assert.ok((await voice.arrayBuffer()).byteLength>1000);console.log('PASS voice:',voice.headers.get('X-Masterji-Voice'))
 const form=new FormData();form.set('noteId',`qa-${crypto.randomUUID()}`);form.set('file',new Blob([readFileSync('output/pdf/MCA_DBMS_Primary_Keys.pdf')],{type:'application/pdf'}),'QA-primary-keys.pdf')
 const upload=await fetch(`${root}/api/notes/upload`,{method:'POST',headers:{Authorization:headers.Authorization,Origin:headers.Origin},body:form});asset=await upload.json();console.log('File upload status:',upload.status, upload.ok ? 'uploaded' : asset.error)
 if(upload.ok) {const pdf=await fetch(asset.secureUrl);assert.equal(pdf.status,200);console.log('PASS uploaded PDF retrieval')}
} finally {
 if(asset?.publicId) {const r=await fetch(`${root}/api/notes/delete`,{method:'POST',headers,body:JSON.stringify({publicId:asset.publicId,resourceType:asset.resourceType})});console.log('Temporary file cleanup:',r.status)}
 await identity('delete',{idToken:account.idToken})
}
