import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { store } from '../lib/store'
import { arrive, handover, leave, within } from '../lib/timeline'
import { clamp, easeInOutCubic, easeOutCubic, invLerp, lerp, rng } from '../lib/math'
import { cartonTexture } from './textures'

/*
 * Scene 3: the fries carton. A superellipse section that widens toward the
 * top, front and back cut down in a curve, fries dropping in on scroll.
 */
const A0 = 0.44
const B0 = 0.19
const A1 = 0.64
const B1 = 0.31
const HS = 1.5
const DIP = 0.36
const N = 4

function sectionPoint(a, b, phi) {
  const c = Math.cos(phi)
  const s = Math.sin(phi)
  return [a * Math.sign(c) * Math.pow(Math.abs(c), 2 / N), b * Math.sign(s) * Math.pow(Math.abs(s), 2 / N)]
}

function cartonGeometry() {
  const U = 120
  const V = 24
  const pos = []
  const uv = []
  const idx = []
  // arc-length u at the top rim so the printed arches are not stretched
  const rim = []
  for (let i = 0; i <= U; i++) rim.push(sectionPoint(A1, B1, -Math.PI / 2 + (i / U) * Math.PI * 2))
  const len = [0]
  for (let i = 1; i <= U; i++) len.push(len[i - 1] + Math.hypot(rim[i][0] - rim[i - 1][0], rim[i][1] - rim[i - 1][1]))
  const total = len[U]
  for (let i = 0; i <= U; i++) {
    const u = len[i] / total
    const phi = -Math.PI / 2 + (i / U) * Math.PI * 2 // u = 0.5 is the front panel
    const [xb, zb] = sectionPoint(A0, B0, phi)
    const [xt, zt] = rim[i]
    const xn = xt / A1
    const top = HS - DIP * Math.pow(Math.max(0, 1 - xn * xn), 1.5)
    for (let j = 0; j <= V; j++) {
      const v = j / V
      pos.push(lerp(xb, xt, v), v * top, lerp(zb, zt, v))
      uv.push(u, (v * top) / HS)
    }
  }
  for (let i = 0; i < U; i++) {
    for (let j = 0; j < V; j++) {
      const a = i * (V + 1) + j
      const b = (i + 1) * (V + 1) + j
      const c = b + 1
      const d = a + 1
      idx.push(a, d, b, b, d, c)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

const COUNT = 96

function useFryLayout() {
  return useMemo(() => {
    const r = rng(77)
    const list = []
    for (let k = 0; k < COUNT; k++) {
      const yb = 0.32 + r() * 0.28
      const t = yb / HS
      const a = lerp(A0, A1, t) * 0.7
      const b = lerp(B0, B1, t) * 0.6
      const rad = Math.sqrt(r())
      const ang = r() * Math.PI * 2
      const x = Math.cos(ang) * a * rad
      const z = Math.sin(ang) * b * rad
      const len = 1.0 + r() * 0.5
      const rz = -(x / A1) * 0.3 + (r() - 0.5) * 0.12
      const rx = (z / B1) * 0.12 + (r() - 0.5) * 0.08
      const rest = new THREE.Euler(rx, r() * Math.PI, rz)
      const up = new THREE.Vector3(0, len / 2, 0).applyEuler(rest)
      list.push({
        len,
        rest,
        pos: new THREE.Vector3(x, yb, z).add(up),
        from: new THREE.Vector3(x * 1.6, yb + 7 + r() * 2, z),
        spin: new THREE.Euler((r() - 0.5) * 1.6, r() * 2, (r() - 0.5) * 1.6),
        delay: r() * 0.62,
        color: ['#f7c548', '#f3b73a', '#fbd66f', '#f0ae33', '#f9cd57'][Math.floor(r() * 5)],
      })
    }
    return list
  }, [])
}

export default function Fries() {
  const root = useRef()
  const tilt = useRef()
  const fries = useRef()
  const layout = useFryLayout()
  const carton = useMemo(() => cartonGeometry(), [])
  const fry = useMemo(() => new RoundedBoxGeometry(0.074, 1, 0.074, 2, 0.018), [])
  const map = cartonTexture()

  useLayoutEffect(() => {
    const c = new THREE.Color()
    layout.forEach((f, i) => fries.current.setColorAt(i, c.set(f.color)))
    fries.current.instanceColor.needsUpdate = true
  }, [layout])

  const tmp = useMemo(
    () => ({ m: new THREE.Matrix4(), q: new THREE.Quaternion(), e: new THREE.Euler(), p: new THREE.Vector3(), s: new THREE.Vector3() }),
    [],
  )
  const lastDrop = useRef(-1)

  useFrame(() => {
    const p = store.p
    const g = root.current
    if (!g) return
    const w1 = handover(p, 1)
    const w2 = handover(p, 2)
    g.visible = p > 1.62 + 0.42 * 0.38 && p < 2.62 + 0.55 * 0.38
    if (!g.visible) return

    const t = within(p, 2)
    g.position.y = -(1 - arrive(w1)) * 5.5 + leave(w2) * 7
    tilt.current.rotation.z = -0.12 * easeInOutCubic(t) - w2 * 0.2
    tilt.current.rotation.y = -0.42 + t * 0.3 + (1 - w1) * 0.6

    // fries fall in through the hand-over and the first part of the hold
    const drop = invLerp(1.88, 2.42, p)
    if (drop === lastDrop.current) return
    lastDrop.current = drop
    const { m, q, e, p: v, s } = tmp
    for (let i = 0; i < layout.length; i++) {
      const f = layout[i]
      const k = easeOutCubic(clamp((drop - f.delay * 0.6) / 0.4))
      v.lerpVectors(f.from, f.pos, k)
      e.set(
        f.rest.x + f.spin.x * (1 - k),
        f.rest.y + f.spin.y * (1 - k),
        f.rest.z + f.spin.z * (1 - k),
      )
      q.setFromEuler(e)
      s.set(1, f.len, 1)
      m.compose(v, q, s)
      fries.current.setMatrixAt(i, m)
    }
    fries.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group ref={root}>
      <group ref={tilt}>
        <mesh geometry={carton} castShadow>
          <meshPhysicalMaterial map={map} roughness={0.42} clearcoat={0.35} clearcoatRoughness={0.35} />
        </mesh>
        <mesh geometry={carton}>
          <meshStandardMaterial color="#9e1a10" roughness={0.7} side={THREE.BackSide} />
        </mesh>
        <instancedMesh ref={fries} args={[fry, undefined, COUNT]} castShadow frustumCulled={false}>
          <meshStandardMaterial roughness={0.5} emissive="#3d1f00" emissiveIntensity={0.35} />
        </instancedMesh>
      </group>
    </group>
  )
}
