import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { copy, OFFICIAL_URL } from './lib/copy'
import { redraw, startTicker, store, subscribe } from './lib/store'
import { smoothstep } from './lib/math'
import { useMediaQuery, useReducedMotion } from './hooks/useMediaQuery'
import { useScrollDriver } from './hooks/useScrollDriver'
import ArchMark from './components/ArchMark'
import Nav from './components/Nav'
import Loader from './components/Loader'
import Field from './components/Field'
import Stage from './components/Stage'
import { PRODUCT_IMAGES } from './lib/products'

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

/** Wait for the type and the product photos so the first frame is complete. */
function waitForAssets() {
  const fonts = document.fonts?.load
    ? Promise.all([
        document.fonts.load('700 100px "Archivo Variable"'),
        document.fonts.load('800 100px "Cairo Variable"', 'ع'),
      ])
    : Promise.resolve()
  const images = PRODUCT_IMAGES.map((src) => {
    const img = new Image()
    img.src = src
    return img.decode().catch(() => {})
  })
  return Promise.race([Promise.all([fonts, ...images]), new Promise((r) => setTimeout(r, 4000))])
}

export default function App() {
  const [lang, setLang] = useState(initialLang)
  const t = copy[lang]
  const reduced = useReducedMotion()
  const mobile = useMediaQuery('(max-width: 820px)')
  const [assets, setAssets] = useState(false)
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
    // layout depends on these: redraw the current frame when they change
    redraw()
  }, [reduced, mobile, t.dir])

  useEffect(() => {
    const html = document.documentElement
    html.lang = lang
    html.dir = t.dir
    document.title = lang === 'ar' ? 'ماكدونالدز الأردن، تصوّر تصميمي' : 'McDonald’s Jordan, a design concept'
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
    waitForAssets().then(() => alive && setAssets(true))
    const timer = setTimeout(() => setMinTime(true), reduced ? 200 : 1300)
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [reduced])

  const loaded = assets && minTime
  useEffect(() => {
    if (!loaded) return
    document.documentElement.classList.add('is-loaded')
    const timer = setTimeout(() => setLoaderGone(true), reduced ? 250 : 1100)
    return () => clearTimeout(timer)
  }, [loaded, reduced])

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

  return (
    <div className="app" id="top">
      <Loader t={t} done={loaded} gone={loaderGone} />
      <Field />
      <Stage t={t} />
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
