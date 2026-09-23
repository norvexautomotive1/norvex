import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import '../styles/AdminRezervari.scss'

const RESERVATION_COLUMNS = `
  id,
  created_at,
  nume,
  prenume,
  telefon,
  email,
  tip_masina,
  numar_masina,
  categorie_serviciu,
  pachet_selectat,
  data_programare,
  ora_programare
`

const parseLocalDate = (value) => {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

const formatDate = (value) => {
  const date = parseLocalDate(value)
  return date
    ? date.toLocaleDateString('ro-RO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '—'
}

const formatTime = (value) => (value ? value.slice(0, 5) : '—')

const AdminRezervari = () => {
  const [reservations, setReservations] = useState([])
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const fetchReservations = useCallback(async () => {
    setLoading(true)
    setError('')

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession()

    if (sessionError) {
      setSession(null)
      setReservations([])
      setError('Nu am putut verifica sesiunea de administrare.')
      setLoading(false)
      return
    }

    if (!sessionData.session) {
      setSession(null)
      setReservations([])
      setError('Trebuie să fii autentificat pentru a vedea rezervările.')
      setLoading(false)
      return
    }

    setSession(sessionData.session)

    const { data, error: reservationsError } = await supabase
      .from('rezervari_norvex')
      .select(RESERVATION_COLUMNS)
      .order('data_programare', { ascending: true, nullsFirst: false })
      .order('ora_programare', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (reservationsError) {
      setReservations([])
      setError(reservationsError.message)
    } else {
      setReservations(data ?? [])
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchReservations()
  }, [fetchReservations])

  const updateReservation = async (reservation) => {
    setSavingId(reservation.id)
    setError('')

    const { error: updateError } = await supabase
      .from('rezervari_norvex')
      .update({
        data_programare: reservation.data_programare,
        ora_programare: reservation.ora_programare,
      })
      .eq('id', reservation.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      await fetchReservations()
    }

    setSavingId(null)
  }

  const deleteReservation = async (reservation) => {
    if (
      !window.confirm(
        `Ștergi rezervarea pentru ${reservation.prenume} ${reservation.nume}?`
      )
    ) {
      return
    }

    setDeletingId(reservation.id)
    setError('')

    const { error: deleteError } = await supabase
      .from('rezervari_norvex')
      .delete()
      .eq('id', reservation.id)

    if (deleteError) {
      setError(deleteError.message)
    } else {
      await fetchReservations()
    }

    setDeletingId(null)
  }

  if (!session && !loading) {
    return (
      <main className="admin-page">
        <section className="admin-state admin-error">
          <span className="admin-eyebrow">Administrare</span>
          <h1>Acces restricționat</h1>
          <p>{error}</p>
        </section>
      </main>
    )
  }

  return (
    <main className="admin-page">
      <div className="admin-header">
        <div>
          <span className="admin-eyebrow">Norvex Automotive · Admin</span>
          <h1>Rezervări</h1>
          <p>Programările sunt încărcate direct din Supabase.</p>
        </div>
        <button type="button" className="admin-refresh" onClick={fetchReservations}>
          Reîncarcă
        </button>
      </div>

      {loading && <div className="admin-state">Se încarcă rezervările...</div>}

      {!loading && error && (
        <div className="admin-state admin-error">
          <p>{error}</p>
          <button type="button" onClick={fetchReservations}>
            Încearcă din nou
          </button>
        </div>
      )}

      {!loading && !error && reservations.length === 0 && (
        <div className="admin-state">
          <h2>Nicio rezervare</h2>
          <p>Nu există rezervări care să poată fi afișate.</p>
        </div>
      )}

      {!loading && !error && reservations.length > 0 && (
        <div className="reservations-table-wrap">
          <table className="reservations-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Contact</th>
                <th>Serviciu</th>
                <th>Programare</th>
                <th>Creată</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td>
                    <strong>
                      {reservation.prenume} {reservation.nume}
                    </strong>
                    <span>{reservation.email}</span>
                  </td>
                  <td>
                    <span>{reservation.telefon || '—'}</span>
                    <span>
                      {reservation.tip_masina} · {reservation.numar_masina}
                    </span>
                  </td>
                  <td>
                    <strong>{reservation.categorie_serviciu}</strong>
                    <span>{reservation.pachet_selectat}</span>
                  </td>
                  <td>
                    <input
                      type="date"
                      value={reservation.data_programare || ''}
                      onChange={(event) =>
                        setReservations((current) =>
                          current.map((item) =>
                            item.id === reservation.id
                              ? {
                                  ...item,
                                  data_programare: event.target.value,
                                }
                              : item
                          )
                        )
                      }
                    />
                    <input
                      type="time"
                      value={formatTime(reservation.ora_programare)}
                      onChange={(event) =>
                        setReservations((current) =>
                          current.map((item) =>
                            item.id === reservation.id
                              ? {
                                  ...item,
                                  ora_programare: event.target.value,
                                }
                              : item
                          )
                        )
                      }
                    />
                    <small>
                      {formatDate(reservation.data_programare)} ·{' '}
                      {formatTime(reservation.ora_programare)}
                    </small>
                  </td>
                  <td>{new Date(reservation.created_at).toLocaleString('ro-RO')}</td>
                  <td className="admin-actions">
                    <button
                      type="button"
                      onClick={() => updateReservation(reservation)}
                      disabled={savingId === reservation.id}
                    >
                      {savingId === reservation.id ? '...' : 'Salvează'}
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => deleteReservation(reservation)}
                      disabled={deletingId === reservation.id}
                    >
                      {deletingId === reservation.id ? '...' : 'Șterge'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}

export default AdminRezervari
