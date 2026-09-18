import React from 'react'
import '../styles/LastCta.scss'
import { Link } from 'react-router-dom'
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.4 2.1L8 9.9a16 16 0 0 0 6 6l1.4-1.4a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.8 2.2z" />
  </svg>
)

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.9L5.7 21l1.7-7L2 9.2l7.1-.6z" />
  </svg>
)

const LastCta = () => {
  return (
    <section className="last-cta">
      <div className="eyebrow">Nu amâna</div>

      <h2>
        Mașina ta merită <span className="accent">grijă</span>, nu doar reparații
      </h2>

      <p className="subtext">
        Programează-te acum pentru vulcanizare sau detailing și lasă-ne pe noi
        să avem grijă de restul. Locurile se ocupă rapid, mai ales în weekend.
      </p>

      <div className="cta-row">
        <Link to="/rezerve" className="cta-button">
            Rezervă acum
          </Link>
        <a href="tel:+40700000000" className="cta-phone">
          <PhoneIcon />
          +40 700 000 000
        </a>
      </div>

      <div className="trust-row">
        <span className="stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon key={i} />
          ))}
        </span>
        4.9 din peste 200 de clienți mulțumiți
      </div>
    </section>
  )
}

export default LastCta