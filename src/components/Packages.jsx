import React, { useRef, useState } from 'react'
import '../styles/Packages.scss'

const vulcanizareItems = [
  { name: 'Montaj / demontat roată', price: '20 lei' },
  { name: 'Montaj / demontat anvelopă', price: '25 lei' },
  { name: 'Echilibrat roată', price: '25 lei' },
  { name: 'Pană / reparație anvelopă', price: '35 lei' },
  { name: 'Valvă', price: '15 lei' },
  { name: 'Schimb 4 roți + echilibrat', price: '105 lei' },
  { name: 'Schimb anvelope + echilibrat', price: '165 lei' },
]

const detailingItems = [
  { name: 'Interior simplu', price: '250 lei', note: 'Spălătorie tradițională, fără tapițerie' },
  { name: 'Șamponare tapițerie', price: '350 lei' },
  { name: 'Interior complet', price: '500 lei' },
  { name: 'Polisare faruri', price: '250 lei' },
  { name: 'Polish caroserie', price: 'PE DEVIZ', quote: true },
  { name: 'Pachet complet', price: '990 lei', note: 'Interior + exterior + faruri' },
]

const VulcanizareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />
    <path d="M12 3.5v3M12 17.5v3M20.5 12h-3M6.5 12h-3M17.7 6.3l-2.1 2.1M8.4 15.6l-2.1 2.1M17.7 17.7l-2.1-2.1M8.4 8.4L6.3 6.3" />
  </svg>
)

const DetailingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M6 14c1.5-4 4-7 8-9.5-1 3-1 5.5 0 8 1.5-1 3-1.5 4.5-1-2 3-5 5.5-8.5 6.5-1.5.4-3 .6-4 0-1.2-.7-1-2.5 0-4z" />
    <path d="M5 19l2.5-2.5" />
  </svg>
)

const InfoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16h.01" />
  </svg>
)

const ItemRow = ({ item }) => (
  <li className={item.note ? 'item-note-wrap' : 'item-row'}>
    {item.note ? (
      <>
        <div className="item-row item-row--tight">
          <span className="item-name">{item.name}</span>
          <span className="item-leader" />
          <span className="item-price">{item.price}</span>
        </div>
        <span className="item-note">{item.note}</span>
      </>
    ) : (
      <>
        <span className="item-name">{item.name}</span>
        <span className="item-leader" />
        <span className={`item-price ${item.quote ? 'quote' : ''}`}>{item.price}</span>
      </>
    )}
  </li>
)

const Packages = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const viewportRef = useRef(null)
  const startXRef = useRef(0)

  const goTo = (index) => {
    setActiveIndex(index)
    setDragOffset(0)
  }

  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX
    setIsDragging(true)
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return
    const delta = e.touches[0].clientX - startXRef.current
    setDragOffset(delta)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    const width = viewportRef.current?.offsetWidth || 1
    const threshold = width * 0.18

    if (dragOffset < -threshold && activeIndex === 0) {
      goTo(1)
    } else if (dragOffset > threshold && activeIndex === 1) {
      goTo(0)
    } else {
      setDragOffset(0)
    }
  }

  const width = viewportRef.current?.offsetWidth || 1
  const dragPercent = (dragOffset / width) * 50
  const baseTranslate = -activeIndex * 50
  const trackStyle = {
    transform: `translateX(${baseTranslate + dragPercent}%)`,
    transition: isDragging ? 'none' : 'transform 0.45s cubic-bezier(0.65, 0, 0.35, 1)',
  }

  return (
    <section className="packages-section" id="packages-section"> 
      <div className="eyebrow">Tarife</div>
      <h2>Pachetele noastre</h2>
      <p className="intro">
        Prețuri clare, fără surprize. Alege serviciul de care ai nevoie sau
        combină-le pentru un rezultat complet.
      </p>

      <div className="package-card">
        <div className="tabs">
          <button
            type="button"
            className={`tab ${activeIndex === 0 ? 'active' : ''}`}
            onClick={() => goTo(0)}
          >
            <VulcanizareIcon />
            Vulcanizare
          </button>
          <button
            type="button"
            className={`tab ${activeIndex === 1 ? 'active' : ''}`}
            onClick={() => goTo(1)}
          >
            <DetailingIcon />
            Detailing
          </button>
          <span className={`tab-indicator ${activeIndex === 1 ? 'pos-1' : ''}`} />
        </div>

        <div
          className="slider-viewport"
          ref={viewportRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="slider-track" style={trackStyle}>
            <div className="panel">
              <ul className="item-list">
                {vulcanizareItems.map((item) => (
                  <ItemRow key={item.name} item={item} />
                ))}
              </ul>
            </div>

            <div className="panel">
              <ul className="item-list">
                {detailingItems.map((item) => (
                  <ItemRow key={item.name} item={item} />
                ))}
              </ul>
              <div className="card-footer-note">
                <InfoIcon />
                Exterior gratuit la rezervări de minimum 200 lei
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="swipe-hint">← Glisează pentru a schimba →</div>
    </section>
  )
}

export default Packages