import './LoadingState.css'

export default function LoadingState({ label = 'Getting things ready', fullPage = false, skeleton = false, compact = false }) {
  return <div className={`study-loading${fullPage ? ' study-loading-page' : ''}${compact ? ' study-loading-compact' : ''}`} role="status" aria-live="polite">
    <div className="study-loading-caption"><span className="study-loading-book" aria-hidden="true"><i/><i/><i/></span><span>{label}<span className="study-loading-dots" aria-hidden="true"><i/><i/><i/></span></span></div>
    {skeleton && <div className="study-loading-grid" aria-hidden="true">{[0,1,2].map(key=><div className="study-loading-card" key={key}><span/><span/><span/><span/></div>)}</div>}
  </div>
}
