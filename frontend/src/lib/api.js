import { supabase } from './supabase.js'

// VITE_API_URL debe ser solo la URL, sin comillas ni el nombre de la variable.
// Si llega mal configurada, usamos la URL de producción directamente.
const _raw = import.meta.env.VITE_API_URL?.trim() ?? ''
const API_BASE = _raw.startsWith('http')
  ? _raw.replace(/\/$/, '')           // quitar barra final si la trae
  : 'https://backend-production-166b4.up.railway.app/api'


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
