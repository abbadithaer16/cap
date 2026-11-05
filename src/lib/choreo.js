import { clamp, easeInCubic, easeInOutCubic, lerp, smootherstep, smoothstep } from './math'
import { arrive, handover, leave, within } from './timeline'

/*
 * Where every product photo sits for a given scroll position p.
 * All poses are pure functions of p and the viewport, in CSS pixels:
 * { x, y } is the centre of the photo, w its width, r its rotation (deg).
 */

/* Height / width of each cut-out photo. */
export const RATIO = { bigmac: 712 / 748, fries: 643 / 467, mccafe: 576 / 416 }

/* The hero art is an SVG with viewBox 0 0 1200 800, preserveAspectRatio xMidYMax slice. */
export const HERO = { W: 1200, H: 800, FEET: 700, ARCH_H: 280 }

export function heroMap(vw, vh) {
  const s = Math.max(vw / HERO.W, vh / HERO.H)
  return { s, x0: (vw - HERO.W * s) / 2, y0: vh - HERO.H * s }
}

/** How far each half of the M has slid open, in viewBox units. */
export const doorsOpen = (p) => smootherstep(0.06, 0.5, p) * 390

/**
 * Label anchors on the Big Mac photo, as fractions of the photo box.
 * Side +1 puts the text to the right of the burger, -1 to the left.
 */
export const LABELS = [
  { key: 'crown', fx: 0.8, fy: 0.18, side: 1 },
  { key: 'onions', fx: 0.71, fy: 0.325, side: 1 },
  { key: 'pickles', fx: 0.8, fy: 0.485, side: 1 },
  { key: 'sauce', fx: 0.855, fy: 0.54, side: 1 },
  { key: 'patty', fx: 0.13, fy: 0.365, side: -1 },
  { key: 'lettuce', fx: 0.04, fy: 0.455, side: -1 },
  { key: 'club', fx: 0.12, fy: 0.625, side: -1 },
  { key: 'cheese', fx: 0.08, fy: 0.78, side: -1 },
]

const pose = (x, y, w, r = 0) => ({ x, y, w, r })
const mix = (a, b, t) => pose(lerp(a.x, b.x, t), lerp(a.y, b.y, t), lerp(a.w, b.w, t), lerp(a.r, b.r, t))

export function frame(p, vw, vh, { rtl = false, mobile = false } = {}) {
  const side = (f) => (rtl ? 1 - f : f) * vw
  const w0 = handover(p, 0)
  const w1 = handover(p, 1)
  const w2 = handover(p, 2)
  const w3 = handover(p, 3)
  const hero = heroMap(vw, vh)

  // ---------- Big Mac: behind the arches → exploded labels → spotlight ----------
  const bmClosedW = 150 * hero.s
  const bmClosed = pose(vw / 2, hero.y0 + (HERO.FEET - 6) * hero.s - (bmClosedW * RATIO.bigmac) / 2, bmClosedW)
  const bmOpenW = mobile ? 0.62 * vw : Math.min(0.34 * vw, (0.46 * vh) / RATIO.bigmac)
  const bmOpen = pose(vw / 2, (mobile ? 0.64 : 0.6) * vh, bmOpenW)
  const bmHoldW = mobile ? Math.min(0.72 * vw, (0.34 * vh) / RATIO.bigmac) : Math.min(0.3 * vw, (0.6 * vh) / RATIO.bigmac)
  const bmHold = pose(mobile ? vw / 2 : side(0.68), (mobile ? 0.72 : 0.54) * vh, bmHoldW * (1 + 0.05 * within(p, 1)))
  const bmStageW = mobile ? 0.56 * vw : Math.min(0.26 * vw, (0.36 * vh) / RATIO.bigmac)
  const bmStage = pose(vw / 2, (mobile ? 0.4 : 0.38) * vh, bmStageW)

  let bigmac = null
  if (p < 2) {
    const opened = mix(bmClosed, bmOpen, easeInOutCubic(within(p, 0)))
    const held = mix(opened, bmHold, w0)
    held.y -= leave(w1) * vh * 1.15
    if (leave(w1) < 1) bigmac = held
  } else if (p > 3.62) {
    bigmac = { ...bmStage, y: bmStage.y + (1 - arrive(w3)) * vh }
  }

  // ---------- Fries: rise in front of the giant arches ----------
  let fries = null
  if (p > 1.62 && p < 3) {
    const h = mobile ? 0.42 * vh : Math.min(0.66 * vh, 0.62 * vw * RATIO.fries)
    const t = within(p, 2)
    fries = pose(mobile ? vw / 2 : side(0.3), (mobile ? 0.7 : 0.56) * vh, h / RATIO.fries, (rtl ? 1 : -1) * (3 + 4 * easeInOutCubic(t)))
    fries.y += (1 - arrive(w1)) * vh - leave(w2) * vh * 1.15
    if (arrive(w1) <= 0 || leave(w2) >= 1) fries = null
  }

  // ---------- McCafé: the cup floats, Dead Sea style ----------
  let mccafe = null
  let float = 0
  if (p > 2.62 && p < 4) {
    const h = mobile ? 0.36 * vh : 0.56 * vh
    const t = within(p, 3)
    float = Math.sin(t * Math.PI * 2)
    mccafe = pose(mobile ? vw / 2 : side(0.64), (mobile ? 0.66 : 0.56) * vh + float * h * 0.035, h / RATIO.mccafe, Math.sin(t * Math.PI * 2 + 1) * 3)
    mccafe.y += (1 - arrive(w2)) * vh - leave(w3) * vh * 1.15
    if (arrive(w2) <= 0 || leave(w3) >= 1) mccafe = null
  }

  return {
    hero: {
      ...hero,
      open: doorsOpen(p),
      drop: easeInCubic(w0) * 0.55 * vh,
      opacity: 1 - smoothstep(0.7, 1, w0),
      visible: p < 1,
    },
    bigmac,
    fries,
    mccafe,
    float,
    labels: mobile ? 0 : smoothstep(1.02, 1.16, p) * (1 - smoothstep(1.52, 1.64, p)),
    curve: smoothstep(3.06, 3.22, p) * (1 - smoothstep(3.56, 3.68, p)),
    spot: p > 3.62 ? arrive(w3) : 0,
    shadow: {
      // ground shadow strength per product, fading as they leave the floor
      bigmac: p < 1 ? lerp(0.5, 0.22, w0) : p < 2 ? 0.22 : 0.55,
      fries: 0.3,
      mccafe: clamp(0.28 - float * 0.08),
    },
  }
}
