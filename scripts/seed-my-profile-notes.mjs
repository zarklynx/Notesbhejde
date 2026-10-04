// Explicitly requested sample notes for the verified account. No auth settings are changed.
import {createRequire} from 'node:module'
const require=createRequire(import.meta.url)
const auth=require('C:/Users/ADMIN/AppData/Roaming/npm/node_modules/firebase-tools/lib/auth.js')
const account=auth.findAccountByEmail('abhisheksd2003@gmail.com')
if(!account)throw Error('Sign into the Firebase CLI first.')
const {access_token}=await auth.getAccessToken(account.tokens.refresh_token,[])
const headers={Authorization:`Bearer ${access_token}`,'Content-Type':'application/json'}
const lookup=await fetch('https://identitytoolkit.googleapis.com/v1/projects/notesbhejde-f5eaf/accounts:lookup',{method:'POST',headers,body:JSON.stringify({email:['abhisheksd2003@gmail.com']})})
const data=await lookup.json(),user=data.users?.find(u=>u.email==='abhisheksd2003@gmail.com' && u.providerUserInfo?.some(p=>p.providerId==='google.com'))
if(!lookup.ok||!user)throw Error('The requested Google user could not be verified.')
const samples=[
  ['dbms-transactions','MCA DBMS: ACID Transactions and Isolation','DBMS',['MCA','DBMS','Transactions'],`A database transaction groups operations into one logical unit of work. A bank transfer must debit one account and credit another together.

1. Atomicity: either every operation commits or none does. A rollback restores the transaction’s changes when an operation fails.
2. Consistency: a successful transaction preserves declared constraints and application invariants. The database cannot infer every business rule; applications must implement those rules correctly.
3. Isolation: concurrent transactions should not interfere in ways forbidden by the chosen isolation level. A dirty read observes uncommitted data. A non-repeatable read observes a changed row; a phantom read observes a changed set of matching rows.
4. Durability: committed changes survive failures within the database’s durability guarantees. Write-ahead logging records recovery information before affected data pages are persisted.

Serializable isolation aims for an outcome equivalent to some serial transaction order. Lower isolation can improve concurrency but requires understanding permitted anomalies.

Example: T1 reads an account balance of 100; T2 also reads 100. If both add 10 and write 110, one increment is lost. Use an atomic update or appropriate concurrency control instead.

Exam practice: explain why a transaction can be atomic but still run at an isolation level that permits anomalies.`],
  ['os-memory','MCA Operating Systems: Paging and Virtual Memory','Operating Systems',['MCA','OS','Memory'],`Virtual memory gives each process a virtual address space. The operating system and hardware map virtual addresses to physical frames.

1. Paging divides virtual memory into fixed-size pages and physical memory into frames. A page table stores mappings and protection bits. The address splits into a page number and an offset.
2. Example: with 4 KB pages, virtual address 12,345 has page number 3 and offset 57. If page 3 maps to frame 8, the physical address is 8 × 4,096 + 57 = 32,825.
3. A translation lookaside buffer (TLB) caches recent address translations. A TLB miss needs translation lookup; it does not necessarily mean a page fault.
4. A page fault occurs when an access cannot be satisfied by the current mapping. A valid non-resident page may be loaded from backing storage. An invalid access can terminate the process.
5. FIFO replaces the oldest loaded page and can exhibit Belady’s anomaly. LRU approximates recent usage. Optimal replacement removes the page whose next use is furthest away, but needs knowledge of the future.

Thrashing happens when excessive page faults dominate useful execution, often because active working sets exceed available memory.

Revision question: distinguish a TLB miss from a page fault and show the page-number/offset calculation.`],
  ['dsa-complexity','MCA DSA: Complexity, Binary Search and Sorting','Data Structures',['MCA','Algorithms','Sorting'],`Complexity describes how resource requirements grow as input size n increases. Big O is an asymptotic upper bound, not a measured execution time.

1. Linear search takes O(n) time in the worst case. Binary search repeatedly halves a sorted search interval, taking O(log n) comparisons.
2. Binary search requires ordered data and efficient access to the middle element. Keep low and high bounds consistent with the chosen inclusive or half-open interval.
3. Bubble sort and insertion sort have O(n²) worst-case time. Insertion sort can be efficient on small, nearly sorted inputs.
4. Merge sort takes O(n log n) time and typically O(n) auxiliary memory for arrays. A standard merge can preserve stability by selecting the left element first when keys tie.
5. Quicksort has expected O(n log n) time with suitable pivot selection, but O(n²) worst-case time. Randomisation reduces predictable bad cases without eliminating the theoretical worst case.

Two nested loops do not automatically mean O(n²). Count total iterations: a loop whose inner bound doubles each step may contribute a logarithmic factor.

Exam exercise: trace binary search for 17 in [3, 8, 12, 17, 23, 31]. Compare algorithms by time, extra space and stability rather than saying one is always best.`],
  ['se-testing','MCA Software Engineering: Testing and Test Cases','Software Engineering',['MCA','Testing','Software Engineering'],`Testing evaluates software behaviour against expected requirements and helps discover failures. It cannot generally prove the absence of every defect.

1. Unit tests check small components in isolation. Integration tests check interactions between components. System tests exercise complete workflows, while acceptance tests evaluate stakeholder requirements.
2. Equivalence partitioning divides input into groups expected to behave similarly. For a valid age range of 18–60, use representative values below, within and above the range.
3. Boundary-value analysis checks edges: 17, 18, 19, 59, 60 and 61. Boundaries often expose comparison mistakes.
4. A test case should include an identifier, preconditions, inputs, steps, expected result and actual result. Avoid vague outcomes such as “works properly.”
5. Regression tests protect existing behaviour after changes. Smoke tests check a small set of critical paths before deeper testing.

Example for note publishing: valid academic content should be accepted; unrelated content should be rejected with a useful message; a network failure should show retry feedback rather than falsely claiming success.

Revision task: write login cases for valid credentials, wrong password, empty fields and interrupted connectivity. Never place real passwords in screenshots or test reports.`]
]
const base='https://firestore.googleapis.com/v1/projects/notesbhejde-f5eaf/databases/(default)/documents/notes/'
const notes=[]
for(const [slug,topic,unit,tags,content]of samples){
  const id=`profile-demo-v1-${user.localId}-${slug}`,url=base+id
  const existing=await fetch(url,{headers})
  if(existing.ok){const doc=await existing.json();if(doc.fields?.ownerId?.stringValue!==user.localId || doc.fields?.demoBatch?.stringValue!=='my-profile-v1')throw Error('Sample ID already belongs to different data.');notes.push({id,topic});continue}
  if(existing.status!==404)throw Error(`Could not inspect sample note: ${existing.status}`)
  const strings={ownerId:user.localId,ownerName:user.displayName||'Abhishek',topic,subject:'MCA',info:`${unit} revision notes. Sample note with clearly labelled demo engagement for testing.`,content,visibility:'public',demoBatch:'my-profile-v1'}
  const fields=Object.fromEntries(Object.entries(strings).map(([k,v])=>[k,{stringValue:v}]))
  fields.isDemo={booleanValue:false};fields.isSample={booleanValue:true};fields.tags={arrayValue:{values:[...tags,'Demo'].map(stringValue=>({stringValue}))}};fields.createdAt={timestampValue:new Date().toISOString()};fields.updatedAt=fields.createdAt
  const result=await fetch(url+'?currentDocument.exists=false',{method:'PATCH',headers,body:JSON.stringify({fields})})
  if(!result.ok)throw Error(`Could not create sample note: ${result.status}`)
  notes.push({id,topic})
}
console.log(JSON.stringify({uid:user.localId,name:user.displayName,notes}))
