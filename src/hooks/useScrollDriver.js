import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { store } from '../lib/store'
import { COUNT } from '../lib/timeline'

gsap.registerPlugin(ScrollTrigger)

/**
 * Maps native scroll to store.target in scene units: scene i spans
 * [i, i + 1) across its own section, whatever that section's height.
 */
export function useScrollDriver(rootRef) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray('.scene', root)
      let tops = []
      let heights = []
      const measure = () => {
        tops = sections.map((s) => s.getBoundingClientRect().top + window.scrollY)
        heights = sections.map((s) => s.offsetHeight)
      }
      const update = () => {
        const y = window.scrollY
        let p = 0
        for (let i = 0; i < sections.length; i++) {
          if (y >= tops[i]) p = i + Math.min(1, (y - tops[i]) / heights[i])
        }
        store.target = Math.min(p, COUNT)
      }
      measure()
      update()
      // land on the restored scroll position instead of flying in from the top
      store.p = store.target
      ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: update,
        onRefresh: () => {
          measure()
          update()
        },
      })
      // sections below the last pin still move the page; keep target fresh
      window.addEventListener('scroll', update, { passive: true })
      return () => window.removeEventListener('scroll', update)
    }, root)
    return () => ctx.revert()
  }, [rootRef])
}
