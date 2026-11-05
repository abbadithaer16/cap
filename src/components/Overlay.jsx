import { useEffect, useRef } from 'react'
import { store } from '../lib/store'
import { LABELS } from '../three/burgerSpec'

/*
 * DOM that the 3D scene positions every frame: exploded-view labels for
 * the burger and the curved line around the coffee spill. Decorative only;
 * the same words are in the section text for assistive tech.
 */
export default function Overlay({ t }) {
  const labelRefs = useRef([])
  const curve = useRef()

  useEffect(() => {
    store.labels = LABELS.map((spec, i) => ({ spec, el: labelRefs.current[i] }))
    store.curve = curve.current
    return () => {
      store.labels = []
      store.curve = null
    }
  }, [])

  return (
    <div className="overlay" aria-hidden="true">
      {LABELS.map((spec, i) => (
        <div
          key={spec.key}
          ref={(el) => (labelRefs.current[i] = el)}
          className={`blabel ${spec.side > 0 ? 'blabel--right' : 'blabel--left'}`}
        >
          <span>{t.build.labels[spec.key]}</span>
        </div>
      ))}
      <div className="curve" ref={curve}>
        <svg viewBox="-200 -200 400 400" width="400" height="400">
          <defs>
            <path id="spill-arc" d="M -114.6 -41.7 A 122 122 0 0 1 120.1 21.2" />
          </defs>
          <text className="curve__text">
            <textPath href="#spill-arc" startOffset="50%" textAnchor="middle">
              {t.cafe.curve}
            </textPath>
          </text>
        </svg>
      </div>
    </div>
  )
}
