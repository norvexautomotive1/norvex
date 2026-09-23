import React from 'react'
import '../styles/Footer.scss'
import { useSiteSettings } from '../hooks/useSiteSettings'

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
  </svg>
)

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M14.5 3c.3 1.9 1.6 3.4 3.5 3.7v2.6c-1.3 0-2.5-.4-3.5-1.1v5.9a5 5 0 1 1-5-5c.2 0 .4 0 .6.1v2.7a2.3 2.3 0 1 0 1.9 2.3V3h2.5z" />
  </svg>
)

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M15 8.5h-2A1.5 1.5 0 0 0 11.5 10v2H15l-.5 3h-3V21h-3v-6H6v-3h2.5v-2.3C8.5 7 10 5.5 12.5 5.5H15v3z" />
  </svg>
)

const Footer = () => {
  const year = new Date().getFullYear()
  const settings = useSiteSettings()

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="brand">
            <span className="icon-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M12 3c-1.5 0-2.5 1.1-2.5 2.6 0 .9.4 1.6 1 2.1-1.8.5-3 1.9-3 4v1h9v-1c0-2.1-1.2-3.5-3-4 .6-.5 1-1.2 1-2.1C14.5 4.1 13.5 3 12 3z" />
                <path d="M6 21v-3c0-1.7 1.3-3 3-3h6c1.7 0 3 1.3 3 3v3" />
              </svg>
            </span>
            <span className="brand-text">
              <span className="line1">Norvex</span>
              <span className="line2">Automotives</span>
            </span>
          </div>

          <p className="tagline">
            Vulcanizare și detailing la standard premium. Grijă pentru mașina
            ta, de fiecare dată.
          </p>

          <div className="social-row">
            {settings.instagram_url && (
              <a
                href={settings.instagram_url}
                className="social-icon"
                aria-label="Instagram"
                target="_blank"
                rel="noreferrer"
              >
                <InstagramIcon />
              </a>
            )}
            {settings.tiktok_url && (
              <a
                href={settings.tiktok_url}
                className="social-icon"
                aria-label="TikTok"
                target="_blank"
                rel="noreferrer"
              >
                <TikTokIcon />
              </a>
            )}
            {settings.facebook_url && (
              <a
                href={settings.facebook_url}
                className="social-icon"
                aria-label="Facebook"
                target="_blank"
                rel="noreferrer"
              >
                <FacebookIcon />
              </a>
            )}
          </div>
        </div>

        <div className="footer-col">
          <h4>Navigare</h4>
          <ul>
            <li><a href="/">Acasă</a></li>
            <li><a href="#services-section">Servicii</a></li>
            <li><a href="#packages-section">Tarife</a></li>
            <li><a href="/about">Despre noi</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          <ul>
            <li><span>{settings.address}</span></li>
            <li><a href={`tel:${settings.phone_primary}`}>{settings.phone_primary}</a></li>
            <li><a href={`mailto:${settings.email_primary}`}>{settings.email_primary}</a></li>
            <li><span>{settings.opening_hours}</span></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {year} Norvex Automotives. Toate drepturile rezervate.</p>
        <div className="legal">
          <a href="/termeni">Termeni și condiții</a>
          <a href="/confidentialitate">Politica de confidențialitate</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer