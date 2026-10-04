import {useEffect,useState} from 'react'
import {useAuth} from '../context/AuthContext'
import {communityRequest} from '../services/community'

export default function NoteRating({noteId,ownerId}) {
  const {user}=useAuth()
  const [state,setState]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState('')
  useEffect(()=>{let active=true;communityRequest({action:'rating',id:noteId}).then(value=>{if(active)setState(value)}).catch(e=>{if(active)setError(e.message)});return()=>{active=false}},[noteId])
  async function rate(rating){setBusy(true);setError('');try{await communityRequest({action:'rate',id:noteId,rating});setState(await communityRequest({action:'rating',id:noteId}))}catch(e){setError(e.message)}finally{setBusy(false)}}
  return <section className="note-rating" aria-label="Rate this note"><div><strong>How useful was this note?</strong><small>{state?state.count?`${state.average.toFixed(1)} / 5 · ${state.count} reader ratings`:'No ratings yet':'Loading ratings…'}</small></div>{user.uid!==ownerId?<div role="group" aria-label="Choose a rating from one to five">{[1,2,3,4,5].map(value=><button key={value} disabled={busy||!state} aria-label={`Rate ${value} out of 5`} aria-pressed={state?.mine===value} onClick={()=>rate(value)}>{value<=state?.mine?'★':'☆'}</button>)}</div>:<small>Readers can rate your note.</small>}{error&&<p role="alert">{error}</p>}</section>
}
