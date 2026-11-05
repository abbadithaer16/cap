import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

/**
 * Direct-manipulation rotation for a product hero object.
 * - pointer drag (mouse + touch) rotates the target group on Y (yaw) and X (pitch)
 * - releasing keeps spinning with decaying velocity (inertia)
 * - when idle for a moment, a slow autonomous yaw drift resumes
 * - the pointer position (even without pressing) adds a subtle parallax tilt
 * - a gentle vertical bob is layered on top for "floating" product-shot feel
 */
export function useDragRotate(
  groupRef,
  {
    initialYaw = 0,
    minPitch = -0.32,
    maxPitch = 0.28,
    sensitivity = 0.0062,
    damping = 0.9,
    idleDelay = 1.3,
    idleSpeed = 0.055,
    followStrength = 0.14,
    floatAmplitude = 0.055,
    floatSpeed = 0.55,
    enabled = true,
  } = {},
) {
  const { gl } = useThree()
  const s = useRef({
    dragging: false,
    pointerId: null,
    lastX: 0,
    lastY: 0,
    velYaw: 0,
    velPitch: 0,
    yaw: initialYaw,
    pitch: -0.04,
    idleTimer: 0,
    nx: 0,
    ny: 0,
    hasInteracted: false,
  })

  useEffect(() => {
    if (!enabled) return
    const el = gl.domElement
    const prevTouchAction = el.style.touchAction
    el.style.touchAction = 'none'
    const state = s.current

    const setPointerNormalized = (e) => {
      const rect = el.getBoundingClientRect()
      state.nx = ((e.clientX - rect.left) / rect.width) * 2 - 1
      state.ny = ((e.clientY - rect.top) / rect.height) * 2 - 1
    }

    const onPointerDown = (e) => {
      state.dragging = true
      state.hasInteracted = true
      state.pointerId = e.pointerId
      state.lastX = e.clientX
      state.lastY = e.clientY
      state.velYaw = 0
      state.velPitch = 0
      el.setPointerCapture?.(e.pointerId)
    }

    const onPointerMove = (e) => {
      setPointerNormalized(e)
      if (!state.dragging || e.pointerId !== state.pointerId) return
      const dx = e.clientX - state.lastX
      const dy = e.clientY - state.lastY
      state.lastX = e.clientX
      state.lastY = e.clientY
      const dYaw = dx * sensitivity
      const dPitch = dy * sensitivity
      state.yaw += dYaw
      state.pitch = clamp(state.pitch + dPitch, minPitch, maxPitch)
      state.velYaw = dYaw
      state.velPitch = dPitch
      state.idleTimer = 0
    }

    const endDrag = (e) => {
      if (e && e.pointerId !== state.pointerId) return
      state.dragging = false
      try {
        el.releasePointerCapture?.(state.pointerId)
      } catch {
        /* already released */
      }
    }

    el.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerup', endDrag)
    window.addEventListener('pointercancel', endDrag)

    return () => {
      el.style.touchAction = prevTouchAction
      el.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', endDrag)
      window.removeEventListener('pointercancel', endDrag)
    }
  }, [gl, enabled, sensitivity, minPitch, maxPitch])

  useFrame((state3, delta) => {
    const group = groupRef.current
    const st = s.current
    if (!group || !enabled) return
    const dt = Math.min(delta, 0.05)

    if (!st.dragging) {
      st.velYaw *= damping
      st.velPitch *= damping
      if (Math.abs(st.velYaw) < 0.00004) st.velYaw = 0
      if (Math.abs(st.velPitch) < 0.00004) st.velPitch = 0
      st.yaw += st.velYaw
      st.pitch = clamp(st.pitch + st.velPitch, minPitch, maxPitch)

      st.idleTimer += dt
      if (st.velYaw === 0 && st.velPitch === 0 && st.idleTimer > idleDelay) {
        st.yaw += idleSpeed * dt
      }
    }

    const targetYaw = st.yaw + st.nx * followStrength
    const targetPitch = clamp(st.pitch + st.ny * followStrength * 0.45, minPitch - 0.1, maxPitch + 0.1)

    group.rotation.y = THREE.MathUtils.damp(group.rotation.y, targetYaw, 5.2, dt)
    group.rotation.x = THREE.MathUtils.damp(group.rotation.x, targetPitch, 5.2, dt)

    const bob = Math.sin(state3.clock.elapsedTime * floatSpeed) * floatAmplitude
    group.position.y = THREE.MathUtils.damp(group.position.y, bob, 4, dt)
  })

  return s
}
