import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import '../styles/Rezerve.scss'

const PACHETE = {
  Vulcanizare: [
    { label: 'Montaj / demontat roată', price: '20 lei' },
    { label: 'Montaj / demontat anvelopă', price: '25 lei' },
    { label: 'Echilibrat roată', price: '25 lei' },
    { label: 'Pană / reparație anvelopă', price: '35 lei' },
    { label: 'Valvă', price: '15 lei' },
    { label: 'Schimb 4 roți + echilibrat', price: '105 lei' },
    { label: 'Schimb anvelope + echilibrat', price: '165 lei' },
  ],
  Detailing: [
    { label: 'Interior simplu', price: '250 lei' },
    { label: 'Șamponare tapițerie', price: '350 lei' },
    { label: 'Interior complet', price: '500 lei' },
    { label: 'Polisare faruri', price: '250 lei' },
    { label: 'Polish caroserie', price: 'pe deviz' },
    { label: 'Pachet complet', price: '990 lei' },
  ],
}

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

const initialForm = {
  nume: '',
  prenume: '',
  tip_masina: '',
  numar_masina: '',
  categorie_serviciu: 'Vulcanizare',
  pachet_selectat: `${PACHETE.Vulcanizare[0].label} — ${PACHETE.Vulcanizare[0].price}`,
}

const Rezerve = () => {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const selectCategory = (categorie) => {
    const firstPachet = PACHETE[categorie][0]
    setForm((prev) => ({
      ...prev,
      categorie_serviciu: categorie,
      pachet_selectat: `${firstPachet.label} — ${firstPachet.price}`,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    const { error } = await supabase.from('rezervari_norvex').insert([
      {
        nume: form.nume,
        prenume: form.prenume,
        tip_masina: form.tip_masina,
        numar_masina: form.numar_masina,
        categorie_serviciu: form.categorie_serviciu,
        pachet_selectat: form.pachet_selectat,
      },
    ])

    if (error) {
      setStatus('error')
      setErrorMessage(error.message)
      return
    }

    setStatus('success')
    setForm(initialForm)
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
        <form onSubmit={handleSubmit}>
          <div className="field-row">
            <div className="field">
              <label htmlFor="nume">Nume</label>
              <input
                id="nume"
                type="text"
                name="nume"
                placeholder="Popescu"
                value={form.nume}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="prenume">Prenume</label>
              <input
                id="prenume"
                type="text"
                name="prenume"
                placeholder="Andrei"
                value={form.prenume}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="tip_masina">Tip mașină</label>
              <input
                id="tip_masina"
                type="text"
                name="tip_masina"
                placeholder="ex: BMW Seria 3"
                value={form.tip_masina}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="numar_masina">Număr mașină</label>
              <input
                id="numar_masina"
                type="text"
                name="numar_masina"
                placeholder="ex: PH 12 ABC"
                value={form.numar_masina}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="field">
            <label>Categorie serviciu</label>
            <div className="category-toggle">
              <button
                type="button"
                className={`category-btn ${form.categorie_serviciu === 'Vulcanizare' ? 'active' : ''}`}
                onClick={() => selectCategory('Vulcanizare')}
              >
                <VulcanizareIcon />
                Vulcanizare
              </button>
              <button
                type="button"
                className={`category-btn ${form.categorie_serviciu === 'Detailing' ? 'active' : ''}`}
                onClick={() => selectCategory('Detailing')}
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
                name="pachet_selectat"
                value={form.pachet_selectat}
                onChange={handleChange}
              >
                {PACHETE[form.categorie_serviciu].map((pachet) => {
                  const value = `${pachet.label} — ${pachet.price}`
                  return (
                    <option key={pachet.label} value={value}>
                      {value}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>

          <button type="submit" className="submit-button" disabled={status === 'loading'}>
            {status === 'loading' ? 'Se trimite...' : 'Trimite rezervarea'}
          </button>

          <div className="trust-note">
            <InfoIcon />
            Nu e nevoie de plată online — confirmăm telefonic programarea
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
      </div>
    </section>
  )
}

export default Rezerve