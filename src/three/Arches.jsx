import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { store } from '../lib/store'
import { handover } from '../lib/timeline'
import { easeInCubic, smootherstep } from '../lib/math'
import { legSpans } from '../lib/arches'
import { archDoorGeometries } from './archGeometry'

/*
 * Scene 1: the arches as architecture. Each leg runs out across the floor
 * as a yellow lane toward the viewer; on scroll the M splits down its middle
 * stem and swings open like a pair of doors onto the burger behind it.
 */
const WIDTH = 3.9
const HEIGHT = 3.45
const DEPTH = 0.32
const Z = 1.55 // arches stand in front of the burger at the origin
const LANE = 42

export default function Arches() {
  const root = useRef()
  const left = useRef()
  const right = useRef()
  const { geos, lanes } = useMemo(() => {
    const geos = archDoorGeometries(WIDTH, HEIGHT, DEPTH)
    const lanes = legSpans(WIDTH).map(([a, b]) => ({ x: (a + b) / 2, w: b - a }))
    return { geos, lanes }
  }, [])

  useFrame(() => {
    const p = store.p
    const g = root.current
    if (!g) return
    const w0 = handover(p, 0)
    g.visible = p < 1
    if (!g.visible) return
    const open = smootherstep(0.06, 0.52, p) * 1.72
    left.current.rotation.y = open
    right.current.rotation.y = -open
    // the street drops away as the burger lifts off it
    g.position.y = -easeInCubic(w0) * 5
  })

  return (
    <group ref={root}>
      <group position={[-WIDTH / 2, 0, Z - DEPTH / 2]}>
        <group ref={left}>
          <mesh geometry={geos.left} position={[WIDTH / 2, 0, DEPTH / 2]} castShadow receiveShadow>
            <meshPhysicalMaterial color="#ffc21a" roughness={0.36} clearcoat={0.5} clearcoatRoughness={0.3} />
          </mesh>
        </group>
      </group>
      <group position={[WIDTH / 2, 0, Z - DEPTH / 2]}>
        <group ref={right}>
          <mesh geometry={geos.right} position={[-WIDTH / 2, 0, DEPTH / 2]} castShadow receiveShadow>
            <meshPhysicalMaterial color="#ffc21a" roughness={0.36} clearcoat={0.5} clearcoatRoughness={0.3} />
          </mesh>
        </group>
      </group>

      {lanes.map((lane, i) => (
        <mesh
          key={i}
          position={[lane.x, 0.006, Z - DEPTH / 2 + LANE / 2]}
          rotation-x={-Math.PI / 2}
          receiveShadow
        >
          <planeGeometry args={[lane.w, LANE]} />
          <meshStandardMaterial color="#b87200" roughness={0.75} />
        </mesh>
      ))}
    </group>
  )
}
