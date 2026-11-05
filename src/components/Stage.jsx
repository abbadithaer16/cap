import { useEffect, useRef } from 'react'
import { store, subscribe } from '../lib/store'
import { HERO, LABELS, frame } from '../lib/choreo'
import { leftDoorD, legSpans } from '../lib/arches'
import { PRODUCTS } from '../lib/products'

/* Natural size of each cut-out; photos are only ever scaled down from this. */
const BASE = { bigmac: [748, 712], fries: [467, 643], mccafe: [416, 576] }

/* Arch drawing inside the hero viewBox: feet on HERO.FEET, centred on x = 600. */
const K = HERO.ARCH_H / 578
const ARCH_T = `translate(${600 - 600 * K} ${HERO.FEET - 890 * K}) scale(${K})`
const MIRROR = 'translate(1200 0) scale(-1 1)'
// shadows fall back and to the right, flattened onto the floor
const SHADOW_T = `matrix(1 0 -0.9 0.16 ${0.9 * HERO.FEET} ${HERO.FEET * 0.84})`
// lanes run from each foot toward the viewer, widening in perspective
const SPREAD = (800 - 640) / (HERO.FEET - 640)
const LANES = legSpans(660 * K).map(([a, b]) =>
  [
    [600 + a, HERO.FEET],
    [600 + b, HERO.FEET],
    [600 + b * SPREAD, 800],
    [600 + a * SPREAD, 800],
  ]
    .map((pt) => pt.map((n) => n.toFixed(1)).join(','))
    .join(' '),
)

function place(el, pose, [bw, bh]) {
  if (!el) return
  if (!pose) {
    el.style.visibility = 'hidden'
    return
  }
  el.style.visibility = 'visible'
  const s = pose.w / bw
  el.style.transform = `translate3d(${(pose.x - bw / 2).toFixed(1)}px, ${(pose.y - bh / 2).toFixed(1)}px, 0) rotate(${pose.r.toFixed(2)}deg) scale(${s.toFixed(4)})`
}

function placeShadow(el, pose, ratio, strength) {
  if (!el) return
  if (!pose) {
    el.style.visibility = 'hidden'
    return
  }
  const h = pose.w * ratio
  const sw = pose.w * 0.86
  el.style.visibility = 'visible'
  el.style.opacity = strength.toFixed(3)
  el.style.transform = `translate3d(${(pose.x - 200).toFixed(1)}px, ${(pose.y + h * 0.47 - 30).toFixed(1)}px, 0) scale(${(sw / 400).toFixed(4)})`
}

export default function Stage({ t }) {
  const floor = useRef()
  const arches = useRef()
  const doorL = useRef()
  const doorR = useRef()
  const shadowL = useRef()
  const shadowR = useRef()
  const img = useRef({})
  const shade = useRef({})
  const labels = useRef([])
  const curve = useRef()
  const spot = useRef()
  const pool = useRef()

  useEffect(() => {
    const apply = (p) => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const f = frame(p, vw, vh, { rtl: store.rtl, mobile: store.mobile })

      // opening scene: the two halves of the M slide apart
      for (const svg of [floor.current, arches.current]) {
        svg.style.display = f.hero.visible ? '' : 'none'
        svg.style.opacity = f.hero.opacity.toFixed(3)
        svg.style.transform = f.hero.drop ? `translate3d(0, ${f.hero.drop.toFixed(1)}px, 0)` : ''
      }
      const open = f.hero.open.toFixed(1)
      doorL.current.setAttribute('transform', `translate(${-open} 0)`)
      shadowL.current.setAttribute('transform', `translate(${-open} 0)`)
      doorR.current.setAttribute('transform', `translate(${open} 0)`)
      shadowR.current.setAttribute('transform', `translate(${open} 0)`)

      for (const key of ['bigmac', 'fries', 'mccafe']) {
        place(img.current[key], f[key], BASE[key])
        placeShadow(shade.current[key], f[key], BASE[key][1] / BASE[key][0], f.shadow[key])
      }

      // Big Mac labels: dot on the ingredient, line out past the bun, then the name
      const bm = f.bigmac
      labels.current.forEach((el, i) => {
        if (!el) return
        if (!bm || f.labels <= 0.001) {
          el.style.opacity = '0'
          return
        }
        const spec = LABELS[i]
        const h = bm.w * (BASE.bigmac[1] / BASE.bigmac[0])
        const left = bm.x - bm.w / 2
        const ax = left + spec.fx * bm.w
        const ay = bm.y - h / 2 + spec.fy * h
        const reach = spec.side > 0 ? left + bm.w - ax : ax - left
        el.style.opacity = f.labels.toFixed(3)
        el.style.transform = `translate3d(${ax.toFixed(1)}px, ${ay.toFixed(1)}px, 0)`
        el.style.setProperty('--len', `${(reach + 28).toFixed(0)}px`)
      })

      // curved McCafé line arcs over the floating cup
      const cup = f.mccafe
      if (cup && f.curve > 0.001) {
        const h = cup.w * (BASE.mccafe[1] / BASE.mccafe[0])
        curve.current.style.opacity = f.curve.toFixed(3)
        curve.current.style.transform = `translate3d(${cup.x.toFixed(1)}px, ${(cup.y - h * 0.1).toFixed(1)}px, 0) scale(${((h * 0.62) / 122).toFixed(4)})`
      } else {
        curve.current.style.opacity = '0'
      }

      // one warm spotlight for the last scene
      spot.current.style.opacity = f.spot.toFixed(3)
      spot.current.style.visibility = f.spot > 0.001 ? 'visible' : 'hidden'
      if (bm && f.spot > 0.001) {
        const h = bm.w * (BASE.bigmac[1] / BASE.bigmac[0])
        const floorY = bm.y + h * 0.47
        const k = bm.w / 400
        pool.current.style.transform = `translate3d(${bm.x.toFixed(1)}px, ${floorY.toFixed(1)}px, 0) scale(${(k * 2.2).toFixed(4)}, ${(k * 1.6).toFixed(4)})`
        spot.current.style.setProperty('--floor', `${floorY.toFixed(0)}px`)
      }
    }

    const unsubscribe = subscribe(apply)
    const onResize = () => apply(store.p)
    window.addEventListener('resize', onResize)
    return () => {
      unsubscribe()
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div className="stage" aria-hidden="true">
      <div className="spot" ref={spot}>
        <div className="spot__beam" />
        <div className="spot__pool" ref={pool} />
      </div>

      <svg className="hero-art" ref={floor} viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="lane" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e08a00" />
            <stop offset="1" stopColor="#ffb31a" />
          </linearGradient>
        </defs>
        <g ref={shadowL} className="hero-art__shadow">
          <g transform={SHADOW_T}>
            <path d={leftDoorD} transform={ARCH_T} />
          </g>
        </g>
        <g ref={shadowR} className="hero-art__shadow">
          <g transform={SHADOW_T}>
            <g transform={ARCH_T}>
              <path d={leftDoorD} transform={MIRROR} />
            </g>
          </g>
        </g>
        {LANES.map((pts) => (
          <polygon key={pts} points={pts} fill="url(#lane)" />
        ))}
      </svg>

      {['bigmac', 'fries', 'mccafe'].map((key) => (
        <div key={`${key}-shadow`} className="product-shadow" ref={(el) => (shade.current[key] = el)} />
      ))}
      <img className="product" ref={(el) => (img.current.bigmac = el)} src={PRODUCTS.bigmac} width={748} height={712} alt="" decoding="async" />
      <img className="product" ref={(el) => (img.current.fries = el)} src={PRODUCTS.fries} width={467} height={643} alt="" decoding="async" />
      <img className="product" ref={(el) => (img.current.mccafe = el)} src={PRODUCTS.mccafe} width={416} height={576} alt="" decoding="async" />

      <svg className="hero-art hero-art--front" ref={arches} viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="arch" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffcb2e" />
            <stop offset="1" stopColor="#f3a700" />
          </linearGradient>
        </defs>
        <g ref={doorL}>
          <path d={leftDoorD} transform={ARCH_T} fill="url(#arch)" />
        </g>
        <g ref={doorR}>
          <g transform={ARCH_T}>
            <path d={leftDoorD} transform={MIRROR} fill="url(#arch)" />
          </g>
        </g>
      </svg>

      {LABELS.map((spec, i) => (
        <div
          key={spec.key}
          ref={(el) => (labels.current[i] = el)}
          className={`plabel ${spec.side > 0 ? 'plabel--right' : 'plabel--left'}`}
        >
          <span className="plabel__inner">
            <i className="plabel__dot" />
            <i className="plabel__line" />
            <span className="plabel__text">{t.build.labels[spec.key]}</span>
          </span>
        </div>
      ))}

      <div className="curve" ref={curve}>
        <svg viewBox="-200 -200 400 400" width="400" height="400">
          <defs>
            <path id="cup-arc" d="M -114.6 -41.7 A 122 122 0 0 1 120.1 21.2" />
          </defs>
          <text className="curve__text">
            <textPath href="#cup-arc" startOffset="50%" textAnchor="middle">
              {t.cafe.curve}
            </textPath>
          </text>
        </svg>
      </div>
    </div>
  )
}
