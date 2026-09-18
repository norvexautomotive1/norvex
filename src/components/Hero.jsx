import React from 'react'
import { heroImage, heroImageMobile } from '../assets/assets'
import '../styles/Hero.scss'

const Hero = () => {
  const scrollToServices = () => {
    document.getElementById('services-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }

  return (
    <section className="hero-section">
      {/* Full-bleed background image, shown only on mobile */}
      <div className="hero-mobile-bg">
        <img src={heroImageMobile} alt="Norvex Automotives" />
      </div>

      <div className="hero-content">
        <div className="eyebrow">Vulcanizare &amp; Detailing</div>

        <h1>
          Totul pentru <span className="accent">mașina</span> ta
        </h1>
        <h2>Descoperă soluțiile ideale pentru nevoile tale</h2>

        <p className="lede">
          La Norvex, ne dedicăm să oferim soluții complete pentru întreținerea și
          îmbunătățirea mașinii tale. Indiferent dacă ai nevoie de accesorii sau
          servicii specializate, suntem aici pentru a-ți oferi tot ce ai nevoie.
        </p>

        <div className="cta-row">
          <button type="button" className="cta-button">Rezervă acum</button>
          <button type="button" className="cta-secondary" onClick={scrollToServices}>
            Vezi serviciile
          </button>
        </div>
      </div>

      {/* Overlap image below the text, shown only on desktop */}
      <div className="hero-image">
        <img src={heroImage} alt="Norvex Automotives" />
      </div>
    </section>
  )
}

export default Hero