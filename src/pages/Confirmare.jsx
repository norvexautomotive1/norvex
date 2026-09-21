import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import '../styles/Confirmare.scss'

const Confirmare = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')?.trim()
  const [state, setState] = useState(token ? 'loading' : 'error')
  const [message, setMessage] = useState(
    token ? '' : 'Linkul de confirmare este invalid sau incomplet.'
  )

  useEffect(() => {
    let cancelled = false

    if (!token) {
      return () => {
        cancelled = true
      }
    }

    const confirmReservation = async () => {
      const { data, error } = await supabase.rpc('confirm_reservation', {
        p_token: token,
      })

      if (cancelled) return

      if (error) {
        console.error('Confirmation RPC error:', error)
        setState('error')
        setMessage('Nu am putut confirma rezervarea. Linkul poate fi expirat.')
        return
      }

      if (data?.status === 'expired') {
        setState('expired')
        setMessage('Linkul de confirmare a expirat. Te rugăm să ne contactezi.')
        return
      }

      if (data?.status === 'not_found') {
        setState('error')
        setMessage('Linkul de confirmare nu este valid.')
        return
      }

      setState('success')
      setMessage(
        data?.status === 'already_confirmed'
          ? 'Această rezervare a fost deja confirmată.'
          : 'Rezervarea ta a fost confirmată cu succes.'
      )
    }

    confirmReservation()

    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <main className="confirmation-page">
      <section className={`confirmation-card ${state}`}>
        <div className="confirmation-eyebrow">Norvex Automotive</div>
        <div className="confirmation-icon" aria-hidden="true">
          {state === 'loading' ? '…' : state === 'success' ? '✓' : '!'}
        </div>
        <h1>
          {state === 'loading'
            ? 'Se verifică rezervarea'
            : state === 'success'
              ? 'Rezervare confirmată'
              : state === 'expired'
                ? 'Link expirat'
                : 'Confirmare nereușită'}
        </h1>
        <p>{message || 'Așteaptă câteva secunde, te rugăm.'}</p>
        <Link className="confirmation-link" to="/">
          Înapoi la pagina principală
        </Link>
      </section>
    </main>
  )
}

export default Confirmare
