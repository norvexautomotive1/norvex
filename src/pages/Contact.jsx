import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useSiteSettings } from '../hooks/useSiteSettings'
import '../styles/Contact.scss'

const Contact = () => {
  const [form, setForm] = useState({
    nume: '',
    prenume: '',
    email: '',
    telefon: '',
    esteFirma: false,
    tipFirma: '',
    motiv: 'Întrebare generală',
    mesaj: '',
  })
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const settings = useSiteSettings()

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    const { error } = await supabase.rpc('create_contact_message', {
      p_nume: form.nume,
      p_prenume: form.prenume,
      p_email: form.email,
      p_telefon: form.telefon,
      p_este_firma: form.esteFirma,
      p_tip_firma: form.tipFirma,
      p_motiv: form.motiv,
      p_mesaj: form.mesaj,
    })

    if (error) {
      console.error('Contact form error:', error)
      setStatus('error')
      setErrorMessage('Mesajul nu a putut fi trimis. Încearcă din nou.')
      return
    }

    setStatus('success')
    setForm({
      nume: '',
      prenume: '',
      email: '',
      telefon: '',
      esteFirma: false,
      tipFirma: '',
      motiv: 'Întrebare generală',
      mesaj: '',
    })
  }

  return (
    <main className="contact-page">
      <div className="contact-heading">
        <div className="eyebrow">Contact</div>
        <h1>Hai să vorbim despre mașina ta</h1>
        <p>
          Ai o întrebare despre servicii, o programare sau un proiect pentru
          flotă? Trimite-ne un mesaj și revenim cât mai repede.
        </p>
      </div>

      <div className="contact-layout">
        <section className="contact-details">
          <div className="detail-block">
            <span className="detail-label">Telefon</span>
            <a href={`tel:${settings.phone_primary}`}>{settings.phone_primary}</a>
          </div>
          <div className="detail-block">
            <span className="detail-label">Email</span>
            <a href={`mailto:${settings.email_primary}`}>{settings.email_primary}</a>
          </div>
          <div className="detail-block">
            <span className="detail-label">Program</span>
            <span>{settings.opening_hours}</span>
          </div>
          <div className="detail-block">
            <span className="detail-label">Locație</span>
            <span>Norvex Automotive</span>
            <span>{settings.address}</span>
          </div>
        </section>

        <section className="contact-card">
          <form onSubmit={handleSubmit}>
            <div className="contact-field-row">
              <label>
                Nume
                <input
                  type="text"
                  value={form.nume}
                  onChange={(event) => updateField('nume', event.target.value)}
                  required
                />
              </label>
              <label>
                Prenume
                <input
                  type="text"
                  value={form.prenume}
                  onChange={(event) =>
                    updateField('prenume', event.target.value)
                  }
                  required
                />
              </label>
            </div>

            <div className="contact-field-row">
              <label>
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  required
                />
              </label>
              <label>
                Telefon
                <input
                  type="tel"
                  value={form.telefon}
                  onChange={(event) =>
                    updateField('telefon', event.target.value)
                  }
                  required
                />
              </label>
            </div>

            <label>
              Motivul mesajului
              <select
                value={form.motiv}
                onChange={(event) => updateField('motiv', event.target.value)}
              >
                <option>Întrebare generală</option>
                <option>Servicii și tarife</option>
                <option>Programare pentru service</option>
                <option>Colaborare flotă</option>
                <option>Feedback</option>
              </select>
            </label>

            <label className="company-check">
              <input
                type="checkbox"
                checked={form.esteFirma}
                onChange={(event) =>
                  updateField('esteFirma', event.target.checked)
                }
              />
              Reprezint o firmă
            </label>

            {form.esteFirma && (
              <label>
                Tipul firmei
                <select
                  value={form.tipFirma}
                  onChange={(event) =>
                    updateField('tipFirma', event.target.value)
                  }
                  required
                >
                  <option value="">Selectează tipul firmei</option>
                  <option value="Service auto">Service auto</option>
                  <option value="Flotă auto">Flotă auto</option>
                  <option value="Dealer auto">Dealer auto</option>
                  <option value="Rent-a-car">Rent-a-car</option>
                  <option value="Firmă de transport">Firmă de transport</option>
                  <option value="Alt tip">Alt tip</option>
                </select>
              </label>
            )}

            <label>
              Mesaj
              <textarea
                rows="6"
                value={form.mesaj}
                onChange={(event) => updateField('mesaj', event.target.value)}
                required
              />
            </label>

            <button type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Se trimite...' : 'Trimite mesajul'}
            </button>

            {status === 'success' && (
              <p className="contact-status success">
                Mesajul a fost trimis. Îți mulțumim!
              </p>
            )}
            {status === 'error' && (
              <p className="contact-status error">{errorMessage}</p>
            )}
          </form>
        </section>
      </div>
    </main>
  )
}

export default Contact