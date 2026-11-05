import './Hero.css'

export default function Hero({ heroSectionRef, heroTextRef, hintRef }) {
  return (
    <section className="hero" ref={heroSectionRef}>
      <div className="hero__content" ref={heroTextRef}>
        <p className="hero__eyebrow">NEXORA / A1</p>
        <h1 className="hero__headline">
          BEYOND
          <br />
          ORDINARY.
        </h1>
        <p className="hero__copy">
          Technology should not only perform.
          <br />
          It should feel extraordinary.
        </p>
        <div className="hero__actions">
          <button type="button" className="btn btn--primary">
            EXPLORE A1
          </button>
          <button type="button" className="btn btn--ghost">
            SHOP — 149 JOD
          </button>
        </div>
      </div>

      <div className="hero__hint" ref={hintRef}>
        <span className="hero__hint-ring" aria-hidden="true" />
        <span className="hero__hint-text">
          360°
          <br />
          DRAG TO EXPLORE
        </span>
      </div>

      <div className="hero__scroll-cue" aria-hidden="true">
        <span className="hero__scroll-line" />
        SCROLL
      </div>
    </section>
  )
}
