export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const lerp = (a, b, t) => a + (b - a) * t
export const invLerp = (a, b, v) => clamp((v - a) / (b - a))

export const smoothstep = (a, b, v) => {
  const t = invLerp(a, b, v)
  return t * t * (3 - 2 * t)
}

export const smootherstep = (a, b, v) => {
  const t = invLerp(a, b, v)
  return t * t * t * (t * (t * 6 - 15) + 10)
}

export const easeOutCubic = (t) => 1 - Math.pow(1 - clamp(t), 3)
export const easeInCubic = (t) => Math.pow(clamp(t), 3)
export const easeInOutCubic = (t) => {
  const x = clamp(t)
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}
export const easeOutBack = (t) => {
  const x = clamp(t)
  const c1 = 1.4
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

/** Frame-rate independent exponential approach. */
export const damp = (current, target, lambda, dt) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt))

/** Small deterministic PRNG so every load lays out fries, seeds and beans the same way. */
export function rng(seed = 1) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
