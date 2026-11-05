import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ScrollReveal from './components/ScrollReveal'
import SceneCanvas from './components/SceneCanvas'
import LoadingScreen from './components/LoadingScreen'
import './App.css'

export default function App() {
  const [progress, setProgress] = useState(0)
  const [canvasReady, setCanvasReady] = useState(false)
  const [loadingDone, setLoadingDone] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const displayProgress = useRef(0)

  const heroSectionRef = useRef(null)
  const heroTextRef = useRef(null)
  const hintRef = useRef(null)
  const stageRef = useRef(null)
  const stageInnerRef = useRef(null)
  const headlineRef = useRef(null)
  const callout0 = useRef(null)
  const callout1 = useRef(null)
  const callout2 = useRef(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const calloutRefs = useMemo(() => [callout0, callout1, callout2], [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 860px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // Progress climbs toward 88% while we wait for the WebGL context to
  // actually report ready (onCreated), then eases to 100%.
  useEffect(() => {
    let raf
    const start = performance.now()
    const step = () => {
      const elapsed = performance.now() - start
      const ceiling = canvasReady ? 100 : Math.min(88, (elapsed / 1200) * 88)
      displayProgress.current += (ceiling - displayProgress.current) * 0.15
      if (displayProgress.current >= 99.5) {
        displayProgress.current = 100
        setProgress(100)
        return
      }
      setProgress(displayProgress.current)
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [canvasReady])

  useEffect(() => {
    if (canvasReady && progress > 99.4 && !loadingDone) {
      const t = setTimeout(() => setLoadingDone(true), 320)
      return () => clearTimeout(t)
    }
  }, [canvasReady, progress, loadingDone])

  // Stable object identity across re-renders (e.g. the loading-progress
  // ticks below) — Experience's setup effect depends on this reference.
  const domRefs = useMemo(
    () => ({
      heroSectionRef,
      heroTextRef,
      hintRef,
      stageRef,
      stageInnerRef,
      headlineRef,
      calloutRefs,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [calloutRefs],
  )

  const handleCanvasReady = useCallback(() => setCanvasReady(true), [])

  return (
    <>
      <LoadingScreen progress={progress} hiding={loadingDone} />

      <div className="scene-fixed" aria-hidden="true">
        <SceneCanvas domRefs={domRefs} isMobile={isMobile} onReady={handleCanvasReady} />
      </div>

      <Navbar />

      <main className="page">
        <Hero heroSectionRef={heroSectionRef} heroTextRef={heroTextRef} hintRef={hintRef} />
        <ScrollReveal
          stageRef={stageRef}
          stageInnerRef={stageInnerRef}
          headlineRef={headlineRef}
          calloutRefs={calloutRefs}
        />
      </main>
    </>
  )
}
