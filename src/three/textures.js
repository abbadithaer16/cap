import * as THREE from 'three'
import { rng } from '../lib/math'
import { drawArches } from '../lib/arches'

/**
 * Every surface texture is painted at runtime on a 2D canvas: no image
 * downloads, nothing to license, and each one is generated once.
 */

const cache = new Map()
function memo(key, make) {
  if (!cache.has(key)) cache.set(key, make())
  return cache.get(key)
}

function canvas(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')]
}

function finish(c, { srgb = true, repeat = false } = {}) {
  const tex = new THREE.CanvasTexture(c)
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace
  if (repeat) tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = 4
  tex.needsUpdate = true
  return tex
}

function speckle(ctx, w, h, count, colors, rMin, rMax, seed, alpha = 1) {
  const r = rng(seed)
  ctx.globalAlpha = alpha
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = colors[Math.floor(r() * colors.length)]
    const rad = rMin + r() * (rMax - rMin)
    ctx.beginPath()
    ctx.ellipse(r() * w, r() * h, rad * (0.6 + r()), rad, r() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

/**
 * Bun colour along the lathe profile. v runs bottom (0) → top (1) of the
 * canvas; `bands` lists [v, colour] stops, so crown, club and heel can
 * put crust and crumb where each actually has them.
 */
export function bunTexture(kind, bands) {
  return memo(`bun-${kind}`, () => {
    const [c, ctx] = canvas(512, 512)
    const g = ctx.createLinearGradient(0, 512, 0, 0)
    for (const [v, col] of bands) g.addColorStop(v, col)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 512, 512)
    // baked mottling, stronger on the crust
    speckle(ctx, 512, 512, 900, ['#a5561c', '#d28a3e', '#e7a65a'], 2, 9, 7, 0.16)
    speckle(ctx, 512, 512, 500, ['#fff1cf', '#f6d79b'], 1, 4, 11, 0.12)
    return finish(c)
  })
}

export function pattyTexture() {
  return memo('patty', () => {
    const [c, ctx] = canvas(512, 512)
    ctx.fillStyle = '#4a2817'
    ctx.fillRect(0, 0, 512, 512)
    speckle(ctx, 512, 512, 2400, ['#2b150b', '#5c3320', '#6e3f26', '#3a1d10'], 1.5, 6, 3, 0.75)
    speckle(ctx, 512, 512, 300, ['#8a5132'], 1, 3, 5, 0.5)
    return finish(c)
  })
}

export function pattyBump() {
  return memo('patty-bump', () => {
    const [c, ctx] = canvas(256, 256)
    ctx.fillStyle = '#808080'
    ctx.fillRect(0, 0, 256, 256)
    speckle(ctx, 256, 256, 1600, ['#2a2a2a', '#d0d0d0', '#5a5a5a', '#b0b0b0'], 1, 4, 9, 0.7)
    return finish(c, { srgb: false })
  })
}

export function pickleTexture() {
  return memo('pickle', () => {
    const [c, ctx] = canvas(256, 256)
    const g = ctx.createRadialGradient(128, 128, 10, 128, 128, 128)
    g.addColorStop(0, '#b9c46a')
    g.addColorStop(0.62, '#8fa043')
    g.addColorStop(0.8, '#6d7f2a')
    g.addColorStop(1, '#3f5216')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 256, 256)
    const r = rng(21)
    ctx.fillStyle = 'rgba(232, 236, 180, 0.7)'
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2
      ctx.beginPath()
      ctx.ellipse(128 + Math.cos(a) * 52, 128 + Math.sin(a) * 52, 9, 5 + r() * 3, a, 0, Math.PI * 2)
      ctx.fill()
    }
    return finish(c)
  })
}

/**
 * Fries carton print. u = 0.5 is the front panel, where the arches sit.
 */
export function cartonTexture() {
  return memo('carton', () => {
    const [c, ctx] = canvas(1024, 512)
    ctx.fillStyle = '#d8261b'
    ctx.fillRect(0, 0, 1024, 512)
    speckle(ctx, 1024, 512, 1400, ['#c21e14', '#e2382b'], 1, 3, 13, 0.35)
    // the canvas spans the whole rim (~3.4 units) by its full height (1.5)
    ctx.save()
    ctx.scale(1, 512 / 1024 / (1.5 / 3.4))
    drawArches(ctx, 512, 300, 210, '#ffc72c')
    ctx.restore()
    return finish(c)
  })
}

/** McCafé cup print: brown sleeve, a sweep of golden arch at the base, the wordmark. */
export function cupTexture(word = 'McCafé') {
  return memo(`cup-${word}`, () => {
    const [c, ctx] = canvas(1024, 512)
    ctx.fillStyle = '#5a2c14'
    ctx.fillRect(0, 0, 1024, 512)
    speckle(ctx, 1024, 512, 900, ['#4d240f', '#663519'], 1, 3, 17, 0.4)
    drawArches(ctx, 256, 520, 520, '#ffbc0d')
    ctx.save()
    ctx.translate(256, 250)
    ctx.transform(1, 0, -0.18, 1, 0, 0)
    ctx.fillStyle = '#fff6e6'
    ctx.font = '700 104px "Archivo Variable", Archivo, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(word, 0, 0)
    ctx.restore()
    ctx.fillStyle = '#f5ead8'
    ctx.fillRect(0, 0, 1024, 18)
    return finish(c)
  })
}

/** Striped pool ring. */
export function ringTexture(color) {
  return memo(`ring-${color}`, () => {
    const [c, ctx] = canvas(256, 16)
    const stripes = 8
    for (let i = 0; i < stripes; i++) {
      ctx.fillStyle = i % 2 ? '#fff8ec' : color
      ctx.fillRect((i / stripes) * 256, 0, 256 / stripes + 1, 16)
    }
    return finish(c)
  })
}

/** Radial alpha mask used to fade a stage floor into the colour field. */
export function radialAlpha() {
  return memo('radial', () => {
    const [c, ctx] = canvas(256, 256)
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
    g.addColorStop(0, '#ffffff')
    g.addColorStop(0.45, '#bdbdbd')
    g.addColorStop(1, '#000000')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 256, 256)
    return finish(c, { srgb: false })
  })
}
