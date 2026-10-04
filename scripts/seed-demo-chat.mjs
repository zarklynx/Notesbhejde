// Creates clearly labelled demo students, not fabricated real activity.
import {readFileSync} from 'node:fs'
const config=Object.fromEntries(readFileSync('.env.local','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1).trim()]}))
const root='https://notesbhejde-masterji.sundarful.workers.dev'
async function request(url,body,token){const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw Error(data.error?.message||data.error||`Request failed ${r.status}`);return data}
const identity=(action,body)=>request(`https://identitytoolkit.googleapis.com/v1/accounts:${action}?key=${config.VITE_FIREBASE_API_KEY}`,body)
const community=(account,body)=>request(`${root}/api/community`,body,account.idToken)
const marker='[Study lounge demo v1]'
const people=[['Riya','owl'],['Arjun','notebook'],['Sana','plant'],['Dev','robot'],['Isha','star'],['Om','graduate']]
const script=[
  [0,'Anyone revising DBMS normalisation today? I keep mixing up 2NF and 3NF.'],
  [1,'2NF removes partial dependencies on a composite key. 3NF deals with the extra transitive dependencies. Start by writing the candidate keys.'],
  [2,'For 2NF, try Enrolment(StudentId, CourseId, StudentName, Grade). StudentName only depends on StudentId.'],
  [0,'That example helps! So StudentName goes into the Student table, right?'],
  [1,'Exactly. Keep Grade with the enrolment because it depends on both the student and the course.'],
  [3,'OS revision group: remember that an unsafe state is not necessarily a deadlock. That is an easy exam trap.'],
  [4,'And show Work after each process finishes in the Banker’s algorithm. Don’t just write the final safe sequence.'],
  [5,'I’m doing networks next. TCP gives ordered reliable bytes, but the application still needs to define message boundaries.'],
  [2,'Yes! And transport acknowledgement does not mean a database transaction completed.'],
  [4,'Good reminder. I’m saving the revision notes in a Networks folder.'],
  [3,'Anyone want a quick practice question? Explain flow control versus congestion control in two sentences.'],
  [5,'Flow control protects the receiver. Congestion control protects the network. Both limit what the sender can send.'],
  [0,'Nice. This room makes last-minute revision less scary 🙂'],
  [1,'One topic at a time. Understand the example, then practise without looking at the answer.']
]
const checker=await identity('signUp',{email:`chat-check-${Date.now()}@example.com`,password:crypto.randomUUID()+'Aa1!',returnSecureToken:true})
try{const {items}=await community(checker,{action:'list',path:'publicChat'});if(items.some(item=>item.text.includes(marker)))throw Error('This demo conversation already exists; no duplicates created.')}finally{await identity('delete',{idToken:checker.idToken})}
const accounts=[]
for(const [index,[name,avatarVariant]] of people.entries()){
  const account=await identity('signUp',{email:`study-chat-demo-${Date.now()}-${index}@example.com`,password:crypto.randomUUID()+'Aa1!',returnSecureToken:true})
  await identity('update',{idToken:account.idToken,displayName:`${name} · Demo`,returnSecureToken:true})
  const refreshed=await request(`https://securetoken.googleapis.com/v1/token?key=${config.VITE_FIREBASE_API_KEY}`,{grant_type:'refresh_token',refresh_token:account.refreshToken})
  account.idToken=refreshed.id_token
  await community(account,{action:'put',path:'publicProfiles',id:account.localId,data:{displayName:`${name} · Demo`,course:'MCA · Demo student',bio:'Sample profile for the study lounge demonstration. Messages are fictional demo activity.',avatarVariant}})
  accounts.push(account)
}
for(const [index,[person,text]] of script.entries())await community(accounts[person],{action:'put',path:'publicChat',data:{text:index===0?`${marker} ${text}`:text}})
console.log('Added 14 demo study messages from 6 visibly labelled demo students.')
