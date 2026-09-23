import React, { useState } from 'react'
import '../styles/Navbar.scss'
import { NavLink } from 'react-router-dom'
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

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const settings = useSiteSettings()

  const navItems = [
    { to: '/', label: 'Casa' },
    { to: '/rezerve', label: 'Rezerva' },
    { to: '/about', label: 'Despre' },
    { to: '/contact', label: 'Contact' },
  ]

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="navbar-shell">
      <nav className="navbar" aria-label="Main navigation">
        <div className="brand" aria-label="Norvex Automotives home">
          <span className="brand-mark">
            <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M100,20 L164,48 V104 C164,144 136,172 100,184 C64,172 36,144 36,104 V48 Z"
                fill="none"
                stroke="#c8a24d"
                strokeWidth="4"
              />
              <path
                d="M100,34 L152,57 V104 C152,137 129,160 100,171 C71,160 48,137 48,104 V57 Z"
                fill="none"
                stroke="rgba(200,162,77,0.3)"
                strokeWidth="1"
              />
              <text
                x="100"
                y="126"
                textAnchor="middle"
                fontFamily="'Cormorant Garamond', Georgia, serif"
                fontSize="82"
                fontWeight="600"
                fill="#e2bf6f"
              >
                N
              </text>
              <path
                d="M100,148 C104,155 112,158 118,155 C114,162 105,165 98,160 Z"
                fill="#e2bf6f"
                opacity="0.85"
              />
            </svg>
          </span>
          <span className="brand-text">
            <span className="line1">Norvex</span>
            <span className="line2">Automotive</span>
          </span>
        </div>

        <div className="nav-links nav-links--desktop">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}>
              {item.label}
            </NavLink>
          ))}
        </div>

        <button
          type="button"
          className={`menu-toggle ${menuOpen ? 'open' : ''}`}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      <div
        className={`backdrop ${menuOpen ? 'open' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <aside className={`drawer ${menuOpen ? 'open' : ''}`} aria-label="Mobile navigation">
        <div className="nav-links">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={closeMenu}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className="mobile-social">
          <span className="mobile-social-label">Urmărește-ne</span>
          <div className="mobile-social-row">
          {[
            ['instagram_url', 'Instagram', <InstagramIcon key="instagram" />],
            ['tiktok_url', 'TikTok', <TikTokIcon key="tiktok" />],
            ['facebook_url', 'Facebook', <FacebookIcon key="facebook" />],
          ].map(([key, label, icon]) => (
            settings[key] ? (
              <a
                key={key}
                href={settings[key]}
                className="mobile-social-icon"
                aria-label={label}
                target="_blank"
                rel="noreferrer"
              >
                {icon}
              </a>
            ) : null
          ))}
          </div>
        </div>
      </aside>
    </header>
  )
}

export default Navbar