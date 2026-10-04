// Reuses the signed-in Firebase CLI account without printing any credentials.
import {createRequire} from 'node:module'
const require=createRequire(import.meta.url)
const auth=require('C:/Users/ADMIN/AppData/Roaming/npm/node_modules/firebase-tools/lib/auth.js')
const account=auth.findAccountByEmail('abhisheksd2003@gmail.com')
if(!account)throw new Error('Firebase project account is not signed in.')
const token=await auth.getAccessToken(account.tokens.refresh_token,[])
const base='https://identitytoolkit.googleapis.com/admin/v2/projects/notesbhejde-f5eaf'
for(const path of ['/defaultSupportedIdpConfigs/google.com','/config']) {
  const response=await fetch(base+path,{headers:{Authorization:`Bearer ${token.access_token}`}})
  const result=await response.json()
  if(path==='/config' && response.ok && process.argv.includes('--allow-local-ip') && !result.authorizedDomains?.includes('127.0.0.1')) {
    const updated=await fetch(base+'/config?updateMask=authorizedDomains',{method:'PATCH',headers:{Authorization:`Bearer ${token.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({authorizedDomains:[...result.authorizedDomains,'127.0.0.1']})})
    if(!updated.ok)throw new Error(`Could not authorize local IP: ${updated.status}`)
    console.log('Authorized 127.0.0.1 for local Google sign-in; existing domains preserved.')
  }
  console.log(JSON.stringify({path,status:response.status,enabled:result.enabled,hasClientId:Boolean(result.clientId),authorizedDomains:result.authorizedDomains,error:result.error?.message}))
}
