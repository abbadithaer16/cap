import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { store } from '../lib/store'
import { COUNT, blend, handover, within } from '../lib/timeline'
import { clamp, damp, easeInOutCubic, lerp } from '../lib/math'
import Arches from './Arches'
import Burger from './Burger'
import Fries from './Fries'
import Coffee from './Coffee'
import Stage from './Stage'

/*
 * Camera poses. `shift` slides the rendered image (fraction of the viewport,
 * +x right, +y up) so the product sits beside the text without rotating the
 * camera off its subject. Each scene moves between an `in` and `out` pose
 * during its hold; hand-overs blend one scene's `out` into the next's `in`.
 */
const P = (pos, tgt, fov, shift, mshift, mk = 1) => ({ pos, tgt, fov, shift, mshift, mk })
const POSES = [
  {
    in: P([0, 2.1, 18.5], [0, 1.45, 0], 30, [0, -0.2], [0, -0.17], 0.62),
    out: P([0, 1.05, 6.2], [0, 0.62, 0], 32, [0, -0.17], [0, -0.16]),
  },
  {
    in: P([0, 1.35, 7.8], [0, 1.25, 0], 32, [0.2, 0], [0, -0.14]),
    out: P([0.35, 1.45, 7.4], [0, 1.25, 0], 32, [0.2, 0], [0, -0.14]),
  },
  {
    in: P([0, 1.15, 6.9], [0, 1.0, 0], 32, [-0.17, -0.02], [0, -0.16]),
    out: P([0, 1.25, 6.4], [0, 1.0, 0], 32, [-0.17, -0.02], [0, -0.16]),
  },
  {
    in: P([0, 12.2, 2.4], [0.1, 0, 0.3], 32, [0.15, -0.06], [0, -0.12]),
    out: P([0, 11.6, 2.3], [0.1, 0, 0.3], 32, [0.15, -0.06], [0, -0.12]),
  },
  {
    in: P([0, 1.85, 8.8], [0, 0.95, 0], 30, [0, 0.22], [0, 0.1]),
    out: P([0, 1.7, 8.0], [0, 0.95, 0], 30, [0, 0.22], [0, 0.1]),
  },
]

const mixPose = (a, b, t, out) => {
  for (let k = 0; k < 3; k++) {
    out.pos[k] = lerp(a.pos[k], b.pos[k], t)
    out.tgt[k] = lerp(a.tgt[k], b.tgt[k], t)
  }
  out.fov = lerp(a.fov, b.fov, t)
  out.shift[0] = lerp(a.shift[0], b.shift[0], t)
  out.shift[1] = lerp(a.shift[1], b.shift[1], t)
  out.mshift[0] = lerp(a.mshift[0], b.mshift[0], t)
  out.mshift[1] = lerp(a.mshift[1], b.mshift[1], t)
  out.mk = lerp(a.mk, b.mk, t)
  return out
}
const blank = () => ({ pos: [0, 0, 0], tgt: [0, 0, 0], fov: 32, shift: [0, 0], mshift: [0, 0], mk: 1 })

function poseAt(p, out, a = blank(), b = blank()) {
  const i = clamp(Math.floor(p), 0, COUNT - 1)
  const t = easeInOutCubic(within(p, i))
  mixPose(POSES[i].in, POSES[i].out, t, a)
  const w = handover(p, i)
  if (w <= 0) return mixPose(a, a, 0, out)
  mixPose(POSES[i + 1].in, POSES[i + 1].in, 0, b)
  return mixPose(a, b, w, out)
}

function CameraRig() {
  const { camera, size } = useThree()
  const cache = useMemo(() => ({ out: blank(), a: blank(), b: blank(), look: new THREE.Vector3(), px: 0, py: 0 }), [])

  useFrame((_, delta) => {
    const pose = poseAt(store.p, cache.out, cache.a, cache.b)
    const aspect = size.width / size.height
    const portrait = aspect < 0.9

    // narrow screens: widen the lens and step back so the product still fits
    const fov = portrait ? pose.fov + 12 : pose.fov
    const k = portrait ? clamp(0.95 / aspect, 1, 1.85) * 0.78 * pose.mk : clamp(1.45 / aspect, 1, 1.25)

    // a little pointer parallax on desktop
    const reduce = store.reduced || store.mobile
    cache.px = reduce ? 0 : damp(cache.px, store.pointer.x, 3, delta)
    cache.py = reduce ? 0 : damp(cache.py, store.pointer.y, 3, delta)

    const [tx, ty, tz] = pose.tgt
    camera.position.set(
      tx + (pose.pos[0] - tx) * k + cache.px * 0.18,
      ty + (pose.pos[1] - ty) * k + cache.py * 0.1,
      tz + (pose.pos[2] - tz) * k,
    )
    camera.lookAt(cache.look.set(tx, ty, tz))
    camera.fov = fov

    const sx = (portrait ? pose.mshift[0] : pose.shift[0]) * (store.rtl ? -1 : 1)
    const sy = portrait ? pose.mshift[1] : pose.shift[1]
    camera.setViewOffset(size.width, size.height, -sx * size.width, sy * size.height, size.width, size.height)
    camera.updateProjectionMatrix()
  })
  return null
}

/* Light levels per scene: arches, build, fries, café, stage. */
const LEVELS = {
  hemi: [1.1, 0.75, 1.25, 1.2, 0.12],
  key: [2.8, 2.2, 2.6, 2.9, 0.25],
  rim: [1.2, 2.4, 1.0, 0.4, 0.8],
  env: [0.9, 0.75, 1.0, 1.0, 0.32],
  shadow: [0.34, 0, 0, 0.3, 0],
}
const SHADOW_TINT = ['#3a0400', '#2a0200', '#5a2b00', '#5c2a00', '#000000']

function Lights() {
  const hemi = useRef()
  const key = useRef()
  const rim = useRef()
  const floor = useRef()
  const scene = useThree((s) => s.scene)
  const a = useMemo(() => new THREE.Color(), [])
  const b = useMemo(() => new THREE.Color(), [])

  useFrame(() => {
    const p = store.p
    const num = (stops) => blend(p, stops, lerp)
    hemi.current.intensity = num(LEVELS.hemi)
    key.current.intensity = num(LEVELS.key)
    rim.current.intensity = num(LEVELS.rim)
    scene.environmentIntensity = num(LEVELS.env)
    floor.current.material.opacity = num(LEVELS.shadow)
    blend(p, SHADOW_TINT, (x, y, t) => floor.current.material.color.copy(a.set(x)).lerp(b.set(y), t))
  })

  return (
    <>
      <hemisphereLight ref={hemi} args={['#fff1dc', '#5a1408', 1]} />
      <directionalLight
        ref={key}
        position={[-5, 10, 7]}
        color="#fff4e2"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-bias={-0.0003}
        shadow-normalBias={0.025}
      />
      <directionalLight ref={rim} position={[4, 3, -6]} color="#ff9a62" />
      <mesh ref={floor} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <shadowMaterial transparent opacity={0.3} color="#3a0400" depthWrite={false} />
      </mesh>
    </>
  )
}

/** Compile every material up front so no scene hitches on first appearance. */
function Precompile() {
  const { gl, scene, camera } = useThree()
  useEffect(() => {
    gl.compile(scene, camera)
  }, [gl, scene, camera])
  return null
}

export default function World() {
  return (
    <>
      <CameraRig />
      <Lights />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.4} color="#fff3df" position={[0, 6, 3]} rotation-x={Math.PI / 2.4} scale={[8, 4, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#ffd9a8" position={[-6, 2, 1]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#ff7a4a" position={[6, 1.5, -2]} rotation-y={-Math.PI / 2} scale={[5, 3, 1]} />
        <Lightformer form="ring" intensity={0.8} color="#ffffff" position={[0, 1, 7]} scale={[3, 3, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#fff6ea" position={[2.5, 9, -2]} rotation-x={Math.PI / 2} scale={[1.2, 5, 1]} />
      </Environment>
      <Arches />
      <Burger />
      <Fries />
      <Coffee />
      <Stage />
      <Precompile />
    </>
  )
}
