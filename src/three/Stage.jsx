import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { store } from '../lib/store'
import { arrive, handover, within } from '../lib/timeline'
import { radialAlpha } from './textures'
import { PEDESTAL_TOP } from './burgerSpec'

/*
 * Scene 5: one warm spotlight on a dark stage. The burger lands on a low
 * pedestal; the floor fades into the colour field at its edges.
 */
const LIGHT = new THREE.Vector3(0.6, 6.6, 2.4)
const AIM = new THREE.Vector3(0, PEDESTAL_TOP, 0)

const beamVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`
const beamFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec2 vUv;
  void main() {
    float facing = pow(abs(dot(normalize(vNormal), normalize(vView))), 2.2);
    float along = smoothstep(0.0, 0.45, vUv.y) * (1.0 - smoothstep(0.9, 1.0, vUv.y));
    float a = facing * along * uOpacity;
    gl_FragColor = vec4(uColor * a, a); // premultiplied: composites correctly on the transparent canvas
  }
`

export default function Stage() {
  const root = useRef()
  const spot = useRef()
  const beam = useRef()
  const { beamQuat, beamPos, beamLen } = useMemo(() => {
    const dir = LIGHT.clone().sub(AIM)
    const len = dir.length()
    return {
      beamLen: len,
      beamPos: AIM.clone().add(LIGHT).multiplyScalar(0.5),
      beamQuat: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize()),
    }
  }, [])
  const uniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color('#ffd79a') }, uOpacity: { value: 0 } }),
    [],
  )
  const alpha = radialAlpha()
  const target = useRef()
  useLayoutEffect(() => {
    spot.current.target = target.current
  }, [])

  useFrame(() => {
    const p = store.p
    const g = root.current
    if (!g) return
    const w3 = handover(p, 3)
    const on = p > 3.62 ? w3 : 0
    g.visible = p > 3.62
    spot.current.intensity = on * 260
    if (!g.visible) return
    g.position.y = -(1 - arrive(w3)) * 4
    uniforms.uOpacity.value = on * 0.3 * (0.9 + 0.1 * within(p, 4))
    beam.current.visible = on > 0.01
  })

  return (
    <>
      <spotLight
        ref={spot}
        position={LIGHT.toArray()}
        angle={0.36}
        penumbra={0.75}
        decay={2}
        color="#ffe2b0"
        intensity={0}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <object3D ref={target} position={AIM.toArray()} />
      <group ref={root}>
        <mesh position-y={PEDESTAL_TOP / 2} castShadow receiveShadow>
          <cylinderGeometry args={[1.05, 1.1, PEDESTAL_TOP, 72]} />
          <meshPhysicalMaterial color="#2b130a" roughness={0.5} clearcoat={0.5} clearcoatRoughness={0.4} />
        </mesh>
        <mesh position-y={PEDESTAL_TOP} rotation-x={Math.PI / 2}>
          <torusGeometry args={[1.05, 0.012, 8, 96]} />
          <meshStandardMaterial color="#ffc72c" emissive="#ffb000" emissiveIntensity={0.6} roughness={0.3} />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} position-y={0.001} receiveShadow>
          <circleGeometry args={[6, 64]} />
          <meshStandardMaterial color="#4a2312" roughness={0.9} alphaMap={alpha} transparent depthWrite={false} />
        </mesh>
      </group>
      <mesh ref={beam} position={beamPos.toArray()} quaternion={beamQuat} renderOrder={5}>
        <cylinderGeometry args={[0.02, 1.25, beamLen, 48, 1, true]} />
        <shaderMaterial
          vertexShader={beamVertex}
          fragmentShader={beamFragment}
          uniforms={uniforms}
          transparent
          premultipliedAlpha
          depthWrite={false}
        />
      </mesh>
    </>
  )
}
