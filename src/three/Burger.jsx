import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { store } from '../lib/store'
import { handover, within } from '../lib/timeline'
import { easeInOutCubic, rng, smoothstep } from '../lib/math'
import { arrive, leave } from '../lib/timeline'
import { bunTexture, pattyBump, pattyTexture, pickleTexture } from './textures'
import { PEDESTAL_TOP } from './burgerSpec'

/*
 * A Big Mac built from lathes and instanced bits. Layers stack bottom → top
 * in the real assembly order; `explode` pulls them apart along y.
 */
const R = 0.74
const GAP = 0.2

const LAYERS = [
  { key: 'heel', h: 0.17 },
  { key: 'sauceA', h: 0.02 },
  { key: 'lettuceA', h: 0.05 },
  { key: 'cheese', h: 0.012 },
  { key: 'pattyA', h: 0.1 },
  { key: 'club', h: 0.14 },
  { key: 'sauceB', h: 0.02 },
  { key: 'lettuceB', h: 0.05 },
  { key: 'pickles', h: 0.02 },
  { key: 'pattyB', h: 0.1 },
  { key: 'crown', h: 0.44 },
]
let acc = 0 // running stack height
for (const l of LAYERS) {
  l.base = acc
  acc += l.h
}
const INDEX = Object.fromEntries(LAYERS.map((l, i) => [l.key, i]))


/** How far apart the layers are at scroll position p (0 = stacked, 1 = exploded). */
const explodeAt = (p) => smoothstep(0.9, 1.26, p) * (1 - smoothstep(1.44, 1.62, p))

function lathe(points, segments = 64) {
  return new THREE.LatheGeometry(
    points.map(([x, y]) => new THREE.Vector2(x, y)),
    segments,
  )
}

/* Bun profiles run bottom centre → rim → top centre so lathe normals face out. */
function crownProfile() {
  const pts = [
    [0.001, 0],
    [0.5, 0],
    [0.66, 0.004],
    [0.715, 0.02],
    [0.738, 0.05],
  ]
  const n = 18
  for (let k = 0; k <= n; k++) {
    const phi = (k / n) * (Math.PI / 2)
    const x = R * Math.pow(Math.cos(phi), 0.75)
    const y = 0.08 + 0.36 * Math.pow(Math.sin(phi), 1.25)
    pts.push([Math.max(x, 0.001), y])
  }
  return pts
}

const crownAt = (phi) => [
  R * Math.pow(Math.cos(phi), 0.75),
  0.08 + 0.36 * Math.pow(Math.sin(phi), 1.25),
]

function noiseDisplace(geo, radial, vertical, seed) {
  const pos = geo.attributes.position
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const r = Math.hypot(v.x, v.z)
    if (r < 1e-4) continue
    const a = Math.atan2(v.z, v.x)
    const k =
      1 +
      radial * (Math.sin(a * 5 + seed) * 0.6 + Math.sin(a * 11 + seed * 2.3) * 0.4) +
      radial * 0.5 * Math.sin(a * 23 + seed * 5.1)
    const h = Math.sin(v.x * 37 + seed) * Math.cos(v.z * 41 - seed) * vertical
    pos.setXYZ(i, v.x * k, v.y + (v.y > 0.02 ? h : 0), v.z * k)
  }
  geo.computeVertexNormals()
  return geo
}

function useInstances(ref, count, fill) {
  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    const p = new THREE.Vector3()
    const s = new THREE.Vector3()
    const c = new THREE.Color()
    for (let i = 0; i < count; i++) {
      const d = fill(i)
      p.set(...d.p)
      if (d.q) q.copy(d.q)
      else q.setFromEuler(e.set(...d.r))
      s.set(...d.s)
      m.compose(p, q, s)
      mesh.setMatrixAt(i, m)
      if (d.c) mesh.setColorAt(i, c.set(d.c))
    }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [ref, count, fill])
}

function Lettuce({ seed }) {
  const ref = useRef()
  const count = 170
  const fill = useMemo(() => {
    const r = rng(seed)
    const greens = ['#b9d86a', '#9fc650', '#d8ea9c', '#88b43c', '#c6e07d']
    return () => {
      const rad = Math.sqrt(r()) * 0.7
      const a = r() * Math.PI * 2
      return {
        p: [Math.cos(a) * rad, 0.014 + r() * 0.034, Math.sin(a) * rad],
        r: [(r() - 0.5) * 0.6, r() * Math.PI, (r() - 0.5) * 0.6],
        s: [0.09 + r() * 0.07, 0.005, 0.04 + r() * 0.03],
        c: greens[Math.floor(r() * greens.length)],
      }
    }
  }, [seed])
  useInstances(ref, count, fill)
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} castShadow>
      <boxGeometry />
      <meshStandardMaterial roughness={0.5} side={THREE.DoubleSide} />
    </instancedMesh>
  )
}

function Onions({ seed }) {
  const ref = useRef()
  const count = 60
  const fill = useMemo(() => {
    const r = rng(seed)
    return () => {
      const rad = Math.sqrt(r()) * 0.64
      const a = r() * Math.PI * 2
      const k = 0.026 + r() * 0.016
      return {
        p: [Math.cos(a) * rad, 0.022 + r() * 0.012, Math.sin(a) * rad],
        r: [r() * 3, r() * 3, r() * 3],
        s: [k, k * 0.7, k],
        c: r() > 0.5 ? '#f6f1e2' : '#ece4cf',
      }
    }
  }, [seed])
  useInstances(ref, count, fill)
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <boxGeometry />
      <meshPhysicalMaterial roughness={0.28} clearcoat={0.4} />
    </instancedMesh>
  )
}

function Seeds() {
  const ref = useRef()
  const count = 120
  const fill = useMemo(() => {
    const r = rng(42)
    const up = new THREE.Vector3(0, 1, 0)
    const twist = new THREE.Quaternion()
    const n = new THREE.Vector3()
    return () => {
      // sample the dome by footprint so seeds spread evenly when seen from above
      const rho = Math.sqrt(r()) * 0.66
      const a = r() * Math.PI * 2
      const phi = Math.acos(Math.min(1, Math.pow(rho / R, 1 / 0.75)))
      const [x0, y0] = crownAt(phi)
      const [x1, y1] = crownAt(phi + 0.01)
      // outward normal in the (radius, y) plane
      const nr = y1 - y0
      const ny = -(x1 - x0)
      n.set(Math.cos(a) * nr, ny, Math.sin(a) * nr).normalize()
      const q = new THREE.Quaternion().setFromUnitVectors(up, n)
      q.multiply(twist.setFromAxisAngle(up, r() * Math.PI))
      return {
        p: [Math.cos(a) * x0 + n.x * 0.004, y0 + n.y * 0.004, Math.sin(a) * x0 + n.z * 0.004],
        q,
        s: [0.026, 0.009, 0.014],
        c: r() > 0.3 ? '#f7e9c6' : '#ecd5a4',
      }
    }
  }, [])
  useInstances(ref, count, fill)
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 10, 6]} />
      <meshStandardMaterial roughness={0.45} />
    </instancedMesh>
  )
}

function Cheese() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1.2, 1.2, 36, 36)
    g.rotateX(-Math.PI / 2)
    const pos = g.attributes.position
    const n = 5 // round the square's corners into a soft superellipse
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i)
      let z = pos.getZ(i)
      const d0 = Math.hypot(x, z)
      if (d0 > 1e-5) {
        const a = Math.atan2(z, x)
        const square = 0.6 / Math.max(Math.abs(Math.cos(a)), Math.abs(Math.sin(a)))
        const round = 0.6 / Math.pow(Math.pow(Math.abs(Math.cos(a)), n) + Math.pow(Math.abs(Math.sin(a)), n), 1 / n)
        const k = round / square
        x *= k
        z *= k
      }
      const d = Math.hypot(x, z)
      const over = Math.max(0, d - 0.6)
      const droop = over * over * 3.2 + over * 0.35
      pos.setXYZ(i, x, -droop + Math.sin(x * 9) * Math.cos(z * 7) * 0.003, z)
    }
    g.computeVertexNormals()
    return g
  }, [])
  return (
    <mesh geometry={geo} rotation-y={0.5} position-y={0.006} castShadow receiveShadow>
      <meshPhysicalMaterial
        color="#ffb11f"
        roughness={0.34}
        clearcoat={0.25}
        sheen={0.4}
        sheenColor="#ffe08a"
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function Sauce() {
  const geo = useMemo(
    () =>
      noiseDisplace(
        lathe(
          [
            [0.001, 0],
            [0.69, 0],
            [0.72, 0.01],
            [0.69, 0.02],
            [0.001, 0.02],
          ],
          72,
        ),
        0.035,
        0,
        1.7,
      ),
    [],
  )
  return (
    <mesh geometry={geo}>
      <meshPhysicalMaterial color="#f29a52" roughness={0.2} clearcoat={0.6} clearcoatRoughness={0.15} />
    </mesh>
  )
}

function Patty({ seed }) {
  const geo = useMemo(
    () =>
      noiseDisplace(
        lathe(
          [
            [0.001, 0],
            [0.6, 0],
            [0.67, 0.012],
            [0.705, 0.05],
            [0.67, 0.088],
            [0.6, 0.1],
            [0.001, 0.1],
          ],
          72,
        ),
        0.022,
        0.006,
        seed,
      ),
    [seed],
  )
  const map = pattyTexture()
  const bump = pattyBump()
  return (
    <mesh geometry={geo} castShadow receiveShadow>
      <meshStandardMaterial map={map} bumpMap={bump} bumpScale={2.2} roughness={0.78} />
    </mesh>
  )
}

function Pickles() {
  const map = pickleTexture()
  const spots = [
    [0.22, 0.18],
    [-0.28, 0.1],
    [0.02, -0.3],
  ]
  return spots.map(([x, z], i) => (
    <mesh key={i} position={[x, 0.01, z]} rotation={[0.05 * i, i, -0.04]} castShadow>
      <cylinderGeometry args={[0.165, 0.165, 0.018, 32]} />
      <meshPhysicalMaterial map={map} roughness={0.3} clearcoat={0.6} />
    </mesh>
  ))
}

function Bun({ kind }) {
  const { geo, map } = useMemo(() => {
    if (kind === 'crown') {
      return {
        geo: lathe(crownProfile(), 80),
        map: bunTexture('crown', [
          [0, '#efd29a'],
          [0.17, '#efcf93'],
          [0.22, '#e6ad5e'],
          [0.36, '#cf8436'],
          [0.75, '#b8681f'],
          [1, '#a85a17'],
        ]),
      }
    }
    if (kind === 'club') {
      return {
        geo: lathe(
          [
            [0.001, 0],
            [0.62, 0],
            [0.7, 0.008],
            [0.735, 0.04],
            [0.742, 0.07],
            [0.735, 0.1],
            [0.7, 0.132],
            [0.62, 0.14],
            [0.001, 0.14],
          ],
          80,
        ),
        map: bunTexture('club', [
          [0, '#f1d7a3'],
          [0.2, '#ecc98b'],
          [0.3, '#cf8a3d'],
          [0.5, '#c27a2f'],
          [0.7, '#d39246'],
          [0.8, '#ecc98b'],
          [1, '#f1d7a3'],
        ]),
      }
    }
    return {
      geo: lathe(
        [
          [0.001, 0],
          [0.55, 0],
          [0.68, 0.01],
          [0.725, 0.04],
          [0.74, 0.09],
          [0.73, 0.14],
          [0.7, 0.165],
          [0.6, 0.17],
          [0.001, 0.17],
        ],
        80,
      ),
      map: bunTexture('heel', [
        [0, '#c4802f'],
        [0.5, '#d18e40'],
        [0.68, '#e1a85e'],
        [0.78, '#efd29c'],
        [1, '#f2d9a6'],
      ]),
    }
  }, [kind])

  return (
    <group>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshPhysicalMaterial map={map} roughness={0.52} sheen={0.6} sheenRoughness={0.6} sheenColor="#ffd9a0" />
      </mesh>
      {kind === 'crown' && <Seeds />}
    </group>
  )
}

function Layer({ layer }) {
  switch (layer.key) {
    case 'heel':
      return <Bun kind="heel" />
    case 'club':
      return <Bun kind="club" />
    case 'crown':
      return <Bun kind="crown" />
    case 'sauceA':
      return (
        <>
          <Sauce />
          <Onions seed={5} />
        </>
      )
    case 'sauceB':
      return (
        <>
          <Sauce />
          <Onions seed={9} />
        </>
      )
    case 'lettuceA':
      return <Lettuce seed={3} />
    case 'lettuceB':
      return <Lettuce seed={8} />
    case 'cheese':
      return <Cheese />
    case 'pattyA':
      return <Patty seed={2} />
    case 'pattyB':
      return <Patty seed={6} />
    case 'pickles':
      return <Pickles />
    default:
      return null
  }
}

const v = new THREE.Vector3()

export default function Burger() {
  const root = useRef()
  const spin = useRef()
  const layerRefs = useRef([])

  useFrame((state) => {
    const p = store.p
    const g = root.current
    if (!g) return
    const time = store.reduced ? 0 : state.clock.elapsedTime
    const w0 = handover(p, 0)
    const w1 = handover(p, 1)
    const w3 = handover(p, 3)

    let y = 0
    let rot = 0
    let explode = 0
    let visible = true

    if (p < 2) {
      // arches → exploded view → lifts away
      y = easeInOutCubic(w0) * 0.55 + leave(w1) * 7
      explode = explodeAt(p)
      rot = 0.55 + w0 * 0.8 + within(p, 1) * 1.5 + w1 * 1.2
      visible = w1 < 0.6
    } else if (p > 3 + 0.62) {
      // lands on the pedestal under the spotlight
      y = PEDESTAL_TOP - (1 - arrive(w3)) * 5
      rot = time * 0.22 + within(p, 4) * 0.9 - (1 - arrive(w3)) * 1.4
    } else {
      visible = false
    }

    g.visible = visible
    if (!visible) {
      for (const label of store.labels) if (label.el) label.el.style.opacity = '0'
      return
    }
    // stack expands around its own middle
    g.position.y = y - explode * GAP * (LAYERS.length - 1) * 0.5
    spin.current.rotation.y = rot
    for (let i = 0; i < LAYERS.length; i++) {
      const ref = layerRefs.current[i]
      if (ref) ref.position.y = LAYERS[i].base + i * GAP * explode
    }

    // project label anchors into screen space
    const labels = store.labels
    if (!labels.length) return
    const alpha = smoothstep(0.75, 0.98, explode)
    const { width, height } = state.size
    for (const label of labels) {
      if (!label.el) continue
      if (alpha <= 0.001) {
        label.el.style.opacity = '0'
        continue
      }
      const spec = label.spec
      const i = INDEX[spec.layer]
      v.set(spec.side * (R + 0.08), LAYERS[i].base + i * GAP * explode + spec.dy, 0)
      g.localToWorld(v)
      v.project(state.camera)
      const x = (v.x * 0.5 + 0.5) * width
      const yy = (-v.y * 0.5 + 0.5) * height
      label.el.style.opacity = String(alpha)
      label.el.style.transform = `translate3d(${x.toFixed(1)}px, ${yy.toFixed(1)}px, 0)`
    }
  })

  return (
    <group ref={root}>
      <group ref={spin}>
        {LAYERS.map((layer, i) => (
          <group key={layer.key} ref={(el) => (layerRefs.current[i] = el)} position-y={layer.base}>
            <Layer layer={layer} />
          </group>
        ))}
      </group>
    </group>
  )
}
