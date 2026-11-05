import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { Environment, Lightformer, Sparkles, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Headphones from './Headphones'
import Platform from './Platform'
import { useDragRotate } from '../hooks/useDragRotate'

gsap.registerPlugin(ScrollTrigger)

export default function Experience({ domRefs, isMobile }) {
  const { camera } = useThree()
  const scrollGroup = useRef()
  const dragGroup = useRef()

  useDragRotate(dragGroup, { initialYaw: -0.4 })

  useEffect(() => {
    const initialX = isMobile ? 0 : 0.78
    const initialRotY = isMobile ? 0 : -0.3

    if (scrollGroup.current) {
      scrollGroup.current.position.set(initialX, 0, -0.15)
      scrollGroup.current.rotation.y = initialRotY
    }
    camera.position.set(0, 0.1, isMobile ? 6.4 : 5.4)
    camera.fov = isMobile ? 34 : 30
    camera.updateProjectionMatrix()
    // Aim slightly below the product's own center so the illuminated
    // platform stays in frame beneath it. On mobile the hero copy stacks
    // vertically above, so the product+platform group sits lower still.
    camera.lookAt(0, isMobile ? -0.82 : -0.12, 0)

    // Wait a tick so sibling DOM refs (rendered in the parent React tree
    // alongside this separate R3F root) are guaranteed to be attached.
    let ctx
    const raf = requestAnimationFrame(() => {
      const { heroSectionRef, heroTextRef, hintRef, stageRef, stageInnerRef, headlineRef, calloutRefs } = domRefs
      if (!heroSectionRef.current || !stageRef.current || !scrollGroup.current) return

      ctx = gsap.context(() => {
        if (heroTextRef.current) {
          gsap.to(heroTextRef.current, {
            opacity: 0,
            y: -36,
            ease: 'none',
            scrollTrigger: {
              trigger: heroSectionRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          })
        }

        if (hintRef.current) {
          gsap.to(hintRef.current, {
            opacity: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: heroSectionRef.current,
              start: 'top top',
              end: '30% top',
              scrub: true,
            },
          })
        }

        gsap.to(scrollGroup.current.position, {
          x: isMobile ? 0 : 0.3,
          z: 0.05,
          ease: 'none',
          scrollTrigger: {
            trigger: heroSectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        })
        gsap.to(scrollGroup.current.rotation, {
          y: isMobile ? 0.08 : -0.08,
          ease: 'none',
          scrollTrigger: {
            trigger: heroSectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        })

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: stageRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
            pin: stageInnerRef.current,
            anticipatePin: 1,
          },
        })

        // Keep the dolly-in modest and lift the product as it centers: the
        // ear cups must clear the callout row below and the headline above
        // at every scroll step, not just at the final frame.
        tl.to(scrollGroup.current.position, { x: 0, z: 0.15, y: 0.34, duration: 1 }, 0)
          .to(scrollGroup.current.rotation, { y: 0.1, duration: 1 }, 0)
          .to(camera.position, { z: isMobile ? 5.4 : 4.75, y: 0.22, duration: 1 }, 0)

        if (headlineRef.current) {
          tl.to(headlineRef.current, { opacity: 1, y: 0, duration: 0.3 }, 0.02)
        }
        calloutRefs.forEach((r, i) => {
          if (r.current) {
            tl.to(r.current, { opacity: 1, y: 0, duration: 0.22 }, 0.46 + i * 0.16)
          }
        })

        ScrollTrigger.refresh()
      })
    })

    return () => {
      cancelAnimationFrame(raf)
      ctx?.revert()
    }
  }, [camera, domRefs, isMobile])

  return (
    <>
      <color attach="background" args={['#050607']} />
      <fog attach="fog" args={['#050607', 6, 13]} />

      <hemisphereLight args={['#1c2733', '#000000', 0.45]} />
      {/* key light — strong soft white-warm */}
      <directionalLight position={[3.2, 4, 3.6]} intensity={2.4} color="#fff6ec" />
      {/* rim light — electric blue */}
      <directionalLight position={[-4.2, 2.2, -2.8]} intensity={2.1} color="#3fa9ff" />
      {/* fill — subtle cyan */}
      <pointLight position={[1.4, -0.6, 2.6]} intensity={0.45} color="#7fd8ff" distance={6} />
      <pointLight position={[-2, 1.6, 1.6]} intensity={0.3} color="#eaf6ff" distance={6} />

      {/* procedural studio environment for reflections — no network assets */}
      {/* frames={1} bakes the reflection cubemap once — the lightformers
          never move, so re-rendering it every frame would be pure waste */}
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.1} color="#eaf4ff" position={[0, 3.5, 2]} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={3.2} color="#3fa9ff" position={[-4, 1.4, -3]} rotation={[0, Math.PI / 3, 0]} scale={[4, 4, 1]} />
        <Lightformer form="rect" intensity={1.3} color="#7fd8ff" position={[3.6, -1, -2]} rotation={[0, -Math.PI / 4, 0]} scale={[3, 3, 1]} />
        <Lightformer form="ring" intensity={0.9} color="#ffffff" position={[0, 0.4, 4]} scale={[3, 3, 1]} />
      </Environment>

      {/* Product + platform + particles scale and shift together so their
          proportions stay correct on narrow screens — only the camera
          distance/aim changes between breakpoints. */}
      <group scale={isMobile ? 0.56 : 1} position={[0, isMobile ? -0.92 : 0, 0]}>
        <group ref={scrollGroup}>
          <group ref={dragGroup}>
            <Headphones />
          </group>
        </group>

        <Platform />

        <Sparkles count={60} scale={[6, 3, 6]} size={1.3} speed={0.2} opacity={0.3} color="#7fd8ff" position={[0, 0.4, 0]} />
      </group>

      <AdaptiveDpr pixelated={false} />
      <AdaptiveEvents />
    </>
  )
}
