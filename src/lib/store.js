import gsap from 'gsap'
import { damp } from './math'
import { REST, sceneIndex } from './timeline'

/**
 * Mutable per-frame state shared by the DOM layers and the WebGL scene.
 * Nothing here goes through React state: scroll and frame values change
 * sixty times a second.
 */
export const store = {
  target: 0, // raw scroll position in scene units
  p: 0, // damped value everything renders from
  reduced: false,
  mobile: false,
  rtl: false,
  webgl: true,
  pointer: { x: 0, y: 0 },
  labels: [], // burger labels, filled by the overlay
  curve: null, // curved McCafé line, filled by the overlay
}

const listeners = new Set()
export const subscribe = (fn) => {
  listeners.add(fn)
  fn(store.p)
  return () => listeners.delete(fn)
}

let last = -1
function tick(_time, deltaMs) {
  const dt = Math.min(deltaMs / 1000, 0.1)
  if (store.reduced) {
    // Cuts, not flights: snap to the rest frame of whichever scene owns the screen.
    store.p = REST[sceneIndex(store.target)]
  } else {
    store.p = damp(store.p, store.target, 7, dt)
    if (Math.abs(store.p - store.target) < 1e-4) store.p = store.target
  }
  if (store.p !== last) {
    last = store.p
    listeners.forEach((fn) => fn(store.p))
  }
}

let running = false
export function startTicker() {
  if (running) return () => {}
  running = true
  gsap.ticker.add(tick)
  return () => {
    gsap.ticker.remove(tick)
    running = false
  }
}
