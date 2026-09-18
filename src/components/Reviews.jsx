import React from 'react'
import '../styles/Reviews.scss'

const reviews = [
  {
    initials: 'AC',
    name: 'Andrei Cristian',
    role: 'Client',
    text:
      'Am fost foarte mulțumit de serviciile oferite de Norvex. Echipa a fost profesionistă și atentă la detalii, iar mașina mea arată impecabil după detailing. Recomand cu încredere!',
  },
  {
    initials: 'MP',
    name: 'Mihai Popescu',
    role: 'Client',
    text:
      'Am mers pentru o vulcanizare rapidă și am rămas plăcut surprins de promptitudine. Prețuri corecte, echipă serioasă. Am găsit service-ul meu de bază pentru anvelope.',
  },
  {
    initials: 'IR',
    name: 'Ioana Radu',
    role: 'Client',
    text:
      'Am dus mașina pentru pachetul complet și a ieșit ca nouă. Atenția la detalii pe interior chiar se vede. Merită fiecare leu, revin sigur.',
  },
]

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.9L5.7 21l1.7-7L2 9.2l7.1-.6z" />
  </svg>
)

const Reviews = () => {
  return (
    <section className="reviews-section">
      <div className="eyebrow">Testimoniale</div>
      <h2>Ce spun clienții noștri</h2>
      <p className="intro">
        Nu te baza doar pe cuvintele noastre — iată ce spun cei care ne-au
        încredințat mașina.
      </p>

      <div className="cards">
        {reviews.map((review) => (
          <div className="card" key={review.name}>
            <div className="quote-mark">&rdquo;</div>
            <div className="stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} />
              ))}
            </div>
            <p className="review-text">{review.text}</p>
            <div className="reviewer">
              <span className="avatar">{review.initials}</span>
              <div className="reviewer-info">
                <h3>{review.name}</h3>
                <p>{review.role.toUpperCase()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Reviews