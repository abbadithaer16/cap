import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { store } from '../lib/store'
import { arrive, handover, leave } from '../lib/timeline'
import { clamp, easeOutBack, easeOutCubic, invLerp, rng, smoothstep } from '../lib/math'
import { cupTexture, ringTexture } from './textures'

/*
 * Scene 4, seen from straight above: a McCafé cup on its side, the spill
 * spreading into a little Dead Sea with pool rings floating on it.
 */
const DIR = new THREE.Vector3(-0.38, 0, -1).normalize() // cup mouth points up-left on screen
const BASE = new THREE.Vector3(0.95, 0, 2.05)
const CUP_LEN = 1.48
const MOUTH = BASE.clone().addScaledVector(DIR, CUP_LEN)
const PUDDLE_R = 1.7
const PUDDLE_C = MOUTH.clone().addScaledVector(DIR, PUDDLE_R * 0.86)

function cupGeometry() {
  const pts = [
    [0.001, 0],
    [0.38, 0],
    [0.405, 0.012],
    [0.41, 0.03],
    [0.565, CUP_LEN],
  ].map(([x, y]) => new THREE.Vector2(x, y))
  const g = new THREE.LatheGeometry(pts, 64)
  // lathe v follows profile points; remap it to height so the print covers the wall
  const pos = g.attributes.position
  const uv = g.attributes.uv
  for (let i = 0; i < uv.count; i++) uv.setY(i, Math.min(1, pos.getY(i) / CUP_LEN))
  return g
}

function puddleGeometry() {
  const shape = new THREE.Shape()
  const n = 160
  const cx = PUDDLE_C.x - MOUTH.x
  const cz = PUDDLE_C.z - MOUTH.z
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2
    // soft scallops, like coffee that ran until it stopped
    const r =
      PUDDLE_R *
      (1 + 0.055 * Math.cos(a * 9) + 0.045 * Math.sin(a * 4 + 0.7) + 0.03 * Math.cos(a * 15 + 2))
    const x = cx + Math.cos(a) * r
    const y = -(cz + Math.sin(a) * r) // shape y maps to world -z after rotation
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }
  // neck that joins the spill to the cup mouth
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: 0.01,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.05,
    bevelSegments: 5,
    curveSegments: 4,
  })
  g.rotateX(-Math.PI / 2)
  g.computeVertexNormals()
  return g
}

function beanGeometry() {
  const g = new THREE.SphereGeometry(1, 28, 18)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i)
    let y = pos.getY(i)
    const z = pos.getZ(i)
    if (y > 0) {
      const crease = Math.exp(-Math.pow((x - 0.14 * Math.sin(z * 2.4)) / 0.11, 2))
      y = y * 0.82 * (1 - 0.95 * crease)
    }
    pos.setXYZ(i, x * 0.66, y * 0.5, z)
  }
  g.scale(0.16, 0.16, 0.22)
  g.computeVertexNormals()
  return g
}

const RINGS = [
  { color: '#ffc72c', at: [-0.62, -0.5], phase: 0 },
  { color: '#ff6fa3', at: [0.62, -0.08], phase: 1.7 },
  { color: '#2ec4e6', at: [-0.12, 0.6], phase: 3.1 },
]

const BEANS = [
  [-3.7, -2.25],
  [3.55, -2.35],
  [-4.15, 0.55],
  [3.95, 0.85],
  [-2.85, 2.4],
  [3.2, 2.45],
  [1.9, -2.55],
  [-1.6, -2.65],
  [-3.4, 1.65],
  [4.35, -0.9],
  [2.55, 1.7],
]

export default function Coffee() {
  const root = useRef()
  const spill = useRef()
  const ringRefs = useRef([])
  const rippleRefs = useRef([])
  const { cup, puddle, bean, cupQuat, beans } = useMemo(() => {
    const tilt = Math.atan((0.565 - 0.41) / CUP_LEN)
    const axis = DIR.clone().multiplyScalar(Math.cos(tilt)).setY(Math.sin(tilt)).normalize()
    const r = rng(5)
    return {
      cup: cupGeometry(),
      puddle: puddleGeometry(),
      bean: beanGeometry(),
      cupQuat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis),
      beans: BEANS.map(([x, z]) => ({
        p: [x, 0.05, z],
        r: [r() > 0.75 ? Math.PI : 0, r() * Math.PI * 2, (r() - 0.5) * 0.3],
      })),
    }
  }, [])
  const cupMap = useMemo(() => {
    // turn the print so the wordmark faces the overhead camera
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(cupQuat.clone().invert())
    const u = Math.atan2(up.x, up.z) / (Math.PI * 2)
    const t = cupTexture().clone()
    t.wrapS = THREE.RepeatWrapping
    t.offset.x = 0.25 - u
    t.needsUpdate = true
    return t
  }, [cupQuat])

  useFrame((state) => {
    const p = store.p
    const g = root.current
    if (!g) return
    const w2 = handover(p, 2)
    const w3 = handover(p, 3)
    g.visible = p > 2.62 + 0.42 * 0.38 && p < 3.62 + 0.55 * 0.38
    const curve = store.curve
    if (!g.visible) {
      if (curve) curve.style.opacity = '0'
      return
    }
    const time = store.reduced ? 0 : state.clock.elapsedTime

    // slides in from the bottom of the frame, leaves through the top
    g.position.z = (1 - arrive(w2)) * 7 - leave(w3) * 9

    const grow = easeOutCubic(invLerp(2.86, 3.42, p))
    spill.current.scale.setScalar(0.06 + 0.94 * grow)

    for (let i = 0; i < RINGS.length; i++) {
      const ring = ringRefs.current[i]
      const ripple = rippleRefs.current[i]
      const spec = RINGS[i]
      const pop = easeOutBack(clamp((p - 3.18 - i * 0.07) / 0.14))
      const drift = (p - 3) * 0.35
      const x = spec.at[0] + Math.sin(drift + spec.phase) * 0.12
      const z = spec.at[1] + Math.cos(drift * 0.8 + spec.phase) * 0.1
      ring.position.set(PUDDLE_C.x + x, 0.075 + Math.sin(time * 1.4 + spec.phase) * 0.01, PUDDLE_C.z + z)
      ring.rotation.set(
        -Math.PI / 2 + Math.sin(time * 1.1 + spec.phase) * 0.06,
        Math.cos(time * 0.9 + spec.phase) * 0.05,
        time * 0.15 + spec.phase + drift,
      )
      ring.scale.setScalar(Math.max(0.0001, pop))
      if (ripple) {
        const phase = (time * 0.45 + spec.phase * 0.2) % 1
        ripple.position.set(ring.position.x, 0.068, ring.position.z)
        ripple.scale.setScalar(1 + phase * 1.4)
        ripple.material.opacity = store.reduced ? 0 : (1 - phase) * 0.32 * clamp(pop)
      }
    }

    // curved line hugs the spill: project its centre and radius to screen
    if (curve) {
      const alpha = smoothstep(3.14, 3.34, p) * (1 - smoothstep(3.6, 3.72, p))
      curve.style.opacity = alpha.toFixed(3)
      if (alpha > 0.001) {
        const { width, height } = state.size
        const c = PUDDLE_C.clone().add(g.position)
        const e = c.clone().add(new THREE.Vector3(PUDDLE_R, 0, 0))
        c.project(state.camera)
        e.project(state.camera)
        const cx = (c.x * 0.5 + 0.5) * width
        const cy = (-c.y * 0.5 + 0.5) * height
        const rpx = Math.abs(e.x - c.x) * 0.5 * width
        curve.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0) scale(${(rpx / 100).toFixed(4)})`
      }
    }
  })

  return (
    <group ref={root}>
      {/* cup on its side */}
      <group position={[BASE.x, 0.41, BASE.z]} quaternion={cupQuat}>
        <mesh geometry={cup} castShadow>
          <meshPhysicalMaterial map={cupMap} roughness={0.5} clearcoat={0.25} />
        </mesh>
        <mesh geometry={cup} scale={[0.97, 0.995, 0.97]}>
          <meshStandardMaterial color="#efe6d8" roughness={0.8} side={THREE.BackSide} />
        </mesh>
        <mesh position-y={CUP_LEN} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.565, 0.022, 12, 64]} />
          <meshStandardMaterial color="#f5ecdc" roughness={0.6} />
        </mesh>
        <mesh position-y={CUP_LEN - 0.03} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.55, 48]} />
          <meshPhysicalMaterial color="#2a1206" roughness={0.08} clearcoat={1} />
        </mesh>
      </group>

      {/* the spill grows out of the cup mouth */}
      <group ref={spill} position={[MOUTH.x, 0.03, MOUTH.z]}>
        <mesh geometry={puddle} receiveShadow>
          <meshPhysicalMaterial
            color="#2b1307"
            roughness={0.06}
            clearcoat={1}
            clearcoatRoughness={0.04}
            envMapIntensity={1.3}
          />
        </mesh>
      </group>

      {RINGS.map((ring, i) => (
        <group key={ring.color}>
          <mesh ref={(el) => (ringRefs.current[i] = el)} castShadow>
            <torusGeometry args={[0.17, 0.068, 20, 48]} />
            <meshPhysicalMaterial map={ringTexture(ring.color)} roughness={0.25} clearcoat={0.9} />
          </mesh>
          <mesh ref={(el) => (rippleRefs.current[i] = el)} rotation-x={-Math.PI / 2}>
            <ringGeometry args={[0.25, 0.262, 64]} />
            <meshBasicMaterial color="#f3d9b8" transparent opacity={0} depthWrite={false} />
          </mesh>
        </group>
      ))}

      {beans.map((b, i) => (
        <mesh key={i} geometry={bean} position={b.p} rotation={b.r} castShadow>
          <meshPhysicalMaterial color="#3d1c0c" roughness={0.32} clearcoat={0.7} clearcoatRoughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}
