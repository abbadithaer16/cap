import './ScrollReveal.css'

const CALLOUTS = [
  { label: '40H', title: 'BATTERY LIFE', desc: 'Days of playback on a single charge.' },
  { label: 'ANC', title: 'ACTIVE NOISE CANCELLATION', desc: 'Studio-grade silence, tuned in real time.' },
  { label: 'HI-RES', title: 'HI-RES AUDIO', desc: 'Every frequency, reproduced with precision.' },
]

export default function ScrollReveal({ stageRef, stageInnerRef, headlineRef, calloutRefs }) {
  return (
    <section className="scroll-stage" ref={stageRef}>
      <div className="scroll-stage__inner" ref={stageInnerRef}>
        <h2 className="scroll-stage__headline" ref={headlineRef}>
          DESIGNED
          <br />
          FROM EVERY
          <br />
          ANGLE.
        </h2>

        <div className="scroll-stage__callouts">
          {CALLOUTS.map((c, i) => (
            <div className="callout" key={c.title} ref={calloutRefs[i]}>
              <span className="callout__label">{c.label}</span>
              <span className="callout__title">{c.title}</span>
              <span className="callout__desc">{c.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
