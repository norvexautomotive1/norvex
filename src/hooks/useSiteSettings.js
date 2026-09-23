import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export const DEFAULT_SITE_SETTINGS = {
  phone_primary: '+40 700 000 000',
  email_primary: 'norvexautomotive1@gmail.com',
  address: 'Strada Principală Nr. 42, Cornu de Sus, Prahova',
  opening_hours: 'Luni – Sâmbătă, 09:00 – 19:00 · Duminică închis',
  instagram_url: '',
  tiktok_url: '',
  facebook_url: '',
}

export const useSiteSettings = () => {
  const [settings, setSettings] = useState(DEFAULT_SITE_SETTINGS)

  useEffect(() => {
    let mounted = true

    const loadSettings = async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')

      if (error) {
        console.error('Site settings load error:', error)
        return
      }

      if (!mounted) return

      const fetchedSettings = Object.fromEntries(
        (data ?? []).map(({ key, value }) => [key, value])
      )
      setSettings((current) => ({ ...current, ...fetchedSettings }))
    }

    loadSettings()

    return () => {
      mounted = false
    }
  }, [])

  return settings
}
