import * as THREE from 'three'

const MATTE_BLACK = {
  color: '#0b0c0e',
  roughness: 0.58,
  metalness: 0.1,
  clearcoat: 0.35,
  clearcoatRoughness: 0.4,
}

const BRUSHED_METAL = {
  color: '#42464c',
  roughness: 0.34,
  metalness: 0.88,
  clearcoat: 0.2,
  clearcoatRoughness: 0.3,
}

const DARK_METAL = {
  color: '#1c1e22',
  roughness: 0.4,
  metalness: 0.8,
}

const LEATHER = {
  color: '#17140f',
  roughness: 0.92,
  metalness: 0.0,
  sheen: 1,
  sheenColor: '#4a3c2a',
  sheenRoughness: 0.75,
}

function EarCup({ side = 1 }) {
  const x = side * 0.86

  return (
    <group position={[x, 0.06, 0]} rotation={[0, side * -0.17, 0]}>
      {/* yoke arm rising to the headband */}
      <mesh position={[0, 0.24, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.026, 0.42, 16]} />
        <meshPhysicalMaterial {...BRUSHED_METAL} />
      </mesh>

      {/* slider housing where the yoke meets the cup */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <boxGeometry args={[0.075, 0.16, 0.05]} />
        <meshPhysicalMaterial {...MATTE_BLACK} />
      </mesh>
      <mesh position={[0, 0.02, 0.027]}>
        <boxGeometry args={[0.05, 0.1, 0.006]} />
        <meshPhysicalMaterial {...DARK_METAL} />
      </mesh>

      {/* outer shell — flattened sphere reads as a rounded metal cup */}
      <mesh scale={[1, 1.06, 0.6]} castShadow receiveShadow>
        <sphereGeometry args={[0.335, 56, 56]} />
        <meshPhysicalMaterial {...BRUSHED_METAL} />
      </mesh>

      {/* rear vent ribs, subtle */}
      {[-0.1, 0, 0.1].map((oy) => (
        <mesh key={oy} position={[0, oy, -0.198]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.006, 0.006, 0.16, 8]} />
          <meshPhysicalMaterial {...DARK_METAL} />
        </mesh>
      ))}

      {/* cushion ring */}
      <mesh position={[0, 0, 0.19]} castShadow>
        <torusGeometry args={[0.275, 0.078, 28, 56]} />
        <meshPhysicalMaterial {...LEATHER} />
      </mesh>

      {/* inner matte faceplate, recessed */}
      <mesh position={[0, 0, 0.155]}>
        <circleGeometry args={[0.28, 56]} />
        <meshPhysicalMaterial {...MATTE_BLACK} side={THREE.DoubleSide} />
      </mesh>

      {/* driver mesh grille */}
      <mesh position={[0, 0, 0.205]}>
        <circleGeometry args={[0.19, 48]} />
        <meshPhysicalMaterial color="#08090a" roughness={0.75} metalness={0.15} side={THREE.DoubleSide} />
      </mesh>

      {/* brand accent ring — subtle cyan-lit metallic detail */}
      <mesh position={[0, 0, 0.212]}>
        <torusGeometry args={[0.085, 0.0055, 16, 48]} />
        <meshStandardMaterial color="#bfe6ff" emissive="#3fa9ff" emissiveIntensity={1.1} roughness={0.3} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.218]}>
        <circleGeometry args={[0.014, 24]} />
        <meshStandardMaterial color="#eaf7ff" emissive="#7fd8ff" emissiveIntensity={0.6} roughness={0.2} metalness={0.3} />
      </mesh>
    </group>
  )
}

export default function Headphones() {
  return (
    // Recenters the model on its own visual middle (roughly between the
    // headband apex and the bottom of the ear cups) so the parent rig can
    // treat (0,0,0) as "the product" without a hand-tuned camera pitch.
    <group position={[0, -0.52, 0]}>
      {/* headband arch */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <torusGeometry args={[0.855, 0.05, 28, 72, Math.PI]} />
        <meshPhysicalMaterial {...BRUSHED_METAL} />
      </mesh>

      {/* inner padded strip on the underside of the headband */}
      <mesh position={[0, 0.5, 0.044]}>
        <torusGeometry args={[0.845, 0.026, 16, 72, Math.PI]} />
        <meshPhysicalMaterial {...LEATHER} />
      </mesh>

      {/* headband stitched seam accent */}
      <mesh position={[0, 0.5, 0.07]}>
        <torusGeometry args={[0.845, 0.004, 8, 72, Math.PI]} />
        <meshStandardMaterial color="#3fa9ff" emissive="#3fa9ff" emissiveIntensity={0.5} roughness={0.5} />
      </mesh>

      {/* small metal end-caps where the headband meets each yoke */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.855, 0.5, 0]} castShadow>
          <sphereGeometry args={[0.052, 24, 24]} />
          <meshPhysicalMaterial {...DARK_METAL} />
        </mesh>
      ))}

      <EarCup side={1} />
      <EarCup side={-1} />
    </group>
  )
}
