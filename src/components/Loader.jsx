import { ARCH_VIEWBOX, archPathD } from '../lib/arches'

export default function Loader({ t, done, gone }) {
  if (gone) return null
  return (
    <div className={`loader${done ? ' is-done' : ''}`} role="status" aria-live="polite">
      <svg className="loader__arches" viewBox={ARCH_VIEWBOX} aria-hidden="true">
        <path className="loader__stroke" d={archPathD} pathLength="1" />
        <path className="loader__fill" d={archPathD} />
      </svg>
      <p className="loader__label">{t.loading}</p>
    </div>
  )
}
