import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import '../styles/Rezerve.scss'

// Clasele astea trebuie să corespundă exact coloanelor de preț din
// servicii_norvex (pret_autoturism / pret_suv / pret_microbuz), pentru
// că de ele depinde ce preț se afișează la Vulcanizare.
const CLASE_VEHICUL = [
  { label: 'Autoturism', field: 'pret_autoturism' },
  { label: 'SUV', field: 'pret_suv' },
  { label: 'Microbuz 8+1', field: 'pret_microbuz' },
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

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

const ErrorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16h.01" />
  </svg>
)

// Preț afișat/trimis pentru un serviciu, în funcție de categorie și clasă
const getPriceLabel = (service, claseField) => {
  if (!service) return ''
  if (service.categorie === 'Detailing') {
    return service.pe_deviz ? 'pe deviz' : `${service.pret_fix} lei`
  }
  const value = service[claseField]
  return value === null || value === undefined ? '—' : `${value} lei`
}

const Rezerve = () => {
  const [services, setServices] = useState([])
  const [loadingServices, setLoadingServices] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [nume, setNume] = useState('')
  const [prenume, setPrenume] = useState('')
  const [telefon, setTelefon] = useState('')
  const [email, setEmail] = useState('')
  const [numarMasina, setNumarMasina] = useState('')
  const [claseVehicul, setClaseVehicul] = useState(CLASE_VEHICUL[0].label)
  const [categorieServiciu, setCategorieServiciu] = useState('Vulcanizare')
  const [pachetId, setPachetId] = useState('')

  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const fetchServices = async () => {
      setLoadingServices(true)
      setLoadError('')

      const { data, error } = await supabase
        .from('servicii_norvex')
        .select('*')
        .order('ordine', { ascending: true })
        .order('created_at', { ascending: true })

      if (error) {
        setLoadError(error.message)
        setLoadingServices(false)
        return
      }

      setServices(data)
      setLoadingServices(false)
    }

    fetchServices()
  }, [])

  const pacheteDisponibile = useMemo(
    () => services.filter((s) => s.categorie === categorieServiciu),
    [services, categorieServiciu]
  )

  // Când se schimbă categoria (sau se încarcă serviciile), selectează
  // automat primul pachet disponibil din noua categorie.
  useEffect(() => {
    if (pacheteDisponibile.length > 0) {
      setPachetId(pacheteDisponibile[0].id)
    } else {
      setPachetId('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorieServiciu, services])

  const claseField = CLASE_VEHICUL.find((c) => c.label === claseVehicul)?.field
  const pachetSelectat = pacheteDisponibile.find((p) => p.id === pachetId)
  const pretAfisat = getPriceLabel(pachetSelectat, claseField)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!pachetSelectat) {
      setStatus('error')
      setErrorMessage('Selectează un pachet valid.')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    const pachetText = `${pachetSelectat.nume_serviciu} — ${pretAfisat}`

    const { data: reservation, error } = await supabase
      .from('rezervari_norvex')
      .insert([
        {
          nume,
          prenume,
          telefon,
          email,
          tip_masina: claseVehicul,
          numar_masina: numarMasina,
          categorie_serviciu: categorieServiciu,
          pachet_selectat: pachetText,
        },
      ])
      .select('id')
      .single()

    if (error) {
      setStatus('error')
      setErrorMessage(error.message)
      return
    }

    const { error: confirmationError } = await supabase.functions.invoke(
      'send-booking-confirmation',
      {
        body: { reservationId: reservation.id },
      }
    )

    if (confirmationError) {
      setStatus('error')
      setErrorMessage(
        'Rezervarea a fost salvată, dar emailul de confirmare nu a putut fi pregătit.'
      )
      return
    }

    setStatus('success')
    setNume('')
    setPrenume('')
    setTelefon('')
    setEmail('')
    setNumarMasina('')
    setClaseVehicul(CLASE_VEHICUL[0].label)
    setCategorieServiciu('Vulcanizare')
  }

  return (
    <section className="rezerve-page">
      <div className="eyebrow">Programare</div>
      <h1>Rezervă acum</h1>
      <p className="intro">
        Completează formularul și te contactăm în cel mai scurt timp pentru
        confirmarea programării.
      </p>

      <div className="form-card">
        {loadingServices && <div className="state-message">Se încarcă serviciile...</div>}
        {!loadingServices && loadError && (
          <div className="state-message error">Nu am putut încărca lista de servicii.</div>
        )}

        {!loadingServices && !loadError && (
          <form onSubmit={handleSubmit}>
            <div className="field-row">
              <div className="field">
                <label htmlFor="nume">Nume</label>
                <input
                  id="nume"
                  type="text"
                  placeholder="Popescu"
                  value={nume}
                  onChange={(e) => setNume(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="prenume">Prenume</label>
                <input
                  id="prenume"
                  type="text"
                  placeholder="Andrei"
                  value={prenume}
                  onChange={(e) => setPrenume(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="telefon">Număr de telefon</label>
                <input
                  id="telefon"
                  type="tel"
                  placeholder="07XX XXX XXX"
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="nume@exemplu.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="clasa_vehicul">Clasă vehicul</label>
                <div className="select-wrap">
                  <select
                    id="clasa_vehicul"
                    value={claseVehicul}
                    onChange={(e) => setClaseVehicul(e.target.value)}
                  >
                    {CLASE_VEHICUL.map((clasa) => (
                      <option key={clasa.label} value={clasa.label}>
                        {clasa.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field">
                <label htmlFor="numar_masina">Număr mașină</label>
                <input
                  id="numar_masina"
                  type="text"
                  placeholder="ex: PH 12 ABC"
                  value={numarMasina}
                  onChange={(e) => setNumarMasina(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label>Categorie serviciu</label>
              <div className="category-toggle">
                <button
                  type="button"
                  className={`category-btn ${categorieServiciu === 'Vulcanizare' ? 'active' : ''}`}
                  onClick={() => setCategorieServiciu('Vulcanizare')}
                >
                  <VulcanizareIcon />
                  Vulcanizare
                </button>
                <button
                  type="button"
                  className={`category-btn ${categorieServiciu === 'Detailing' ? 'active' : ''}`}
                  onClick={() => setCategorieServiciu('Detailing')}
                >
                  <DetailingIcon />
                  Detailing
                </button>
              </div>
            </div>

            <div className="field">
              <label htmlFor="pachet_selectat">Pachet</label>
              <div className="select-wrap">
                <select
                  id="pachet_selectat"
                  value={pachetId}
                  onChange={(e) => setPachetId(e.target.value)}
                  disabled={pacheteDisponibile.length === 0}
                >
                  {pacheteDisponibile.length === 0 && (
                    <option value="">Niciun pachet disponibil</option>
                  )}
                  {pacheteDisponibile.map((pachet) => (
                    <option key={pachet.id} value={pachet.id}>
                      {pachet.nume_serviciu}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {pachetSelectat && (
              <div className="price-preview">
                Preț selectat: <b>{pretAfisat}</b>
              </div>
            )}

            <button
              type="submit"
              className="submit-button"
              disabled={status === 'loading' || !pachetSelectat}
            >
              {status === 'loading' ? 'Se trimite...' : 'Trimite rezervarea'}
            </button>

            <div className="trust-note">
              <InfoIcon />
              Nu e nevoie de plată online — confirmăm prin email programarea!
            </div>

            {status === 'success' && (
              <div className="status-banner success">
                <CheckIcon />
                Rezervarea a fost trimisă. Te contactăm în curând!
              </div>
            )}

            {status === 'error' && (
              <div className="status-banner error">
                <ErrorIcon />
                A apărut o eroare: {errorMessage}
              </div>
            )}
          </form>
        )}
      </div>
    </section>
  )
}

export default Rezerve