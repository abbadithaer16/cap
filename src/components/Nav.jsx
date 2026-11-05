import ArchMark from './ArchMark'
import { OFFICIAL_URL } from '../lib/copy'

export default function Nav({ t, onToggleLang }) {
  return (
    <header className="nav">
      <a className="nav__brand" href="#top" aria-label={`${t.brand}, ${t.concept}`}>
        <ArchMark className="nav__mark" />
        <span className="nav__name">{t.brand}</span>
        <span className="nav__tag">{t.concept}</span>
      </a>
      <div className="nav__actions">
        <button
          type="button"
          className="nav__lang"
          onClick={onToggleLang}
          aria-label={t.switchLabel}
          lang={t.dir === 'rtl' ? 'en' : 'ar'}
        >
          {t.switchTo}
        </button>
        <a className="nav__official" href={OFFICIAL_URL} target="_blank" rel="noopener noreferrer">
          {t.official}
          <span aria-hidden="true"> ↗</span>
        </a>
      </div>
    </header>
  )
}
