import { useMemo } from 'react'
import * as THREE from 'three'
import { ContactShadows } from '@react-three/drei'

// Procedurally generated radial-gradient glow texture — no network asset required.
function useGlowTexture(inner = 'rgba(63,169,255,0.55)', outer = 'rgba(63,169,255,0)') {
  return useMemo(() => {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    gradient.addColorStop(0, inner)
    gradient.addColorStop(0.55, outer.replace('0)', '0.16)'))
    gradient.addColorStop(1, outer)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [inner, outer])
}

export default function Platform() {
  const glow = useGlowTexture()

  return (
    <group position={[0, -0.92, 0]}>
      {/* main dark disc */}
      <mesh receiveShadow>
        <cylinderGeometry args={[1.55, 1.7, 0.06, 96]} />
        <meshPhysicalMaterial color="#0b0d10" roughness={0.35} metalness={0.55} clearcoat={0.4} clearcoatRoughness={0.3} />
      </mesh>

      {/* illuminated inset ring */}
      <mesh position={[0, 0.034, 0]}>
        <torusGeometry args={[1.28, 0.012, 16, 96]} />
        <meshStandardMaterial color="#bfe6ff" emissive="#3fa9ff" emissiveIntensity={2.2} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.032, 0]}>
        <torusGeometry args={[0.78, 0.006, 16, 96]} />
        <meshStandardMaterial color="#bfe6ff" emissive="#3fa9ff" emissiveIntensity={1.4} roughness={0.4} />
      </mesh>

      {/* soft ground glow, additive, procedural texture */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.2, 6.2]} />
        <meshBasicMaterial map={glow} transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      <ContactShadows
        position={[0, 0.045, 0]}
        opacity={0.62}
        scale={5.5}
        blur={2.6}
        far={1.4}
        resolution={512}
        color="#000000"
        frames={60}
      />
    </group>
  )
}
