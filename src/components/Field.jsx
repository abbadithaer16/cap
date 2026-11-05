import { useEffect, useRef } from 'react'
import { subscribe } from '../lib/store'
import { COUNT, blend, handover, within } from '../lib/timeline'
import { lerp } from '../lib/math'
import ArchMark from './ArchMark'

/*
 * One flat colour per scene, like a series of posters. Between scenes the
 * next poster's colour rises with its own section's top edge, so colour and
 * text arrive together and nothing cross-fades through a muddy in-between.
 */
const COLORS = ['#DA291C', '#5C0A07', '#FFC72C', '#F09B0E', '#1C0C06']
const VIGNETTE = [0.55, 0.6, 0, 0.12, 0.8]
const TONE = ['light', 'light', 'dark', 'dark', 'light']

export default function Field() {
  const layers = useRef([])
  const vignette = useRef()
  const giant = useRef()

  // colour wipes follow the sections' real scroll position
  useEffect(() => {
    const sections = [...document.querySelectorAll('.scene')]
    const meta = document.querySelector('meta[name="theme-color"]')
    let raf = 0
    let lastTone = -1
    const wipe = () => {
      raf = 0
      const vh = window.innerHeight
      const tops = sections.map((s) => s.getBoundingClientRect().top)
      // the nav takes the tone of whichever colour is behind it
      let behindNav = 0
      tops.forEach((t, k) => {
        if (t <= 36) behindNav = k
      })
      if (behindNav !== lastTone) {
        lastTone = behindNav
        document.documentElement.dataset.tone = TONE[behindNav]
        meta?.setAttribute('content', COLORS[behindNav])
      }
      layers.current.forEach((el, k) => {
        if (!el) return
        const top = k === 0 ? -1 : tops[k]
        const covered = k < COUNT - 1 && tops[k + 1] <= 0
        if (top >= vh || covered) {
          el.style.visibility = 'hidden'
        } else {
          el.style.visibility = 'visible'
          el.style.clipPath = top > 0 ? `inset(${top.toFixed(1)}px 0 0 0)` : 'none'
        }
      })
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(wipe)
    }
    wipe()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  useEffect(
    () =>
      subscribe((p) => {
        vignette.current.style.opacity = String(blend(p, VIGNETTE, lerp))

        // the giant arches behind the fries rise into place and settle
        const rise = (1 - handover(p, 1)) * 10 - handover(p, 2) * 10
        const settle = within(p, 2)
        giant.current.style.transform = `translate3d(0, ${rise.toFixed(2)}%, 0) scale(${(1.06 - settle * 0.06).toFixed(4)})`
      }),
    [],
  )

  return (
    <div className="field" aria-hidden="true">
      {COLORS.map((color, k) => (
        <div
          key={color}
          className="field__layer"
          ref={(el) => (layers.current[k] = el)}
          style={{ backgroundColor: color, zIndex: k, visibility: k === 0 ? 'visible' : 'hidden' }}
        >
          {k === 2 && (
            <div className="field__giant" ref={giant}>
              <ArchMark className="field__giant-mark" />
            </div>
          )}
        </div>
      ))}
      <div className="field__vignette" ref={vignette} />
    </div>
  )
}
