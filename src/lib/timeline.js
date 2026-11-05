import { clamp, easeInCubic, easeOutCubic, invLerp, smootherstep } from './math'

/**
 * Scroll is mapped to a single number, p, from 0 to SCENES.length.
 * Each scene owns one unit: it holds for the first HOLD of that unit
 * (while its text is pinned) and hands over to the next scene in the
 * rest (while the next text scrolls in). Everything in 3D and in the
 * colour field is a pure function of p, so fast, reversed or jumped
 * scrolling always lands on the same frame.
 */
export const SCENES = ['arches', 'build', 'fries', 'cafe', 'stage']
export const COUNT = SCENES.length
export const HOLD = 0.62

/** Hand-over weight from scene i to scene i + 1 (0 → 1). */
export const handover = (p, i) => (i >= COUNT - 1 ? 0 : smootherstep(i + HOLD, i + 1, p))

/** Progress through scene i's hold (0 → 1). */
export const within = (p, i) => invLerp(i, i + HOLD, p)

/** Where each scene settles when motion is reduced: its most legible frame. */
export const REST = [0, 1.32, 2.48, 3.5, 4.42]

/** Index of the scene whose text currently owns the screen. */
export const sceneIndex = (p) => clamp(Math.floor(p + 1 / 6), 0, COUNT - 1)

/** Blend per-scene values through the hand-over windows. */
export function blend(p, stops, mix) {
  const i = clamp(Math.floor(p), 0, COUNT - 1)
  const w = handover(p, i)
  const a = stops[i]
  const b = stops[Math.min(i + 1, COUNT - 1)]
  return mix(a, b, w)
}

/**
 * Within a hand-over (w: 0 → 1) the outgoing product leaves in the first
 * half and the incoming one arrives in the second, so they never collide.
 */
export const leave = (w) => easeInCubic(invLerp(0, 0.55, w))
export const arrive = (w) => easeOutCubic(invLerp(0.42, 1, w))
