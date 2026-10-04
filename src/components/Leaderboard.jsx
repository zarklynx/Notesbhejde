import './Monetization.css'
import { useEffect, useMemo, useState } from 'react'
import { FaTrophy, FaHeart, FaEye } from 'react-icons/fa'
import { watchItems, watchStats } from '../services/community'
import { studentRankings } from '../services/rankings'
import ProfileAvatar from './ProfileAvatar'
import LoadingState from './LoadingState'
import './Leaderboard.css'

const periods = [['week','This week'],['month','This month'],['year','This year']]

export default function Leaderboard({ notes = [], onProfile }) {
  const [period,setPeriod]=useState('week')
  const [stats,setStats]=useState([]),[profiles,setProfiles]=useState([])
  const [loading,setLoading]=useState(true),[error,setError]=useState('')
  useEffect(()=>watchItems('publicProfiles',setProfiles,e=>setError(e.message)),[])
  useEffect(()=>{setLoading(true);setError('');setStats([]);return watchStats(items=>{setStats(items);setLoading(false)},e=>{setError(e.message);setLoading(false)},period)},[period])
  const rows=useMemo(()=>studentRankings(notes,stats),[notes,stats])
  const names=useMemo(()=>new Map(profiles.map(p=>[p.id,p])),[profiles])
  return <section className="leaderboard-page" aria-label="Student leaderboard">
    <header className="leaderboard-heading"><span className="leaderboard-emblem"><FaTrophy /></span><div><span className="leaderboard-eyebrow">A little recognition, a lot of learning</span><h1>Campus leaderboard</h1><p>For the students making everyone’s notes a little better.</p></div></header>
    <div className="leaderboard-tabs" role="group" aria-label="Ranking period">{periods.map(([id,label])=><button key={id} aria-pressed={period===id} onClick={()=>setPeriod(id)}>{label}</button>)}</div>
    <p className="leaderboard-explainer">Final standing uses the average of favourites rank and views rank. Lower averages win; ties share a rank. Current calendar periods use UTC.</p>
    {error && <p role="alert" className="leaderboard-error">{error}</p>}
    {loading ? <LoadingState label="Getting the standings" skeleton /> : !rows.length ? <p className="leaderboard-empty">No reader activity recorded for this period yet. Share a useful note to get things started.</p> : <div className="leaderboard-list">{rows.map(row=>{
      const profile=names.get(row.id),note=notes.find(n=>n.ownerId===row.id),name=profile?.displayName || note?.ownerName || 'Student'
      return <article key={row.id} className={`leaderboard-row ${row.rank<=3?'leaderboard-top':''}`}>
        <span className="leaderboard-place" aria-label={`Leaderboard position ${row.rank}`}>#{row.rank}</span>
        <button className="leaderboard-person" onClick={()=>onProfile?.(row.id,name)}><ProfileAvatar userId={row.id} variant={profile?.avatarVariant} photoURL={profile?.photoURL} size={44} label={`${name}'s avatar`} /><span><strong>{name}</strong><span className="student-badge">{row.rank===1?'🏆 Campus champion':row.rank===2?'🥈 Top contributor':row.rank===3?'🥉 Rising star':'✦ '+row.level}</span><small>{profile?.course || `${row.notes} shared ${row.notes===1?'note':'notes'}`}</small></span></button>
        <div className="leaderboard-metric"><span><FaHeart /> Favourites</span><strong>#{row.favouritesRank}</strong><small>{row.favourites} received</small></div>
        <div className="leaderboard-metric"><span><FaEye /> Views</span><strong>#{row.viewsRank}</strong><small>{row.views} reader views</small></div>
        <div className="leaderboard-average"><span>Final rank</span><strong>#{row.averageRank}</strong></div>
      </article>
    })}</div>}
    <small className="leaderboard-footnote">Students with public notes and reader activity are eligible. Views count once per signed-in reader per note per day. Favourites count those added during the selected period that are still retained. Rankings reflect sharing, not grades.</small>
  </section>
}
