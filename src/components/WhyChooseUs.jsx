import React from 'react'
import '../styles/WhyChooseUs.scss'

const reasons = [
  {
    title: 'Rapid',
    description:
      'Intervenții și programări gândite să nu-ți piardă timpul — intri, rezolvăm, pleci.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Experiență',
    description:
      'Ani de lucru cu toate tipurile de mașini, de la uz zilnic până la modele de performanță.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path
          d="M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 1 5.4-5.4L21 6l-3-3-3.3 3.3z"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: 'Atenție la detalii',
    description:
      'Fiecare mașină iese verificată de două ori. Nu lăsăm nimic la voia întâmplării.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3l2.1 5.6L20 11l-5.9 2.4L12 19l-2.1-5.6L4 11l5.9-2.4L12 3z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Locatie',
    description:
      'Ne găsești ușor, cu program flexibil adaptat rutinei tale zilnice.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
        <circle cx="12" cy="9.5" r="2.4" />
      </svg>
    ),
  },
]

const WhyChooseUs = () => {
  return (
    <section className="why-choose-us">
      <div className="eyebrow">Avantaje</div>
      <h2>De ce să ne alegi pe noi?</h2>
      <p className="intro">
        Nu suntem doar un service auto — suntem partenerul pe care te bazezi
        de fiecare dată când mașina ta are nevoie de ceva.
      </p>

      <div className="cards">
        {reasons.map((reason) => (
          <div className="card" key={reason.title}>
            <span className="icon-badge">{reason.icon}</span>
            <h3>{reason.title}</h3>
            <p>{reason.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default WhyChooseUs