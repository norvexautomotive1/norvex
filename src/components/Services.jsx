import React from 'react'
import '../styles/Services.scss'

const services = [
  {
    index: '01',
    title: 'Vulcanizare',
    description:
      'Montaj, echilibrare și reparații profesionale de anvelope, cu echipamente de ultimă generație. Lucrăm rapid și fără compromisuri, indiferent de tipul sau dimensiunea jantei.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />
        <path d="M12 3.5v3M12 17.5v3M20.5 12h-3M6.5 12h-3M17.7 6.3l-2.1 2.1M8.4 15.6l-2.1 2.1M17.7 17.7l-2.1-2.1M8.4 8.4L6.3 6.3" />
      </svg>
    ),
  },
  {
    index: '02',
    title: 'Detailing',
    description:
      'Curățare interioară și exterioară la standard premium, polish, protecție ceramică și corectare vopsea. Mașina ta arată — și rămâne — impecabilă.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M6 14c1.5-4 4-7 8-9.5-1 3-1 5.5 0 8 1.5-1 3-1.5 4.5-1-2 3-5 5.5-8.5 6.5-1.5.4-3 .6-4 0-1.2-.7-1-2.5 0-4z" />
        <path d="M5 19l2.5-2.5" />
      </svg>
    ),
  },
]

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

const Services = () => {
  return (
    <div id="services-section" className="services-container">
      <div className="eyebrow">Ce oferim</div>
      <h2>Serviciile noastre</h2>
      <p className="intro">
        Două specializări, un singur standard: precizie tehnică și finisaj impecabil,
        pentru fiecare mașină care intră pe poarta noastră.
      </p>

      <div className="cards">
        {services.map((service) => (
          <div className="card" key={service.index}>
            <div className="card-top">
              <span className="icon-badge">{service.icon}</span>
              <span className="index">{service.index}</span>
            </div>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <a href="#" className="card-link">
              Află mai multe
              <ArrowIcon />
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Services