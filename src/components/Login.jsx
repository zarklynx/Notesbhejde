import LoadingState from './LoadingState'
import {useRef,useState} from 'react'
import './Login.css'
import {useAuth} from '../context/AuthContext'
import GoogleSignInButton from './GoogleSignInButton'

export default function Login({onRegister,onLoginSuccess}) {
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[notice,setNotice]=useState(''),[loading,setLoading]=useState(false),[reset,setReset]=useState(false),[visible,setVisible]=useState(false)
  const pending=useRef(false)
  const {login,resetPassword}=useAuth()
  function changeMode(next) {setReset(next);setError('');setNotice('');setPassword('')}
  async function submit(e) {
    e.preventDefault();if(pending.current)return
    pending.current=true;setLoading(true);setError('');setNotice('')
    try {
      if(reset) {await resetPassword(email.trim());setNotice('If an account exists for this email, a password reset link has been sent. Check your inbox and spam folder.')}
      else {await login(email.trim(),password);onLoginSuccess?.()}
    } catch(error) {setError(error.message)} finally {pending.current=false;setLoading(false)}
  }
  return <main className="auth-page login-page"><section className="login-story" aria-label="Welcome to NotesBhejde"><span className="login-kicker">Your campus. Your study circle.</span><h2>Good notes.<br/>Great company.</h2><p>Learn from your classmates, share what you know, and get a little help from Masterji.</p><div className="login-study-card"><span>✦ Made for student life</span><strong>Learn · Share · Grow</strong><p>A community built around your next “Oh, now I get it!”</p></div></section><section className="auth-card login-card"><div className="auth-logo"><span>Notes</span><b>Bhejde</b></div><h1>{reset?'Forgot your password?':'Welcome back'}</h1><p className="auth-subtitle">{reset?'Enter your account email and we’ll send you a reset link.':'Your notes, classmates and study buddy are waiting.'}</p>{!reset && <GoogleSignInButton disabled={loading} onBusyChange={setLoading} onSuccess={onLoginSuccess} onError={message=>{setError(message);setNotice('')}} />}<form onSubmit={submit} aria-busy={loading}><label htmlFor="login-email">Email address</label><input id="login-email" name="email" type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" value={email} disabled={loading} onChange={e=>setEmail(e.target.value)} required/>{!reset && <><div className="login-password-label"><label htmlFor="login-password">Password</label><button type="button" disabled={loading} onClick={()=>changeMode(true)}>Forgot password?</button></div><div className="login-password"><input id="login-password" name="password" type={visible?'text':'password'} autoComplete="current-password" placeholder="Enter your password" value={password} disabled={loading} onChange={e=>setPassword(e.target.value)} required/><button type="button" aria-label={visible?'Hide password':'Show password'} aria-pressed={visible} disabled={loading} onClick={()=>setVisible(!visible)}>{visible?'Hide':'Show'}</button></div></>}{error && <p className="login-message login-error" role="alert">{error}</p>}{notice && <p className="login-message login-success" role="status">{notice}</p>}<button className="auth-button" disabled={loading}>{loading?<LoadingState compact label={reset?'Sending link':'Signing in'} />:reset?'Send reset link':'Sign in'}</button></form>{reset?<button className="login-back" disabled={loading} onClick={()=>changeMode(false)}>← Back to sign in</button>:<p className="switch-text">New to the study circle? <button disabled={loading} onClick={onRegister}>Create account</button></p>}<small className="login-footer">A little sharing goes a long way.</small></section></main>
}
