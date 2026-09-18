import React, { useState } from 'react'
import '../styles/Navbar.scss'
import { NavLink } from 'react-router-dom'

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)

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
            <span className="line2">Automotives</span>
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
      </aside>
    </header>
  )
}

export default Navbar