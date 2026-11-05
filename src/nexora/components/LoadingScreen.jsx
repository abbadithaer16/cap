import './LoadingScreen.css'

export default function LoadingScreen({ progress = 0, hiding = false }) {
  return (
    <div className={`loading-screen${hiding ? ' is-hiding' : ''}`} aria-hidden={hiding}>
      <div className="loading-screen__inner">
        <div className="loading-screen__mark">NEXORA</div>
        <div className="loading-screen__status">
          <span>INITIALIZING EXPERIENCE</span>
        </div>
        <div className="loading-screen__bar">
          <div className="loading-screen__bar-fill" style={{ width: `${Math.min(100, progress)}%` }} />
        </div>
        <div className="loading-screen__pct">{Math.round(Math.min(100, progress)).toString().padStart(2, '0')}%</div>
      </div>
    </div>
  )
}
