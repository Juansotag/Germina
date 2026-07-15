import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Mail, Lock, Building2, AlertCircle, MailCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'
import '../styles/style.css'
import '../styles/germina.css'
import '../styles/landing.css'
import logoAzulUrl from '../assets/branding/logo_azul.png'
import govlabLogoUrl from '../assets/branding/GovLab_blanco.png'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nombre: '', correo: '', password: '', confirmar: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmPending, setConfirmPending] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    if (!form.correo.endsWith('@unisabana.edu.co')) {
      setError('Solo se permiten correos del dominio @unisabana.edu.co')
      return
    }
    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (form.password !== form.confirmar) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    const { data, error: sbError } = await supabase.auth.signUp({
      email: form.correo,
      password: form.password,
      options: {
        data: {
          nombre:    form.nombre,   // campo interno de Germina
          full_name: form.nombre,   // campo estándar que lee el dashboard de Supabase
        },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })
    setLoading(false)

    if (sbError) { setError(sbError.message); return }

    // Si Supabase ya creó la sesión (confirmación de email desactivada),
    // navegamos directo al dashboard. Si no, mostramos la pantalla de espera.
    if (data.session) {
      navigate('/dashboard')
    } else {
      setConfirmPending(true)
    }
  }

  /* ── Pantalla: revisa tu correo ── */
  if (confirmPending) {
    return (
      <div className="auth-screen" style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', maxWidth: 380, padding: '2rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--c-blue-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MailCheck size={30} color="var(--c-blue-dark)" />
          </div>
          <div className="auth-form-header">
            <h1>Revisa tu correo</h1>
            <p>
              Enviamos un enlace de confirmación a <strong>{form.correo}</strong>.
              Haz clic en el enlace para activar tu cuenta y luego inicia sesión.
            </p>
          </div>
          <button id="btn-ir-login" className="btn-auth-submit" style={{ maxWidth: 300 }} onClick={() => navigate('/login')}>
            Ir a iniciar sesión
          </button>
        </div>
      </div>
    )
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
            <h1>Crea tu cuenta</h1>
            <p>Únete al ecosistema de innovación de la Universidad de La Sabana.</p>
          </div>

          <div className="auth-domain-note">
            <span className="note-icon"><Building2 size={15} /></span>
            <span>Acceso restringido a correos <strong>@unisabana.edu.co</strong></span>
          </div>

          <form className="auth-form-card" onSubmit={handleSubmit} noValidate id="form-registro">
            <div className="form-group">
              <label htmlFor="reg-nombre">Nombre completo</label>
              <div className="input-wrapper">
                <span className="input-icon"><User size={16} /></span>
                <input id="reg-nombre" name="nombre" type="text"
                  placeholder="Tu nombre completo" value={form.nombre}
                  onChange={handleChange} required autoComplete="name" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-correo">Correo institucional</label>
              <div className="input-wrapper">
                <span className="input-icon"><Mail size={16} /></span>
                <input id="reg-correo" name="correo" type="email"
                  placeholder="usuario@unisabana.edu.co" value={form.correo}
                  onChange={handleChange} required autoComplete="email" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-password">Contraseña</label>
              <div className="input-wrapper">
                <span className="input-icon"><Lock size={16} /></span>
                <input id="reg-password" name="password" type="password"
                  placeholder="Mínimo 8 caracteres" value={form.password}
                  onChange={handleChange} required autoComplete="new-password" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reg-confirmar">Confirmar contraseña</label>
              <div className="input-wrapper">
                <span className="input-icon"><Lock size={16} /></span>
                <input id="reg-confirmar" name="confirmar" type="password"
                  placeholder="Repite tu contraseña" value={form.confirmar}
                  onChange={handleChange} required autoComplete="new-password" />
              </div>
            </div>

            {error && (
              <p role="alert" style={{ color: 'var(--c-red)', fontSize: 'var(--fs-sm)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertCircle size={15} /> {error}
              </p>
            )}

            <button id="btn-submit-registro" type="submit" className="btn-auth-submit" disabled={loading}>
              {loading ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </form>

          <p className="auth-switch">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
