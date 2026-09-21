import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Rezerve from './pages/Rezerve'
import Contact from './pages/Contact'
import About from './pages/About'
import Confirmare from './pages/Confirmare'
import Footer from './components/Footer'

const App = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const servicesSection = document.getElementById('services-section')
      if (!servicesSection) {
        setIsVisible(false)
        return
      }

      const sectionTop = servicesSection.offsetTop
      const triggerPoint = sectionTop - 220
      setIsVisible(window.scrollY >= triggerPoint)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rezerve" element={<Rezerve />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/confirmare" element={<Confirmare />} />
          </Routes>
        </main>

        <button
          type="button"
          className={`back-to-top ${isVisible ? 'visible' : ''}`}
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 5v14M5 12l7-7 7 7" />
          </svg>
        </button>

        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App