import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { copy, OFFICIAL_URL } from './lib/copy'
import { startTicker, store, subscribe } from './lib/store'
import { smoothstep } from './lib/math'
import { useMediaQuery, useReducedMotion } from './hooks/useMediaQuery'
import { useScrollDriver } from './hooks/useScrollDriver'
import ArchMark from './components/ArchMark'
import Nav from './components/Nav'
import Loader from './components/Loader'
import Field from './components/Field'
import Overlay from './components/Overlay'

const Scene = lazy(() => import('./three/Scene'))

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

function initialLang() {
  try {
    const q = new URLSearchParams(window.location.search).get('lang')
    if (q === 'ar' || q === 'en') return q
    const saved = window.localStorage.getItem('mcd-jo-lang')
    if (saved === 'ar' || saved === 'en') return saved
  } catch {
    /* storage can be unavailable; English is the default */
  }
  return 'en'
}

/** Fonts are needed before the 3D textures paint the McCafé wordmark. */
function waitForFonts() {
  if (!document.fonts?.load) return Promise.resolve()
  const loads = Promise.all([
    document.fonts.load('700 100px "Archivo Variable"'),
    document.fonts.load('800 100px "Cairo Variable"', 'ع'),
  ])
  return Promise.race([loads, new Promise((r) => setTimeout(r, 2500))])
}

export default function App() {
  const [lang, setLang] = useState(initialLang)
  const t = copy[lang]
  const reduced = useReducedMotion()
  const mobile = useMediaQuery('(max-width: 820px)')
  const [webgl] = useState(hasWebGL)
  const [fonts, setFonts] = useState(false)
  const [canvasReady, setCanvasReady] = useState(false)
  const [minTime, setMinTime] = useState(false)
  const [loaderGone, setLoaderGone] = useState(false)
  const mainRef = useRef()
  const hintRef = useRef()
  const heroRef = useRef()
  const footRef = useRef()

  useLayoutEffect(() => {
    store.reduced = reduced
    store.mobile = mobile
    store.rtl = t.dir === 'rtl'
    store.webgl = webgl
  }, [reduced, mobile, t.dir, webgl])

  useEffect(() => {
    const html = document.documentElement
    html.lang = lang
    html.dir = t.dir
    document.title = lang === 'ar' ? 'ماكدونالدز الأردن، تصوّر ثلاثي الأبعاد' : 'McDonald’s Jordan, a 3D concept'
    try {
      window.localStorage.setItem('mcd-jo-lang', lang)
    } catch {
      /* ignore */
    }
  }, [lang, t.dir])

  useEffect(() => startTicker(), [])
  useScrollDriver(mainRef)

  useEffect(() => {
    let alive = true
    waitForFonts().then(() => alive && setFonts(true))
    const timer = setTimeout(() => setMinTime(true), reduced ? 200 : 1300)
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [reduced])

  const loaded = fonts && minTime && (canvasReady || !webgl)
  useEffect(() => {
    if (!loaded) return
    document.documentElement.classList.add('is-loaded')
    const timer = setTimeout(() => setLoaderGone(true), reduced ? 250 : 1100)
    return () => clearTimeout(timer)
  }, [loaded, reduced])

  // pointer parallax input, desktop only
  useEffect(() => {
    const move = (e) => {
      store.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      store.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])

  // the scroll hint fades as soon as the page moves; the hero words step
  // aside while the arches open so they never sit on top of the burger
  useEffect(
    () =>
      subscribe((p) => {
        if (hintRef.current) hintRef.current.style.opacity = String(Math.max(0, 1 - p * 8))
        const k = smoothstep(0.16, 0.42, p)
        for (const el of [heroRef.current, footRef.current]) {
          if (!el) continue
          el.style.opacity = String(1 - k)
          el.style.transform = k ? `translate3d(0, ${(-k * 6).toFixed(2)}vh, 0)` : ''
        }
      }),
    [],
  )

  const toggleLang = useCallback(() => setLang((l) => (l === 'en' ? 'ar' : 'en')), [])
  const onReady = useCallback(() => setCanvasReady(true), [])

  return (
    <div className={`app${webgl ? '' : ' no-webgl'}`} id="top">
      <Loader t={t} done={loaded} gone={loaderGone} />
      <Field />
      {webgl && fonts && (
        <div className="stage" aria-hidden="true">
          <Suspense fallback={null}>
            <Scene mobile={mobile} onReady={onReady} />
          </Suspense>
        </div>
      )}
      <Overlay t={t} />
      <Nav t={t} onToggleLang={toggleLang} />

      <main className="scenes" ref={mainRef}>
        <section className="scene scene--arches" aria-labelledby="t-arches">
          <div className="scene__pin">
            <div className="hero" ref={heroRef}>
              <ArchMark className="hero__mark" />
              <h1 id="t-arches" className="display hero__title">
                <span>{t.hero.title[0]}</span> <span>{t.hero.title[1]}</span>
              </h1>
            </div>
            <ArchMark className="fallback-art" />
            <div className="hero__foot" ref={footRef}>
              <p className="hero__body">{t.hero.body}</p>
              <p className="hero__hint" ref={hintRef} aria-hidden="true">
                <span>{t.hero.hint}</span>
              </p>
            </div>
          </div>
        </section>

        <section className="scene scene--build" aria-labelledby="t-build">
          <div className="scene__pin">
            <div className="copy copy--build">
              <h2 id="t-build" className="display display--md">
                {t.build.title}
              </h2>
              <p className="lede">{t.build.body}</p>
              <div className="ingredients">
                <h3 className="ingredients__label">{t.build.listLabel}</h3>
                <ul>
                  {Object.entries(t.build.labels).map(([key, label]) => (
                    <li key={key}>{label}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="scene scene--fries" aria-labelledby="t-fries">
          <div className="scene__pin">
            <div className="copy copy--fries">
              <h2 id="t-fries" className="display display--stack">
                {t.fries.title.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h2>
              <p className="lede">{t.fries.body}</p>
            </div>
          </div>
        </section>

        <section className="scene scene--cafe" aria-labelledby="t-cafe">
          <div className="scene__pin">
            <div className="copy copy--cafe">
              <h2 id="t-cafe" className="display display--md">
                {t.cafe.title}
              </h2>
              <p className="visually-hidden">{t.cafe.curve}</p>
            </div>
            <p className="lede copy--cafe-foot">{t.cafe.body}</p>
          </div>
        </section>

        <section className="scene scene--stage" aria-labelledby="t-stage">
          <div className="scene__pin">
            <div className="copy copy--stage">
              <ArchMark className="stage-mark" />
              <h2 id="t-stage" className="display display--md">
                {t.stage.title}
              </h2>
              <p className="lede">{t.stage.body}</p>
              <a className="cta" href={OFFICIAL_URL} target="_blank" rel="noopener noreferrer">
                {t.stage.cta}
                <span aria-hidden="true"> ↗</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p className="footer__note">{t.footer.disclaimer}</p>
        <a className="footer__top" href="#top">
          {t.footer.top}
        </a>
      </footer>
    </div>
  )
}
