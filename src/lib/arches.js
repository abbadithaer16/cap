/**
 * The arches, drawn once in a 1200-unit design space (y down) and reused
 * as an SVG mark, a canvas decal and extruded 3D architecture.
 *
 * Feet stand on y = 890. The logo's middle stem stops short at y = 850;
 * the architectural version runs it down to the floor so the M can stand
 * up and split into two doors.
 */
const LOGO = [
  ['M', 270, 890],
  ['C', 272, 520, 345, 312, 455, 312],
  ['C', 540, 312, 588, 410, 600, 512],
  ['C', 612, 410, 660, 312, 745, 312],
  ['C', 855, 312, 928, 520, 930, 890],
  ['L', 848, 890],
  ['C', 848, 560, 805, 352, 745, 352],
  ['C', 685, 352, 643, 560, 643, 850],
  ['L', 557, 850],
  ['C', 557, 560, 515, 352, 455, 352],
  ['C', 395, 352, 352, 560, 352, 890],
  ['Z'],
]

/** Left door: left arch plus the left half of a full-height middle stem. */
export const LEFT_DOOR = [
  ['M', 270, 890],
  ['C', 272, 520, 345, 312, 455, 312],
  ['C', 540, 312, 588, 410, 600, 512],
  ['L', 600, 890],
  ['L', 557, 890],
  ['C', 557, 560, 515, 352, 455, 352],
  ['C', 395, 352, 352, 560, 352, 890],
  ['Z'],
]

export const ARCH_VIEWBOX = '262 304 676 594'

export const archPathD = LOGO.map(([cmd, ...n]) => cmd + n.join(' ')).join('')

export const X0 = 600
export const BASE = 890
export const SPAN = 660 // 270 → 930
export const RISE = 578 // 890 → 312

/** Horizontal extents of each leg at floor level, in world units. */
export function legSpans(width) {
  const s = width / SPAN
  const span = (a, b) => [(a - X0) * s, (b - X0) * s]
  return [span(270, 352), span(557, 643), span(848, 930)]
}

/** Draw the mark into a 2D canvas context, fitted to a box. */
export function drawArches(ctx, cx, cy, width, color) {
  const scale = width / SPAN
  const path = new Path2D(archPathD)
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(scale, scale)
  ctx.translate(-X0, -(312 + RISE / 2))
  ctx.fillStyle = color
  ctx.fill(path)
  ctx.restore()
}
