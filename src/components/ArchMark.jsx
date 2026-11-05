import { ARCH_VIEWBOX, archPathD } from '../lib/arches'

export default function ArchMark({ className, title }) {
  return (
    <svg
      className={className}
      viewBox={ARCH_VIEWBOX}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      <path d={archPathD} fill="currentColor" />
    </svg>
  )
}
