import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import Experience from '../three/Experience'

export default function SceneCanvas({ domRefs, isMobile, onReady }) {
  return (
    <Canvas
      className="scene-canvas"
      shadows={false}
      dpr={[1, isMobile ? 1.6 : 2]}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
      camera={{ fov: 30, near: 0.1, far: 30, position: [0, 0.1, 5.4] }}
      onCreated={() => onReady?.()}
    >
      <Suspense fallback={null}>
        <Experience domRefs={domRefs} isMobile={isMobile} />
      </Suspense>
    </Canvas>
  )
}
