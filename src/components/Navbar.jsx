import { useEffect, useState } from 'react'
import './Navbar.css'

const LINKS = ['TECH', 'AUDIO', 'MOBILE', 'GAMING']

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        <div className="navbar__logo">NEXORA</div>

        <nav className="navbar__links" aria-label="Primary">
          {LINKS.map((label) => (
            <a key={label} href="#" className="navbar__link">
              {label}
            </a>
          ))}
        </nav>

        <div className="navbar__actions">
          <button type="button" className="navbar__icon" aria-label="Search">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.2" y2="16.2" />
            </svg>
          </button>
          <button type="button" className="navbar__icon" aria-label="Cart">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 6h2l1.6 10.2a2 2 0 0 0 2 1.8h7a2 2 0 0 0 2-1.7L20 8H7" />
              <circle cx="10" cy="21" r="1" />
              <circle cx="17" cy="21" r="1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
