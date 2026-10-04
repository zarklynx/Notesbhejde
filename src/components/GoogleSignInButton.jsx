import LoadingState from './LoadingState'
import {useRef,useState} from 'react'
import {useAuth} from '../context/AuthContext'
import './GoogleSignInButton.css'

export default function GoogleSignInButton({disabled,onBusyChange,onSuccess,onError}) {
  const {googleLogin}=useAuth()
  const [busy,setBusy]=useState(false),pending=useRef(false)
  async function signIn() {
    if(pending.current || disabled)return
    pending.current=true;setBusy(true);onBusyChange?.(true);onError?.('')
    try {await googleLogin();onSuccess?.()} catch(error) {onError?.(error.message)} finally {pending.current=false;setBusy(false);onBusyChange?.(false)}
  }
  return <div className="google-auth"><button type="button" className="google-sign-in" disabled={disabled||busy} onClick={signIn}><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.03v2.52h3.24c1.9-1.75 2.98-4.33 2.98-7.38Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.39l-3.24-2.52c-.9.6-2.05.97-3.38.97-2.6 0-4.8-1.76-5.59-4.13H3.06v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.41 13.93A6 6 0 0 1 6.1 12c0-.67.11-1.32.31-1.93v-2.6H3.06A10 10 0 0 0 2 12c0 1.61.39 3.14 1.06 4.53l3.35-2.6Z"/><path fill="#EA4335" d="M12 5.94c1.47 0 2.79.51 3.82 1.52l2.86-2.86A9.59 9.59 0 0 0 12 2a10 10 0 0 0-8.94 5.47l3.35 2.6C7.2 7.7 9.4 5.94 12 5.94Z"/></svg><span>{busy?<LoadingState compact label="Connecting to Google" />:'Continue with Google'}</span></button><div className="google-auth-divider"><span>or use email</span></div></div>
}
