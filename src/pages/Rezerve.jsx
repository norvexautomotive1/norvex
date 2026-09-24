import React, { useEffect, useMemo, useState } from 'react'
import emailjs from '@emailjs/browser'
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

const LUNI = [
  'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
  'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie',
]
const ZILE_SCURT = ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ', 'Du']
const ZILE_LUNGI = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă', 'Duminică']

// Codul de eroare pe care îl aruncă trigger-ul din baza de date când
// cineva a luat între timp slotul ales (vezi programari_migration.sql)
const COD_SLOT_OCUPAT = 'NX001'

/* ---------- Helpers de dată/oră ----------
   Nu folosim toISOString(): convertește în UTC și poate muta ziua
   cu o zi în urmă. Formatăm manual, în ora locală. */
const pad = (n) => String(n).padStart(2, '0')
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
// 1 = luni ... 7 = duminică (la fel ca în baza de date)
const isoDow = (d) => (d.getDay() === 0 ? 7 : d.getDay())
const fmtOra = (t) => t.slice(0, 5)

const getEmailClientUrl = (emailAddress) => {
  const domain = emailAddress.split('@')[1]?.toLowerCase()

  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    return 'https://mail.google.com/mail/u/0/#inbox'
  }

  if (domain === 'outlook.com' || domain === 'hotmail.com' || domain === 'live.com') {
    return 'https://outlook.live.com/mail/0/inbox'
  }

  if (domain === 'yahoo.com' || domain === 'yahoo.ro') {
    return 'https://mail.yahoo.com/'
  }

  if (domain === 'icloud.com' || domain === 'me.com' || domain === 'mac.com') {
    return 'https://www.icloud.com/mail'
  }

  return `mailto:${emailAddress}`
}

const formatDataLunga = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return `${ZILE_LUNGI[isoDow(date) - 1]}, ${d} ${LUNI[m - 1].toLowerCase()}`
}

/* ---------- Iconițe ---------- */
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

const ChevronIcon = ({ direction }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    style={{ transform: direction === 'left' ? 'rotate(180deg)' : 'none' }}
  >
    <path d="m9 6 6 6-6 6" />
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

/* ---------- Calendar ----------
   Zilele nedisponibile (trecut, închis, sărbătoare, prea departe în viitor)
   sunt dezactivate direct aici, după programul din baza de date.
   Zilele complet ocupate se văd după ce alegi ziua (nu mai sunt ore libere). */
const ZiCalendar = ({ program, zileInchise, maxData, value, onChange }) => {
  const azi = useMemo(() => startOfDay(new Date()), [])
  const [luna, setLuna] = useState(() => new Date(azi.getFullYear(), azi.getMonth(), 1))

  const primaLunaPosibila = new Date(azi.getFullYear(), azi.getMonth(), 1)
  const ultimaLunaPosibila = new Date(maxData.getFullYear(), maxData.getMonth(), 1)
  const poateInapoi = luna > primaLunaPosibila
  const poateInainte = luna < ultimaLunaPosibila

  const schimbaLuna = (delta) =>
    setLuna(new Date(luna.getFullYear(), luna.getMonth() + delta, 1))

  const celule = []
  for (let i = 1; i < isoDow(luna); i++) celule.push(null)
  const nrZile = new Date(luna.getFullYear(), luna.getMonth() + 1, 0).getDate()
  for (let d = 1; d <= nrZile; d++) {
    celule.push(new Date(luna.getFullYear(), luna.getMonth(), d))
  }

  return (
    <div className="calendar">
      <div className="cal-header">
        <button
          type="button"
          className="cal-nav"
          onClick={() => schimbaLuna(-1)}
          disabled={!poateInapoi}
          aria-label="Luna precedentă"
        >
          <ChevronIcon direction="left" />
        </button>
        <div className="cal-title" aria-live="polite">
          {LUNI[luna.getMonth()]} {luna.getFullYear()}
        </div>
        <button
          type="button"
          className="cal-nav"
          onClick={() => schimbaLuna(1)}
          disabled={!poateInainte}
          aria-label="Luna următoare"
        >
          <ChevronIcon direction="right" />
        </button>
      </div>

      <div className="cal-weekdays" aria-hidden="true">
        {ZILE_SCURT.map((z) => (
          <span key={z}>{z}</span>
        ))}
      </div>

      <div className="cal-grid">
        {celule.map((data, i) => {
          if (!data) return <span key={`gol-${i}`} className="cal-empty" />

          const iso = toISO(data)
          const inchisa = !program[isoDow(data)]?.deschis || zileInchise.has(iso)
          const dezactivata = data < azi || data > maxData || inchisa
          const selectata = iso === value
          const esteAzi = data.getTime() === azi.getTime()

          return (
            <button
              key={iso}
              type="button"
              className={`cal-day${selectata ? ' selected' : ''}${esteAzi ? ' today' : ''}`}
              disabled={dezactivata}
              aria-pressed={selectata}
              aria-label={formatDataLunga(iso)}
              title={
                zileInchise.get(iso) || (inchisa && data >= azi ? 'Închis' : undefined)
              }
              onClick={() => onChange(iso)}
            >
              {data.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ---------- Selector de ore ---------- */
const SelectorOra = ({ data, sloturi, loading, error, value, onChange, onRetry }) => {
  if (!data) {
    return <p className="slots-hint">Alege o zi ca să vezi orele libere.</p>
  }

  if (loading) {
    return (
      <div className="slots-grid" aria-busy="true" aria-label="Se încarcă orele">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="slot skeleton" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <p className="slots-hint error">
        {error}{' '}
        <button type="button" className="link-btn" onClick={onRetry}>
          Reîncearcă
        </button>
      </p>
    )
  }

  if (sloturi.every((s) => s.locuri_libere === 0)) {
    return (
      <p className="slots-hint">
        Nu mai sunt ore libere în ziua aleasă. Încearcă altă zi.
      </p>
    )
  }

  const grupuri = [
    { titlu: 'Dimineața', items: sloturi.filter((s) => s.slot < '12:00:00') },
    { titlu: 'După-amiaza', items: sloturi.filter((s) => s.slot >= '12:00:00') },
  ].filter((g) => g.items.length > 0)

  return (
    <div className="slots" key={data}>
      {grupuri.map((grup) => (
        <div key={grup.titlu} className="slots-group">
          {grupuri.length > 1 && <div className="slots-group-title">{grup.titlu}</div>}
          <div className="slots-grid">
            {grup.items.map((s) => (
              <button
                key={s.slot}
                type="button"
                className={`slot${s.slot === value ? ' selected' : ''}`}
                disabled={s.locuri_libere === 0}
                aria-pressed={s.slot === value}
                onClick={() => onChange(s.slot)}
              >
                {fmtOra(s.slot)}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const Rezerve = () => {
  const [services, setServices] = useState([])
  const [program, setProgram] = useState({}) // { 1: {deschis, ora_start, ora_end}, ... 7: ... }
  const [zileInchise, setZileInchise] = useState(new Map()) // 'YYYY-MM-DD' -> motiv
  const [capacitate, setCapacitate] = useState({}) // { Vulcanizare: {zile_maxim, ...} }
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

  const [dataProgramare, setDataProgramare] = useState('') // 'YYYY-MM-DD'
  const [oraProgramare, setOraProgramare] = useState('') // 'HH:MM:SS'
  const [sloturi, setSloturi] = useState([])
  const [loadingSloturi, setLoadingSloturi] = useState(false)
  const [slotError, setSlotError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState('')
  const [successText, setSuccessText] = useState('')
  const [successEmail, setSuccessEmail] = useState('')

  // Servicii + program + zile închise + capacitate, într-un singur val
  useEffect(() => {
    const fetchAll = async () => {
      setLoadingServices(true)
      setLoadError('')

      const [servicesRes, programRes, inchiseRes, capRes] = await Promise.all([
        supabase
          .from('servicii_norvex')
          .select('*')
          .order('ordine', { ascending: true })
          .order('created_at', { ascending: true }),
        supabase.from('program_norvex').select('*'),
        supabase
          .from('zile_inchise_norvex')
          .select('data, motiv')
          .gte('data', toISO(new Date())),
        supabase.from('capacitate_norvex').select('*'),
      ])

      const firstError =
        servicesRes.error || programRes.error || inchiseRes.error || capRes.error

      if (firstError) {
        setLoadError(firstError.message)
        setLoadingServices(false)
        return
      }

      setServices(servicesRes.data)
      setProgram(Object.fromEntries(programRes.data.map((p) => [p.zi_saptamana, p])))
      setZileInchise(new Map(inchiseRes.data.map((z) => [z.data, z.motiv])))
      setCapacitate(Object.fromEntries(capRes.data.map((c) => [c.categorie, c])))
      setLoadingServices(false)
    }

    fetchAll()
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

  // Orele libere pentru ziua + categoria aleasă. Se reîncarcă la orice
  // schimbare și după o rezervare/eroare (refreshKey). Orice ora aleasă
  // se resetează, pentru că sloturile diferă între categorii.
  useEffect(() => {
    setOraProgramare('')

    if (!dataProgramare) {
      setSloturi([])
      setSlotError('')
      return undefined
    }

    let cancelled = false

    const loadSloturi = async () => {
      setLoadingSloturi(true)
      setSlotError('')

      const { data, error } = await supabase.rpc('get_sloturi_libere', {
        p_categorie: categorieServiciu,
        p_data: dataProgramare,
      })

      if (cancelled) return // răspuns vechi, utilizatorul a schimbat între timp ziua

      if (error) {
        setSloturi([])
        setSlotError('Nu am putut încărca orele.')
      } else {
        setSloturi(data ?? [])
      }
      setLoadingSloturi(false)
    }

    loadSloturi()

    return () => {
      cancelled = true
    }
  }, [dataProgramare, categorieServiciu, refreshKey])

  const maxZile = capacitate[categorieServiciu]?.zile_maxim ?? 60
  const maxData = useMemo(() => {
    const d = startOfDay(new Date())
    d.setDate(d.getDate() + maxZile)
    return d
  }, [maxZile])

  const claseField = CLASE_VEHICUL.find((c) => c.label === claseVehicul)?.field
  const pachetSelectat = pacheteDisponibile.find((p) => p.id === pachetId)
  const pretAfisat = getPriceLabel(pachetSelectat, claseField)

  const programareText = dataProgramare
    ? `${formatDataLunga(dataProgramare)}${oraProgramare ? `, ora ${fmtOra(oraProgramare)}` : ''}`
    : ''

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!pachetSelectat) {
      setStatus('error')
      setErrorMessage('Selectează un pachet valid.')
      return
    }

    if (!dataProgramare || !oraProgramare) {
      setStatus('error')
      setErrorMessage('Alege data și ora programării.')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    const pachetText = `${pachetSelectat.nume_serviciu} — ${pretAfisat}`

    const { data: reservation, error } = await supabase.rpc(
      'create_reservation',
      {
        p_nume: nume,
        p_prenume: prenume,
        p_telefon: telefon,
        p_email: email,
        p_tip_masina: claseVehicul,
        p_numar_masina: numarMasina,
        p_categorie_serviciu: categorieServiciu,
        p_pachet_selectat: pachetText,
        p_data_programare: dataProgramare,
        p_ora_programare: oraProgramare,
      }
    )

    if (error) {
      setStatus('error')
      setErrorMessage(error.message)
      // Slotul a fost luat de altcineva între timp: arată orele reale
      if (error.code === COD_SLOT_OCUPAT) setRefreshKey((k) => k + 1)
      return
    }

    if (!reservation?.id) {
      setStatus('error')
      setErrorMessage('Rezervarea a fost creată, dar ID-ul nu a fost returnat.')
      return
    }

    const emailjsServiceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
    const emailjsTemplateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
    const emailjsPublicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

    if (!emailjsServiceId || !emailjsTemplateId || !emailjsPublicKey) {
      setStatus('error')
      setErrorMessage('EmailJS nu este configurat complet.')
      setRefreshKey((k) => k + 1)
      return
    }

    try {
      await emailjs.send(
        emailjsServiceId,
        emailjsTemplateId,
        {
          to_email: email,
          to_name: `${prenume} ${nume}`,
          appointment_date: formatDataLunga(dataProgramare),
          appointment_time: fmtOra(oraProgramare),
          phone: telefon,
          vehicle: claseVehicul,
          plate: numarMasina,
          category: categorieServiciu,
          package_name: pachetText,
        },
        { publicKey: emailjsPublicKey }
      )
    } catch (emailError) {
      console.error('EmailJS send error:', emailError)
      setStatus('error')
      setErrorMessage(
        'Rezervarea a fost salvată, dar emailul cu detaliile nu a putut fi trimis.'
      )
      setRefreshKey((k) => k + 1)
      return
    }

    setStatus('success')
    setSuccessText(programareText)
    setSuccessEmail(email)
    setNume('')
    setPrenume('')
    setTelefon('')
    setEmail('')
    setNumarMasina('')
    setClaseVehicul(CLASE_VEHICUL[0].label)
    setCategorieServiciu('Vulcanizare')
    setDataProgramare('')
    setOraProgramare('')
  }

  return (
    <section className="rezerve-page">
      <div className="eyebrow">Programare</div>
      <h1>Rezervă acum</h1>
      <p className="intro">
        Alege ziua și ora care ți se potrivesc. Rezervarea este înregistrată pe
        loc, iar detaliile ajung pe email.
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

            <div className="field" role="group" aria-labelledby="lbl-programare">
              <label id="lbl-programare">Data și ora programării</label>
              <div className="scheduler">
                <ZiCalendar
                  program={program}
                  zileInchise={zileInchise}
                  maxData={maxData}
                  value={dataProgramare}
                  onChange={setDataProgramare}
                />
                <div className="scheduler-slots">
                  <SelectorOra
                    data={dataProgramare}
                    sloturi={sloturi}
                    loading={loadingSloturi}
                    error={slotError}
                    value={oraProgramare}
                    onChange={setOraProgramare}
                    onRetry={() => setRefreshKey((k) => k + 1)}
                  />
                </div>
              </div>
            </div>

            {(pachetSelectat || dataProgramare) && (
              <div className="booking-summary">
                {pachetSelectat && (
                  <div className="summary-row">
                    <span>Preț selectat</span>
                    <b>{pretAfisat}</b>
                  </div>
                )}
                {dataProgramare && (
                  <div className="summary-row">
                    <span>Programare</span>
                    <b>{programareText}</b>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              className="submit-button"
              disabled={
                status === 'loading' || !pachetSelectat || !dataProgramare || !oraProgramare
              }
            >
              {status === 'loading' ? 'Se trimite...' : 'Trimite rezervarea'}
            </button>

            <div className="trust-note">
              <InfoIcon />
              Nu e nevoie de plată online. Te așteptăm la service la ora rezervată!
            </div>

            {status === 'success' && (
              <div className="status-banner success">
                <CheckIcon />
                Rezervarea ta este înregistrată pentru {successText}. Ți-am trimis un
                email cu detaliile.
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

      {status === 'success' && (
        <div className="success-modal-backdrop" role="presentation">
          <div
            className="success-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reservation-success-title"
          >
            <button
              type="button"
              className="success-modal-close"
              aria-label="Închide confirmarea"
              onClick={() => setStatus('idle')}
            >
              ×
            </button>

            <div className="success-modal-icon">
              <CheckIcon />
            </div>
            <span className="success-modal-eyebrow">Totul este pregătit</span>
            <h2 id="reservation-success-title">Rezervarea a fost confirmată</h2>
            <p>
              Programarea ta este înregistrată pentru <strong>{successText}</strong>.
              Ți-am trimis toate detaliile pe emailul <strong>{successEmail}</strong>.
            </p>

            <div className="success-modal-actions">
              <a
                className="success-modal-email"
                href={getEmailClientUrl(successEmail)}
                target="_blank"
                rel="noreferrer"
              >
                Deschide emailul
              </a>
              <button
                type="button"
                className="success-modal-secondary"
                onClick={() => setStatus('idle')}
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Rezerve
