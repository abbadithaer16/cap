import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import World from './World'

/**
 * One canvas for the whole page, fixed behind the text. It is transparent:
 * the flat colour fields are CSS, so brand colours stay exact and the 3D
 * only contributes product, light and shadow.
 */
export default function Scene({ mobile, onReady }) {
  const max = mobile ? 1.5 : 2
  const [dpr, setDpr] = useState(Math.min(max, window.devicePixelRatio || 1))

  return (
    <Canvas
      className="stage__canvas"
      dpr={dpr}
      shadows="percentage"
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 32, near: 0.1, far: 80, position: [0, 0.5, 11.8] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NeutralToneMapping
        gl.toneMappingExposure = 1.05
        gl.setClearColor(0x000000, 0)
        onReady?.()
      }}
    >
      <PerformanceMonitor
        onDecline={() => setDpr((d) => Math.max(1, d - 0.25))}
        onIncline={() => setDpr((d) => Math.min(max, d + 0.25))}
        flipflops={3}
        onFallback={() => setDpr(1)}
      />
      <Suspense fallback={null}>
        <World />
      </Suspense>
    </Canvas>
  )
}
