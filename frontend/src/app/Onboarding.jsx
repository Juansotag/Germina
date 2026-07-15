import { useState, useRef } from 'react'
import { 
  GraduationCap, Briefcase, User, Sparkles, Plus, X, Pencil,
  UploadCloud, ArrowRight, Loader2, Calendar, FileText, Check
} from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { apiFetch } from '../lib/api.js'
import '../styles/style.css'
import '../styles/germina.css'
import '../styles/landing.css'
import logoAzulUrl from '../assets/branding/logo_azul.png'

// ─── Valores vacíos reutilizables ──────────────────────────────────────────
const EMPTY_EXP = { organizacion: '', titulo: '', responsabilidades: '', fecha_inicio: '', fecha_fin: '', actual: false }
const EMPTY_EDU = { titulo: '', institucion: '', nivel: 'pregrado', anio_fin: '' }

const NIVELES_EDU = [
  { value: 'bachillerato',    label: 'Bachillerato' },
  { value: 'tecnico',         label: 'Técnico / Tecnólogo' },
  { value: 'pregrado',        label: 'Pregrado' },
  { value: 'especializacion', label: 'Especialización' },
  { value: 'maestria',        label: 'Maestría' },
  { value: 'doctorado',       label: 'Doctorado' },
  { value: 'postdoctorado',   label: 'Postdoctorado' },
  { value: 'diplomado',       label: 'Diplomado' },
  { value: 'otro',            label: 'Otro' },
]

export default function Onboarding({ onComplete }) {
  const fileInputRef = useRef(null)
  
  // ── Estados del formulario ─────────────────────────────────────────────
  const [nombre, setNombre] = useState('')
  const [roles, setRoles] = useState([])
  const [detallesRoles, setDetallesRoles] = useState({
    estudiante: { carrera: '', semestre: 1 },
    profesor: { clases: [] },
    administrativo: { puesto: '' },
    externo: { organizacion: '', puesto: '' }
  })
  const [educacion, setEducacion] = useState([])     // Array de diplomas
  const [experiencias, setExperiencias] = useState([])
  const [habilidades, setHabilidades] = useState({ idiomas: [], lenguajes: [], certificaciones: [] })

  // ── Control de UI ──────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false)
  const [parsingCv, setParsingCv] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // ── Inputs temporales para tags ────────────────────────────────────────
  const [newClass, setNewClass] = useState('')
  const [newIdioma, setNewIdioma] = useState('')
  const [newLenguaje, setNewLenguaje] = useState('')
  const [newCert, setNewCert] = useState('')

  // ── Formulario temporal de experiencia ────────────────────────────────
  const [tempExp, setTempExp] = useState(EMPTY_EXP)
  const [editingExpIdx, setEditingExpIdx] = useState(null) // null = creando nuevo

  // ── Formulario temporal de educación ──────────────────────────────────
  const [tempEdu, setTempEdu] = useState(EMPTY_EDU)
  const [editingEduIdx, setEditingEduIdx] = useState(null)

  const availableRoles = [
    { value: 'estudiante', label: 'Estudiante' },
    { value: 'profesor', label: 'Profesor' },
    { value: 'investigador', label: 'Investigador' },
    { value: 'administrativo', label: 'Administrativo' },
    { value: 'graduado', label: 'Graduado' },
    { value: 'aliado', label: 'Aliado' },
    { value: 'externo', label: 'Externo' }
  ]

  const handleToggleRole = (role) => {
    setRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role])
  }

  // ── CV Upload ──────────────────────────────────────────────────────────
  const handleCvUploadClick = () => fileInputRef.current?.click()

  const handleCvFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setParsingCv(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setError('Sesión expirada.'); setParsingCv(false); return }

    const formData = new FormData()
    formData.append('cv', file)
    try {
      const API_BASE = import.meta.env.VITE_API_URL || '/api'
      const res = await fetch(`${API_BASE}/profile/parse-cv`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
        body: formData
      })
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.error ?? `Error ${res.status}`) }
      const data = await res.json()

      if (data.nombre) setNombre(data.nombre || '')
      if (data.roles) setRoles(data.roles)
      if (data.experiencia_laboral) setExperiencias(data.experiencia_laboral)

      // Usar el array estructurado de diplomas que devuelve el backend
      if (data.educacion && Array.isArray(data.educacion) && data.educacion.length > 0) {
        setEducacion(data.educacion)
      } else if (data.formacion && typeof data.formacion === 'string' && data.formacion.trim()) {
        // Fallback: convertir string de formacion a un diploma generico
        setEducacion([{ titulo: data.formacion.trim(), institucion: '', nivel: 'otro', anio_fin: '' }])
      }

      if (data.detalles_roles) {
        const sanitize = (obj, defaults) => {
          const result = { ...defaults }
          for (const key of Object.keys(defaults)) {
            const v = obj?.[key]
            result[key] = (v === null || v === undefined) ? defaults[key] : v
          }
          return result
        }
        setDetallesRoles(prev => ({
          ...prev,
          estudiante: sanitize(data.detalles_roles.estudiante, { carrera: '', semestre: 1 }),
          profesor:   sanitize(data.detalles_roles.profesor,   { clases: [] }),
          administrativo: sanitize(data.detalles_roles.administrativo, { puesto: '' }),
          externo:    sanitize(data.detalles_roles.externo,    { organizacion: '', puesto: '' }),
        }))
      }
      if (data.habilidades) {
        setHabilidades({
          idiomas: data.habilidades.idiomas || [],
          lenguajes: data.habilidades.lenguajes || [],
          certificaciones: data.habilidades.certificaciones || []
        })
      }
      setSuccessMsg('¡Currículum leído y auto-rellenado! Revisa y ajusta los campos.')
      setTimeout(() => setSuccessMsg(''), 6000)
    } catch (err) {
      setError('No se pudo procesar el CV: ' + err.message)
    } finally {
      setParsingCv(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ── Tags ───────────────────────────────────────────────────────────────
  const addTag = (field, value, setValue) => {
    if (!value.trim()) return
    if (!habilidades[field].includes(value.trim())) {
      setHabilidades(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }))
    }
    setValue('')
  }
  const removeTag = (field, tagToRemove) => {
    setHabilidades(prev => ({ ...prev, [field]: prev[field].filter(t => t !== tagToRemove) }))
  }

  // ── Clases de profesor ─────────────────────────────────────────────────
  const addClass = () => {
    if (!newClass.trim()) return
    const classes = detallesRoles.profesor.clases || []
    if (!classes.includes(newClass.trim())) {
      setDetallesRoles(prev => ({ ...prev, profesor: { ...prev.profesor, clases: [...classes, newClass.trim()] } }))
    }
    setNewClass('')
  }
  const removeClass = (c) => {
    setDetallesRoles(prev => ({ ...prev, profesor: { ...prev.profesor, clases: prev.profesor.clases.filter(x => x !== c) } }))
  }

  // ── EXPERIENCIA LABORAL: añadir / editar / eliminar ───────────────────
  const handleTempExpChange = (e) => {
    const { name, value, type, checked } = e.target
    setTempExp(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const saveExperience = () => {
    if (!tempExp.organizacion.trim() || !tempExp.titulo.trim() || !tempExp.fecha_inicio) {
      setError('Organización, cargo y fecha de inicio son requeridos')
      return
    }
    if (editingExpIdx !== null) {
      setExperiencias(prev => prev.map((e, i) => i === editingExpIdx ? { ...tempExp } : e))
      setEditingExpIdx(null)
    } else {
      setExperiencias(prev => [...prev, { ...tempExp }])
    }
    setTempExp(EMPTY_EXP)
    setError('')
  }

  const editExperience = (idx) => {
    setTempExp({ ...experiencias[idx] })
    setEditingExpIdx(idx)
  }

  const cancelEditExp = () => { setTempExp(EMPTY_EXP); setEditingExpIdx(null) }

  const removeExperience = (idx) => {
    setExperiencias(prev => prev.filter((_, i) => i !== idx))
    if (editingExpIdx === idx) cancelEditExp()
  }

  // ── EDUCACIÓN: añadir / editar / eliminar ─────────────────────────────
  const handleTempEduChange = (e) => {
    const { name, value } = e.target
    setTempEdu(prev => ({ ...prev, [name]: value }))
  }

  const saveEducacion = () => {
    if (!tempEdu.titulo.trim() || !tempEdu.institucion.trim()) {
      setError('El título y la institución del diploma son requeridos')
      return
    }
    if (editingEduIdx !== null) {
      setEducacion(prev => prev.map((e, i) => i === editingEduIdx ? { ...tempEdu } : e))
      setEditingEduIdx(null)
    } else {
      setEducacion(prev => [...prev, { ...tempEdu }])
    }
    setTempEdu(EMPTY_EDU)
    setError('')
  }

  const editEducacion = (idx) => {
    setTempEdu({ ...educacion[idx] })
    setEditingEduIdx(idx)
  }

  const cancelEditEdu = () => { setTempEdu(EMPTY_EDU); setEditingEduIdx(null) }

  const removeEducacion = (idx) => {
    setEducacion(prev => prev.filter((_, i) => i !== idx))
    if (editingEduIdx === idx) cancelEditEdu()
  }

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!nombre.trim()) { setError('Por favor introduce tu nombre completo'); return }
    if (roles.length === 0) { setError('Debes seleccionar al menos un rol en la universidad'); return }
    setLoading(true)
    const payload = {
      nombre,
      roles,
      detalles_roles: detallesRoles,
      formacion: educacion.map(e => `${e.titulo} — ${e.institucion}${e.anio_fin ? ` (${e.anio_fin})` : ''}`).join(', '),
      educacion,           // array estructurado (para el futuro)
      habilidades,
      experiencia_laboral: experiencias
    }
    try {
      const { user } = await apiFetch('/profile', { method: 'PUT', body: JSON.stringify(payload) })
      // Crear proyecto de ejemplo con historial completo para el usuario nuevo
      try { await apiFetch('/demo/proyecto', { method: 'POST' }) } catch (_) { /* silencioso */ }
      if (onComplete) onComplete(user)
    } catch (err) {
      setError(err.message || 'Error al guardar el perfil.')
    } finally {
      setLoading(false)
    }
  }

  const hasRole = (r) => roles.includes(r)
  const isEstudiante    = hasRole('estudiante')
  const isProfesor      = hasRole('profesor')
  const isAdministrativo = hasRole('administrativo')
  const isExternoOrAliado = hasRole('externo') || hasRole('aliado')

  // ── Helpers de UI ──────────────────────────────────────────────────────
  const sectionHeader = (icon, label) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '1rem', color: 'var(--c-blue-dark)', marginBottom: '0.25rem' }}>
      {icon} {label}
    </div>
  )

  const formBox = (children, isEditing = false) => (
    <div className="experience-form-box" style={{ border: isEditing ? '1.5px solid var(--c-blue-light)' : undefined, background: isEditing ? 'var(--c-blue-tint)' : undefined }}>
      {children}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: 'var(--bg-main)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '3rem 1rem', overflowY: 'auto', boxSizing: 'border-box' }}>
      <div className="auth-form-box" style={{ maxWidth: '680px', width: '100%', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <img src={logoAzulUrl} alt="Germina" style={{ height: '48px', width: 'auto' }} />
          <h1 style={{ fontSize: '2rem', color: 'var(--c-blue-dark)', margin: 0, fontWeight: 700 }}>Completa tu Perfil</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '480px', lineHeight: 1.5, margin: 0 }}>
            Puedes completar el formulario manualmente o subir tu CV en PDF para que la IA llene los campos automáticamente.
          </p>
        </div>

        {/* CV Dropzone */}
        <div style={{ marginBottom: '1.5rem' }}>
          <input type="file" ref={fileInputRef} onChange={handleCvFileChange} accept=".pdf,.txt" style={{ display: 'none' }} />
          <div className={`cv-dropzone ${parsingCv ? 'active' : ''}`} onClick={parsingCv ? null : handleCvUploadClick}>
            {parsingCv ? (
              <>
                <Loader2 size={36} className="animate-spin" style={{ color: 'var(--c-blue-light)' }} />
                <span className="cv-dropzone-text" style={{ fontWeight: 600 }}>IA leyendo y auto-rellenando formulario...</span>
                <span className="cv-dropzone-subtext">Esto tardará unos segundos.</span>
              </>
            ) : (
              <>
                <UploadCloud size={36} style={{ color: 'var(--c-blue-soft)' }} />
                <span className="cv-dropzone-text"><strong>Haz clic aquí</strong> para subir tu CV (PDF o TXT)</span>
                <span className="cv-dropzone-subtext">La IA completará el resto del formulario.</span>
              </>
            )}
          </div>
          {successMsg && (
            <p style={{ color: 'var(--route-emprendimiento)', fontSize: 'var(--fs-sm)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', fontWeight: 600 }}>
              <Check size={16} /> {successMsg}
            </p>
          )}
        </div>

        <form className="auth-form-card" onSubmit={handleSubmit} style={{ gap: '1.75rem', padding: '2.5rem' }}>

          {/* Nombre */}
          <div className="form-group">
            <label htmlFor="nombre" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
              <User size={16} /> Nombre Completo
            </label>
            <div className="input-wrapper">
              <input id="nombre" name="nombre" type="text" placeholder="Tu nombre completo" value={nombre} onChange={e => setNombre(e.target.value)} required />
            </div>
          </div>

          {/* Roles */}
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 600 }}>
              ¿Cuál o cuáles son tus roles actuales en la universidad?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem' }}>
              {availableRoles.map(r => {
                const active = roles.includes(r.value)
                return (
                  <button key={r.value} type="button" onClick={() => handleToggleRole(r.value)} style={{
                    padding: '0.75rem 0.5rem', borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid ' + (active ? 'var(--c-blue-light)' : 'var(--border-color)'),
                    background: active ? 'var(--route-transferencia-bg)' : '#fff',
                    color: active ? 'var(--c-blue-dark)' : 'var(--text-secondary)',
                    fontWeight: active ? '700' : '500', fontSize: '0.85rem', cursor: 'pointer',
                    transition: 'all 0.2s', textAlign: 'center'
                  }}>
                    {r.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Detalles de rol */}
          {(isEstudiante || isProfesor || isAdministrativo || isExternoOrAliado) && (
            <div style={{ borderLeft: '3px solid var(--c-blue-light)', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--c-blue-dark)', margin: '0 0 0.25rem 0' }}>
                Detalles específicos del rol
              </h3>
              {isEstudiante && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="carrera">Carrera / Programa académico</label>
                    <input id="carrera" type="text" placeholder="Ej. Ingeniería Informática" value={detallesRoles.estudiante.carrera}
                      onChange={e => setDetallesRoles(prev => ({ ...prev, estudiante: { ...prev.estudiante, carrera: e.target.value } }))} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="semestre">Semestre actual</label>
                    <input id="semestre" type="number" min="1" max="16" value={detallesRoles.estudiante.semestre}
                      onChange={e => setDetallesRoles(prev => ({ ...prev, estudiante: { ...prev.estudiante, semestre: parseInt(e.target.value) || 1 } }))} />
                  </div>
                </div>
              )}
              {isProfesor && (
                <div className="form-group">
                  <label htmlFor="clases">¿Qué materias o asignaturas dictas?</label>
                  <div className="tags-input-container">
                    <input id="clases" type="text" placeholder="Agregar materia..." value={newClass} onChange={e => setNewClass(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addClass())} />
                    <button type="button" onClick={addClass} className="primary" style={{ padding: '0.65rem 1rem' }}><Plus size={16} /></button>
                  </div>
                  <div className="tags-list">
                    {(detallesRoles.profesor.clases || []).map(c => (
                      <span key={c} className="tag-badge">{c}<button type="button" onClick={() => removeClass(c)}><X size={12} /></button></span>
                    ))}
                  </div>
                </div>
              )}
              {isAdministrativo && (
                <div className="form-group">
                  <label htmlFor="puesto">Puesto / Cargo administrativo</label>
                  <input id="puesto" type="text" placeholder="Ej. Coordinador de Laboratorio" value={detallesRoles.administrativo?.puesto || ''}
                    onChange={e => setDetallesRoles(prev => ({ ...prev, administrativo: { ...prev.administrativo, puesto: e.target.value } }))} />
                </div>
              )}
              {isExternoOrAliado && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="ext-org">Organización / Empresa</label>
                    <input id="ext-org" type="text" placeholder="Empresa donde labora" value={detallesRoles.externo?.organizacion || ''}
                      onChange={e => setDetallesRoles(prev => ({ ...prev, externo: { ...prev.externo, organizacion: e.target.value } }))} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ext-puesto">Puesto o Cargo</label>
                    <input id="ext-puesto" type="text" placeholder="Ej. Gerente de Innovación" value={detallesRoles.externo?.puesto || ''}
                      onChange={e => setDetallesRoles(prev => ({ ...prev, externo: { ...prev.externo, puesto: e.target.value } }))} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── EDUCACIÓN (nuevo: lista de diplomas) ─── */}
          <div className="form-group">
            {sectionHeader(<GraduationCap size={16} />, 'Formación Académica')}
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', margin: '0 0 0.75rem' }}>
              Agrega cada título por separado: pregrado, especialización, maestría, etc.
            </p>

            {/* Formulario de diploma */}
            {formBox(
              <>
                <div className="form-row">
                  <div>
                    <label style={{ fontSize: 'var(--fs-xs)' }}>Título obtenido *</label>
                    <input name="titulo" type="text" placeholder="Ej. Administración de Empresas" value={tempEdu.titulo} onChange={handleTempEduChange} />
                  </div>
                  <div>
                    <label style={{ fontSize: 'var(--fs-xs)' }}>Institución *</label>
                    <input name="institucion" type="text" placeholder="Ej. Universidad de La Sabana" value={tempEdu.institucion} onChange={handleTempEduChange} />
                  </div>
                </div>
                <div className="form-row">
                  <div>
                    <label style={{ fontSize: 'var(--fs-xs)' }}>Nivel</label>
                    <select name="nivel" value={tempEdu.nivel} onChange={handleTempEduChange} style={{ width: '100%', padding: '0.65rem', border: '1.5px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-main)', fontSize: 'var(--fs-base)' }}>
                      {NIVELES_EDU.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 'var(--fs-xs)' }}>Año de graduación</label>
                    <input name="anio_fin" type="number" min="1950" max={new Date().getFullYear() + 5} placeholder="Ej. 2021" value={tempEdu.anio_fin} onChange={handleTempEduChange} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={saveEducacion} className="secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}>
                    <Plus size={14} /> {editingEduIdx !== null ? 'Guardar cambios' : 'Agregar diploma'}
                  </button>
                  {editingEduIdx !== null && (
                    <button type="button" onClick={cancelEditEdu} className="secondary" style={{ padding: '0.5rem 1rem' }}>Cancelar</button>
                  )}
                </div>
              </>,
              editingEduIdx !== null
            )}

            {/* Lista de diplomas */}
            <div className="experience-list">
              {educacion.map((edu, idx) => (
                <div key={idx} className="experience-card">
                  <div className="experience-card-header">
                    <div>
                      <span className="experience-org">{edu.titulo}</span>
                      <span style={{ margin: '0 0.5rem', color: 'var(--text-muted)' }}>—</span>
                      <span className="experience-title">{edu.institucion}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button type="button" onClick={() => editEducacion(idx)} title="Editar diploma"
                        style={{ all: 'unset', cursor: 'pointer', color: 'var(--c-blue-soft)', padding: '0.2rem', display: 'flex' }}>
                        <Pencil size={14} />
                      </button>
                      <button type="button" className="btn-delete-card" onClick={() => removeEducacion(idx)} title="Eliminar diploma">
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                  <div className="experience-date">
                    <span>{NIVELES_EDU.find(n => n.value === edu.nivel)?.label ?? edu.nivel}{edu.anio_fin ? ` · ${edu.anio_fin}` : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── EXPERIENCIA LABORAL (con edición) ─── */}
          <div className="form-group">
            {sectionHeader(<Briefcase size={16} />, 'Historial de Experiencia Laboral')}

            {formBox(
              <>
                <div className="form-row">
                  <div>
                    <label htmlFor="exp-org" style={{ fontSize: 'var(--fs-xs)' }}>Organización *</label>
                    <input id="exp-org" name="organizacion" type="text" placeholder="Empresa o Institución" value={tempExp.organizacion} onChange={handleTempExpChange} />
                  </div>
                  <div>
                    <label htmlFor="exp-title" style={{ fontSize: 'var(--fs-xs)' }}>Cargo / Título *</label>
                    <input id="exp-title" name="titulo" type="text" placeholder="Ej. Analista de Procesos" value={tempExp.titulo} onChange={handleTempExpChange} />
                  </div>
                </div>
                <div>
                  <label htmlFor="exp-desc" style={{ fontSize: 'var(--fs-xs)' }}>Responsabilidades principales</label>
                  <textarea id="exp-desc" name="responsabilidades" placeholder="Describe brevemente lo que hacías..." value={tempExp.responsabilidades} onChange={handleTempExpChange} style={{ minHeight: '60px', padding: '0.65rem' }} />
                </div>
                <div className="form-row" style={{ alignItems: 'center' }}>
                  <div>
                    <label htmlFor="exp-start" style={{ fontSize: 'var(--fs-xs)' }}>Fecha de Inicio *</label>
                    <input id="exp-start" name="fecha_inicio" type="date" value={tempExp.fecha_inicio} onChange={handleTempExpChange} />
                  </div>
                  <div>
                    <label htmlFor="exp-end" style={{ fontSize: 'var(--fs-xs)', opacity: tempExp.actual ? 0.5 : 1 }}>Fecha de Finalización</label>
                    <input id="exp-end" name="fecha_fin" type="date" disabled={tempExp.actual} value={tempExp.actual ? '' : tempExp.fecha_fin} onChange={handleTempExpChange} />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input id="exp-actual" name="actual" type="checkbox" checked={tempExp.actual} onChange={handleTempExpChange} style={{ width: 'auto' }} />
                  <label htmlFor="exp-actual" style={{ margin: 0, fontSize: 'var(--fs-sm)' }}>Actualmente trabajo aquí</label>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={saveExperience} className="secondary" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}>
                    <Plus size={14} /> {editingExpIdx !== null ? 'Guardar cambios' : 'Agregar a mi CV'}
                  </button>
                  {editingExpIdx !== null && (
                    <button type="button" onClick={cancelEditExp} className="secondary" style={{ padding: '0.5rem 1rem' }}>Cancelar</button>
                  )}
                </div>
              </>,
              editingExpIdx !== null
            )}

            {/* Lista de experiencias */}
            <div className="experience-list">
              {experiencias.map((exp, idx) => (
                <div key={idx} className="experience-card">
                  <div className="experience-card-header">
                    <div>
                      <span className="experience-org">{exp.organizacion}</span>
                      <span style={{ margin: '0 0.5rem', color: 'var(--text-muted)' }}>—</span>
                      <span className="experience-title">{exp.titulo}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button type="button" onClick={() => editExperience(idx)} title="Editar experiencia"
                        style={{ all: 'unset', cursor: 'pointer', color: 'var(--c-blue-soft)', padding: '0.2rem', display: 'flex' }}>
                        <Pencil size={14} />
                      </button>
                      <button type="button" className="btn-delete-card" onClick={() => removeExperience(idx)} title="Eliminar experiencia">
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                  <div className="experience-date" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Calendar size={12} />
                    <span>{exp.fecha_inicio} al {exp.actual ? 'Presente' : exp.fecha_fin}</span>
                  </div>
                  {exp.responsabilidades && <p className="experience-desc">{exp.responsabilidades}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* ─── Habilidades ─── */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--c-blue-dark)', margin: 0 }}>Conocimientos y Habilidades</h3>
            {[
              { field: 'idiomas', id: 'h-idiomas', label: 'Idiomas', placeholder: 'Ej. Inglés, Alemán...', val: newIdioma, setVal: setNewIdioma },
              { field: 'lenguajes', id: 'h-lenguajes', label: 'Herramientas o Lenguajes técnicos', placeholder: 'Ej. Excel, Python, Canva...', val: newLenguaje, setVal: setNewLenguaje },
              { field: 'certificaciones', id: 'h-certificaciones', label: 'Certificaciones', placeholder: 'Ej. Scrum Master, PMP...', val: newCert, setVal: setNewCert },
            ].map(({ field, id, label, placeholder, val, setVal }) => (
              <div key={field} className="form-group">
                <label htmlFor={id}>{label}</label>
                <div className="tags-input-container">
                  <input id={id} type="text" placeholder={placeholder} value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(field, val, setVal))} />
                  <button type="button" onClick={() => addTag(field, val, setVal)} className="secondary" style={{ padding: '0.65rem 1rem' }}><Plus size={16} /></button>
                </div>
                <div className="tags-list">
                  {habilidades[field].map(t => (
                    <span key={t} className="tag-badge">{t}<button type="button" onClick={() => removeTag(field, t)}><X size={12} /></button></span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <p role="alert" style={{ color: 'var(--c-red)', fontSize: 'var(--fs-sm)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
              <FileText size={15} /> {error}
            </p>
          )}

          <button id="btn-submit-onboarding" type="submit" className="btn-auth-submit" disabled={loading}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', padding: '0.9rem 1rem' }}>
            {loading ? <><Loader2 size={18} className="animate-spin" /> Guardando tu perfil...</> : <>Comenzar en Germina <ArrowRight size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  )
}
