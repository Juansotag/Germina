import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import '../styles/style.css'
import '../styles/germina.css'
import '../styles/landing.css'
import logoAzulUrl from '../assets/branding/logo_azul.png'
import govlabLogoUrl from '../assets/branding/GovLab_blanco.png'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ correo: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    if (!form.correo.endsWith('@unisabana.edu.co')) {
      setError('Solo se permiten correos del dominio @unisabana.edu.co')
      return
    }

    setLoading(true)
    const { error: sbError } = await supabase.auth.signInWithPassword({
      email: form.correo,
      password: form.password,
    })
    setLoading(false)

    if (sbError) {
      if (sbError.message.includes('Invalid login credentials')) {
        setError('Correo o contraseña incorrectos')
      } else if (sbError.message.includes('Email not confirmed')) {
        setError('Confirma tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.')
      } else {
        setError(sbError.message)
      }
      return
    }

    navigate('/dashboard')
  }

  return (
    <div className="auth-container">
      {/* Panel izquierdo — marca */}
      <div className="auth-panel-brand" aria-hidden="true">
        <img src={logoAzulUrl} alt="" className="auth-brand-logo" style={{ filter: 'brightness(0) invert(1)' }} />
        <span className="auth-brand-title">Germina</span>
        <p className="auth-brand-desc">
          Tu proceso de innovación, paso a paso, con la guía de un asistente de inteligencia artificial.
        </p>
        <div className="auth-brand-govlab">
          <img src={govlabLogoUrl} alt="GovLab — Universidad de La Sabana" />
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="auth-panel-form">
        <div className="auth-form-box">
          <Link to="/" className="back-link" style={{ color: 'var(--c-blue-soft)', textDecoration: 'none' }}>
            ← Volver al inicio
          </Link>

          <div className="auth-form-header">
            <h1>Bienvenido de nuevo</h1>
            <p>Ingresa con tu correo institucional para continuar.</p>
          </div>

          <form className="auth-form-card" onSubmit={handleSubmit} noValidate id="form-login">
            <div className="form-group">
              <label htmlFor="login-correo">Correo institucional</label>
              <div className="input-wrapper">
                <span className="input-icon"><Mail size={16} /></span>
                <input id="login-correo" name="correo" type="email"
                  placeholder="usuario@unisabana.edu.co" value={form.correo}
                  onChange={handleChange} required autoComplete="email" autoFocus />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Contraseña</label>
              <div className="input-wrapper">
                <span className="input-icon"><Lock size={16} /></span>
                <input id="login-password" name="password" type="password"
                  placeholder="Tu contraseña" value={form.password}
                  onChange={handleChange} required autoComplete="current-password" />
              </div>
            </div>

            {error && (
              <p role="alert" style={{ color: 'var(--c-red)', fontSize: 'var(--fs-sm)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertCircle size={15} /> {error}
              </p>
            )}

            <button id="btn-submit-login" type="submit" className="btn-auth-submit" disabled={loading}>
              {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="auth-switch">
            ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
