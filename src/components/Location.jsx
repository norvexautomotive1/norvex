import '../styles/Location.scss'

const NORVEX_ADDRESS =
  'Strada Principala Nr 42, Cornu de Sus, Prahova, Romania'
const NORVEX_MAP_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1103.252658229308!2d26.25120579814788!3d44.84108056316571!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40b22f0062fab597%3A0x143c5f4af68d8fac!2sNorvex%20Automotive!5e1!3m2!1sro!2sro!4v1790169867918!5m2!1sro!2sro'

const Location = () => {
  const mapsQuery = import.meta.env.VITE_GOOGLE_MAPS_QUERY || NORVEX_ADDRESS
  const mapsEmbedUrl =
    import.meta.env.VITE_GOOGLE_MAPS_EMBED_URL || NORVEX_MAP_EMBED_URL
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    mapsQuery
  )}`

  return (
    <section className="location" id="location-section">
      <div className="location-shell">
        <div className="location-heading">
          <span className="location-eyebrow">Unde ne găsești</span>
          <h2>Ne vedem la atelier</h2>
          <p>
            Vino cu mașina ta într-un spațiu în care fiecare detaliu contează.
            Te așteptăm pentru servicii auto făcute corect, fără compromisuri.
          </p>
        </div>

        <div className="location-content">
          <div className="location-info">
            <div className="location-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M20 10.4c0 5.3-8 11.1-8 11.1S4 15.7 4 10.4a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10.2" r="2.7" />
              </svg>
            </div>

            <span className="location-label">Norvex Automotive</span>
            <h3>Service auto cu atenție la detalii</h3>
            <p className="location-address">{mapsQuery}</p>

            <div className="location-meta">
              <div>
                <span>Program</span>
                <strong>Luni – Sâmbătă · 09:00 – 19:00</strong>
                <strong>Duminică · Închis</strong>
              </div>
              <div>
                <span>Contact</span>
                <a href="tel:+40700000000">+40 700 000 000</a>
                <a href="mailto:norvexautomotive1@gmail.com">
                  norvexautomotive1@gmail.com
                </a>
              </div>
            </div>

            <a
              className="location-directions"
              href={mapsLink}
              target="_blank"
              rel="noreferrer"
            >
              Deschide în Google Maps
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div className="location-map">
            <div className="map-topline">
              <span>LOCAȚIE</span>
              <span className="map-status">
                <i /> Deschis pentru programări
              </span>
            </div>
            <iframe
              title="Locația Norvex Automotive pe Google Maps"
              src={mapsEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div className="map-corner map-corner-top" />
            <div className="map-corner map-corner-bottom" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Location