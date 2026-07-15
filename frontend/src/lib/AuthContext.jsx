// @refresh reset
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { apiFetch } from '../lib/api.js'

const AuthContext = createContext(null)

/**
 * Provee sesión + perfil de Railway a toda la app.
 * - `session`    → sesión Supabase
 * - `user`       → datos frescos de Supabase (user_metadata)
 * - `profile`    → fila de la tabla `usuarios` en Railway (nombre, tipo_usuario, etc.)
 * - `loading`    → true mientras resuelve la sesión inicial
 * - `signOut`    → cierra sesión
 */
export function AuthProvider({ children }) {
  const [session, setSession]   = useState(undefined)
  const [user, setUser]         = useState(null)
  const [profile, setProfile]   = useState(null)
  const [loading, setLoading]   = useState(true)

  /** Obtiene datos frescos de Supabase y sincroniza con Railway */
  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (user) {
      try {
        const { user: railwayUser } = await apiFetch('/auth/me')
        setProfile(railwayUser)
      } catch (err) {
        console.warn('[AuthContext] /api/auth/me falló:', err.message)
      }
    } else {
      setProfile(null)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session) await loadUser()
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session) {
        await loadUser()
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signOut, refreshProfile: loadUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
