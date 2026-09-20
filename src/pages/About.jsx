import React from 'react'
import '../styles/About.scss'

const stats = [
  { num: '8+', label: 'Ani experiență' },
  { num: '3.000+', label: 'Mașini service-ate' },
  { num: '500+', label: 'Clienți mulțumiți' },
  { num: '2', label: 'Specializări' },
]

const values = [
  {
    title: 'Pasiune',
    description:
      'Ne place ce facem, și se vede în fiecare mașină pe care o atingem — nu tratăm nimic ca pe o rutină.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20.8 8.6c0 5.5-8.8 10.9-8.8 10.9S3.2 14.1 3.2 8.6a4.8 4.8 0 0 1 8.8-2.6 4.8 4.8 0 0 1 8.8 2.6z" />
      </svg>
    ),
  },
  {
    title: 'Onestitate',
    description:
      'Prețuri clare, spuse din start. Nu recomandăm servicii de care mașina ta nu are nevoie.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3l7 3.5v5.4c0 4.6-3 8.9-7 10.1-4-1.2-7-5.5-7-10.1V6.5z" />
        <path d="M9 12l2 2 4-4.5" />
      </svg>
    ),
  },
  {
    title: 'Precizie',
    description:
      'De la echilibrarea unei roți până la corectarea vopselei — detaliile fac diferența, mereu.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3.5v2M12 18.5v2M20.5 12h-2M5.5 12h-2" />
      </svg>
    ),
  },
]

const WheelMark = () => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="60" fill="none" stroke="#c8a24d" strokeWidth="3" />
    <circle cx="100" cy="100" r="10" fill="#c8a24d" />
    <g stroke="#c8a24d" strokeWidth="2.5" strokeLinecap="round">
      <line x1="100" y1="100" x2="100" y2="52" />
      <line x1="100" y1="100" x2="141" y2="76" />
      <line x1="100" y1="100" x2="141" y2="124" />
      <line x1="100" y1="100" x2="100" y2="148" />
      <line x1="100" y1="100" x2="59" y2="124" />
      <line x1="100" y1="100" x2="59" y2="76" />
    </g>
  </svg>
)

const About = () => {
  return (
    <div className="about-page">

      {/* Story */}
      <section className="about-story">
        <div className="story-inner">
          <div className="story-image">
            <WheelMark />
          </div>
          <div className="story-text">
            <div className="eyebrow">Povestea noastră</div>
            <h2>
              Pasiune pentru mașini, <span className="accent">de la primul șurub</span>
            </h2>
            <p>
              Norvex Automotives a pornit de la o pasiune simplă: mașinile bine
              întreținute merg mai bine și arată mai bine. Am început ca un mic
              atelier de vulcanizare și, an de an, am extins ce oferim pentru ca
              fiecare client să găsească aici tot ce are nevoie într-un singur loc.
            </p>
            <p>
              Astăzi combinăm vulcanizarea clasică, făcută cu răbdare și
              precizie, cu servicii de detailing la standard premium — pentru că
              o mașină are nevoie de grijă și pe dinăuntru, și pe dinafară.
            </p>
            <div className="story-signature">
              <span className="mark">Norvex</span>
              <span className="role">Echipa Norvex Automotives</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-row">
        <div className="stats-inner">
          {stats.map((stat) => (
            <div className="stat" key={stat.label}>
              <div className="num">{stat.num}</div>
              <div className="label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="values-section">
        <div className="eyebrow">Valorile noastre</div>
        <h2>Ce ne ghidează</h2>
        <p className="intro">
          Trei principii simple, respectate la fiecare mașină care intră pe
          poarta noastră.
        </p>

        <div className="values-grid">
          {values.map((value) => (
            <div className="value-card" key={value.title}>
              <span className="icon-badge">{value.icon}</span>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}

export default About