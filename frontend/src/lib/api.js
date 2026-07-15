import { supabase } from './supabase.js'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

/**
 * Hace un fetch autenticado al backend usando el JWT de Supabase.
 * Lanza un error si la respuesta no es OK.
 */
export async function apiFetch(path, options = {}) {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('Sin sesión activa')
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      ...(options.headers ?? {}),
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Error ${res.status}`)
  }

  return res.json()
}
