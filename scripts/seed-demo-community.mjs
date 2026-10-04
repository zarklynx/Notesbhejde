// Run once to add labelled sample MCA students and activity. Never prints credentials.
import { readFileSync } from 'node:fs'
const config=Object.fromEntries(readFileSync('.env.local','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1).trim()]}))
const root='https://notesbhejde-masterji.sundarful.workers.dev'
async function request(url,body,token,method='POST') {
  const response=await fetch(url,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify(body)})
  const result=await response.json();if(!response.ok)throw new Error(result.error?.message || result.error || `Request failed: ${response.status}`);return result
}
const identity=(action,body)=>request(`https://identitytoolkit.googleapis.com/v1/accounts:${action}?key=${config.VITE_FIREBASE_API_KEY}`,body)
const community=(a,body)=>request(`${root}/api/community`,body,a.idToken)
const examples=[
  {name:'Aarav · Demo',avatar:'notebook',title:'MCA DBMS: Normalisation and Functional Dependencies',description:'Worked examples of 1NF, 2NF and 3NF, with common exam mistakes.',tags:['MCA','DBMS','Normalisation'],content:`Normalisation organises relations to reduce redundancy and insertion, update and deletion anomalies.

1. Functional dependency: X → Y means that equal X values must have equal Y values. In Student(StudentId, Name, DepartmentId, DepartmentName), StudentId determines Name and DepartmentId; DepartmentId determines DepartmentName.

2. First normal form (1NF): each cell contains one atomic value. Do not store several phone numbers in one cell. Use StudentPhone(StudentId, PhoneNumber) instead.

3. Second normal form (2NF): the relation is in 1NF and every non-key attribute depends on the whole of each candidate key. In Enrolment(StudentId, CourseId, StudentName, Grade), the key is (StudentId, CourseId). StudentName depends only on StudentId. Split Student(StudentId, StudentName) from Enrolment(StudentId, CourseId, Grade).

4. Third normal form (3NF): for every non-trivial dependency X → A, X is a superkey or A is prime. In the Student example, DepartmentName depends transitively on StudentId through DepartmentId. Split Department(DepartmentId, DepartmentName) from Student(StudentId, Name, DepartmentId).

5. A good decomposition should be lossless: joining its relations reconstructs the original relation without extra rows. Dependency preservation means constraints can be checked without joining relations.

Exam practice: identify the candidate key, list dependencies, name the violated normal form, and show the decomposed tables. Normalisation does not automatically make every query faster; joins can introduce overhead.`},
  {name:'Meera · Demo',avatar:'owl',title:'MCA Operating Systems: Deadlocks and Banker’s Algorithm',description:'Four necessary conditions, safe states and a resource-request example.',tags:['MCA','Operating Systems','Deadlock'],content:`A deadlock occurs when processes wait indefinitely for resources held by one another.

1. All four conditions must hold: mutual exclusion, hold and wait, no preemption, and circular wait. Breaking at least one prevents deadlock.

2. Prevention imposes restrictions, such as a global resource ordering to prevent circular wait. Avoidance checks each allocation before granting it. Detection allows deadlocks and then recovers, for example by terminating a process.

3. A safe state has an ordering in which every process can obtain its remaining maximum resources, finish, and release them. An unsafe state is not necessarily already deadlocked.

4. Banker’s algorithm uses Available, Allocation, Max and Need, where Need = Max − Allocation. Starting with Work = Available, find an unfinished process whose Need is no larger than Work. Simulate completion by adding its Allocation to Work. Repeat. If all processes finish, the state is safe.

5. Example with one resource type: Available = 3. P0 holds 1 and needs 2; P1 holds 2 and needs 4. P0 can finish, returning 1, so Work becomes 4. P1 can then finish. The sequence P0, P1 is safe.

6. To evaluate a request, first check Request ≤ Need and Request ≤ Available. Tentatively allocate and run the safety algorithm. Grant only if the resulting state is safe; otherwise restore the previous values.

Exam tip: always show Work after each simulated completion. Do not confuse starvation with deadlock: starvation can occur even when other processes keep progressing.`},
  {name:'Kabir · Demo',avatar:'robot',title:'MCA Computer Networks: TCP, UDP and Reliable Delivery',description:'Compare transports, understand acknowledgements, and revise the TCP handshake.',tags:['MCA','Networks','TCP'],content:`The transport layer provides process-to-process communication through port numbers. IP handles routing between hosts.

1. TCP is connection-oriented and provides a reliable, ordered byte stream. It uses sequence numbers, acknowledgements, retransmissions and flow control. It does not preserve application message boundaries: applications must define framing.

2. UDP sends independent datagrams without delivery or ordering guarantees. It has lower protocol overhead. DNS commonly uses UDP, while live media may prefer timeliness over retransmitting old packets. Applications can implement their own reliability over UDP.

3. TCP establishment: the client sends SYN with sequence number x. The server sends SYN-ACK with sequence number y and acknowledgement x+1. The client acknowledges y+1. SYN consumes one sequence number.

4. A cumulative acknowledgement identifies the next byte expected. If bytes 100 through 149 arrive in order, an acknowledgement of 150 means the receiver expects byte 150 next. Lost data can trigger retransmission through a timer or duplicate acknowledgements.

5. Flow control protects the receiver through its advertised window. Congestion control protects the network using a congestion window. They solve different problems; the sender is constrained by both.

6. TCP does not provide encryption by itself. HTTPS combines HTTP with TLS, usually over TCP. HTTP/3 uses QUIC over UDP and integrates encrypted transport.

Revision exercise: explain why TCP reliability does not guarantee that the application successfully processed a message. A transport acknowledgement confirms receipt by the transport endpoint, not completion of a business transaction.`}
]
const database=`https://firestore.googleapis.com/v1/projects/${config.VITE_FIREBASE_PROJECT_ID}/databases/(default)/documents`
const checker=await identity('signUp',{email:`demo-check-${Date.now()}@example.com`,password:crypto.randomUUID()+'Aa1!',returnSecureToken:true})
let existing
try {
  existing=await request(`${database}:runQuery`,{structuredQuery:{from:[{collectionId:'notes'}],where:{fieldFilter:{field:{fieldPath:'visibility'},op:'EQUAL',value:{stringValue:'public'}}}}},checker.idToken)
} finally {await identity('delete',{idToken:checker.idToken})}
if(existing.some(d=>d.document?.fields?.demoBatch?.stringValue==='mca-community-v1'))throw new Error('Demo batch already exists; no duplicate users or notes created.')
const accounts=[],notes=[]
for(const [i,example] of examples.entries()) {
  let a=await identity('signUp',{email:`mca-demo-${Date.now()}-${i}@example.com`,password:crypto.randomUUID()+'Aa1!',returnSecureToken:true})
  await identity('update',{idToken:a.idToken,displayName:example.name,returnSecureToken:true})
  const refreshed=await request(`https://securetoken.googleapis.com/v1/token?key=${config.VITE_FIREBASE_API_KEY}`,{grant_type:'refresh_token',refresh_token:a.refreshToken})
  a.idToken=refreshed.id_token
  accounts.push(a)
  await community(a,{action:'put',path:'publicProfiles',id:a.localId,data:{displayName:example.name,course:'MCA · Demo profile',bio:'Sample student created for testing. Comments and engagement on these sample notes are demo activity.',avatarVariant:example.avatar}})
  const fields=Object.fromEntries(Object.entries({ownerId:a.localId,ownerName:example.name,topic:example.title,subject:'MCA',info:example.description,content:example.content,visibility:'public',demoBatch:'mca-community-v1'}).map(([k,v])=>[k,{stringValue:v}]))
  // The existing Firestore rules reserve isDemo=true for administrative imports.
  // These normal student uploads remain visibly labelled by owner, tag and bio.
  fields.isDemo={booleanValue:false};fields.isSample={booleanValue:true};fields.createdAt={timestampValue:new Date().toISOString()};fields.updatedAt=fields.createdAt;fields.tags={arrayValue:{values:[...example.tags,'Demo'].map(stringValue=>({stringValue}))}}
  const note=await request(`${database}/notes`,{fields},a.idToken)
  notes.push(note.name.split('/').pop())
}
for(const [i,a] of accounts.entries()) {
  for(const [j,noteId] of notes.entries()) if(i!==j) {
    await community(a,{action:'put',path:`users/${a.localId}/favourites`,id:noteId,data:{}})
    await community(a,{action:'put',path:`users/${a.localId}/recentNotes`,id:noteId,data:{}})
    await community(a,{action:'put',path:`notes/${noteId}/comments`,data:{text:`Demo feedback: ${['The worked example made this much easier to revise.','Useful exam notes! The final revision question is a good check.','Clear explanation. I would also practise one more numerical example.'][i]}`}})
  }
}
console.log('Added 3 labelled demo MCA profiles, 3 notes, 6 comments, 6 favourites and 6 reader views.')
