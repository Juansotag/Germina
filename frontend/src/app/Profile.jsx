import { useState, useEffect, useRef } from 'react'
import {
  GraduationCap, Briefcase, User, Plus, X, Pencil,
  UploadCloud, ArrowLeft, Loader2, Calendar, FileText, Check, Save
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { apiFetch } from '../lib/api.js'
import { useAuth } from '../lib/AuthContext.jsx'
import '../styles/style.css'
import '../styles/germina.css'
import '../styles/landing.css'
import Header from '../components/Header.jsx'
import Sidebar from '../components/Sidebar.jsx'

// ─── Constantes ───────────────────────────────────────────────────────────
const EMPTY_EXP = { organizacion: '', titulo: '', responsabilidades: '', fecha_inicio: '', fecha_fin: '', actual: false }
const EMPTY_EDU = { titulo: '', institucion: '', nivel: 'pregrado', anio_fin: '' }

const NIVELES_EDU = [
  { value: 'bachillerato',    label: 'Bachillerato' },
  { value: 'tecnico',         label: 'Tecnico / Tecnologo' },
  { value: 'pregrado',        label: 'Pregrado' },
  { value: 'especializacion', label: 'Especializacion' },
  { value: 'maestria',        label: 'Maestria' },
  { value: 'doctorado',       label: 'Doctorado' },
  { value: 'postdoctorado',   label: 'Postdoctorado' },
  { value: 'diplomado',       label: 'Diplomado' },
  { value: 'otro',            label: 'Otro' },
]

const availableRoles = [
  { value: 'estudiante',    label: 'Estudiante' },
  { value: 'profesor',      label: 'Profesor' },
  { value: 'investigador',  label: 'Investigador' },
  { value: 'administrativo',label: 'Administrativo' },
  { value: 'graduado',      label: 'Graduado' },
  { value: 'aliado',        label: 'Aliado' },
  { value: 'externo',       label: 'Externo' },
]

export default function Profile() {
  const { user, profile, signOut, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const rawName = profile?.nombre ?? user?.user_metadata?.nombre ?? user?.email ?? 'Usuario'
  const nombre_display = rawName.includes('@') ? rawName.split('@')[0] : rawName
  const initials = nombre_display.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const tipoUsuario = profile?.tipo_usuario ?? 'Por definir'

  // ── Estado del formulario ──────────────────────────────────────────────
  const [nombre, setNombre]           = useState('')
  const [roles, setRoles]             = useState([])
  const [detallesRoles, setDetallesRoles] = useState({
    estudiante: { carrera: '', semestre: 1 },
    profesor: { clases: [] },
    administrativo: { puesto: '' },
    externo: { organizacion: '', puesto: '' }
  })
  const [educacion, setEducacion]     = useState([])
  const [experiencias, setExperiencias] = useState([])
  const [habilidades, setHabilidades] = useState({ idiomas: [], lenguajes: [], certificaciones: [] })

  // ── UI ─────────────────────────────────────────────────────────────────
  const [pageLoading, setPageLoading] = useState(true)
  const [saving, setSaving]           = useState(false)
  const [parsingCv, setParsingCv]     = useState(false)
  const [error, setError]             = useState('')
  const [successMsg, setSuccessMsg]   = useState('')

  // ── Tags input ─────────────────────────────────────────────────────────
  const [newClass, setNewClass]         = useState('')
  const [newIdioma, setNewIdioma]       = useState('')
  const [newLenguaje, setNewLenguaje]   = useState('')
  const [newCert, setNewCert]           = useState('')

  // ── Formulario temporal experiencia ───────────────────────────────────
  const [tempExp, setTempExp]           = useState(EMPTY_EXP)
  const [editingExpIdx, setEditingExpIdx] = useState(null)

  // ── Formulario temporal educacion ─────────────────────────────────────
  const [tempEdu, setTempEdu]           = useState(EMPTY_EDU)
  const [editingEduIdx, setEditingEduIdx] = useState(null)

  // ── Cargar perfil ──────────────────────────────────────────────────────
  useEffect(() => {
    apiFetch('/profile').then(({ user: u }) => {
      setNombre(u.nombre || '')
      setRoles(u.roles || [])
      setEducacion(Array.isArray(u.educacion) ? u.educacion : [])
      setExperiencias(u.experiencia_laboral || [])
      setHabilidades({
        idiomas:         u.habilidades?.idiomas         || [],
        lenguajes:       u.habilidades?.lenguajes       || [],
        certificaciones: u.habilidades?.certificaciones || [],
      })
      if (u.detalles_roles && Object.keys(u.detalles_roles).length > 0) {
        setDetallesRoles(prev => ({ ...prev, ...u.detalles_roles }))
      }
    }).catch(console.error).finally(() => setPageLoading(false))
  }, [])

  // ── Handlers genéricos ─────────────────────────────────────────────────
  const handleToggleRole = (role) => setRoles(r => r.includes(role) ? r.filter(x => x !== role) : [...r, role])

  const addTag = (field, value, setValue) => {
    if (!value.trim()) return
    if (!habilidades[field].includes(value.trim()))
      setHabilidades(h => ({ ...h, [field]: [...h[field], value.trim()] }))
    setValue('')
  }
  const removeTag = (field, tag) => setHabilidades(h => ({ ...h, [field]: h[field].filter(t => t !== tag) }))

  const addClass = () => {
    if (!newClass.trim()) return
    const existing = detallesRoles.profesor.clases || []
    if (!existing.includes(newClass.trim()))
      setDetallesRoles(d => ({ ...d, profesor: { ...d.profesor, clases: [...existing, newClass.trim()] } }))
    setNewClass('')
  }

  // ── Experiencia: add / edit / remove ──────────────────────────────────
  const handleTempExpChange = (e) => {
    const { name, value, type, checked } = e.target
    setTempExp(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }
  const saveExperience = () => {
    if (!tempExp.organizacion.trim() || !tempExp.titulo.trim() || !tempExp.fecha_inicio) {
      setError('Organizacion, cargo y fecha de inicio son requeridos'); return
    }
    if (editingExpIdx !== null) {
      setExperiencias(prev => prev.map((e, i) => i === editingExpIdx ? { ...tempExp } : e))
      setEditingExpIdx(null)
    } else {
      setExperiencias(prev => [...prev, { ...tempExp }])
    }
    setTempExp(EMPTY_EXP); setError('')
  }
  const editExperience = (idx) => { setTempExp({ ...experiencias[idx] }); setEditingExpIdx(idx) }
  const cancelEditExp = () => { setTempExp(EMPTY_EXP); setEditingExpIdx(null) }
  const removeExperience = (idx) => {
    setExperiencias(prev => prev.filter((_, i) => i !== idx))
    if (editingExpIdx === idx) cancelEditExp()
  }

  // ── Educación: add / edit / remove ────────────────────────────────────
  const handleTempEduChange = (e) => {
    const { name, value } = e.target
    setTempEdu(prev => ({ ...prev, [name]: value }))
  }
  const saveEducacion = () => {
    if (!tempEdu.titulo.trim() || !tempEdu.institucion.trim()) {
      setError('El titulo y la institucion del diploma son requeridos'); return
    }
    if (editingEduIdx !== null) {
      setEducacion(prev => prev.map((e, i) => i === editingEduIdx ? { ...tempEdu } : e))
      setEditingEduIdx(null)
    } else {
      setEducacion(prev => [...prev, { ...tempEdu }])
    }
    setTempEdu(EMPTY_EDU); setError('')
  }
  const editEducacion = (idx) => { setTempEdu({ ...educacion[idx] }); setEditingEduIdx(idx) }
  const cancelEditEdu = () => { setTempEdu(EMPTY_EDU); setEditingEduIdx(null) }
  const removeEducacion = (idx) => {
    setEducacion(prev => prev.filter((_, i) => i !== idx))
    if (editingEduIdx === idx) cancelEditEdu()
  }

  // ── CV Upload ──────────────────────────────────────────────────────────
  const handleCvFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(''); setParsingCv(true)
    const { data: { session } } = await supabase.auth.getSession()
    const formData = new FormData()
    formData.append('cv', file)
    try {
      const API_BASE = import.meta.env.VITE_API_URL || '/api'
      const res = await fetch(`${API_BASE}/profile/parse-cv`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `Error ${res.status}`)
      const data = await res.json()
      if (data.nombre) setNombre(data.nombre)
      if (data.roles)  setRoles(data.roles)
      if (data.educacion && Array.isArray(data.educacion)) setEducacion(data.educacion)
      if (data.experiencia_laboral) setExperiencias(data.experiencia_laboral)
      if (data.detalles_roles) setDetallesRoles(prev => ({ ...prev, ...data.detalles_roles }))
      if (data.habilidades) setHabilidades({
        idiomas:         data.habilidades.idiomas         || [],
        lenguajes:       data.habilidades.lenguajes       || [],
        certificaciones: data.habilidades.certificaciones || [],
      })
      setSuccessMsg('CV leido y campos actualizados. Revisa antes de guardar.')
      setTimeout(() => setSuccessMsg(''), 6000)
    } catch (err) {
      setError('No se pudo procesar el CV: ' + err.message)
    } finally {
      setParsingCv(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ── Guardar perfil ─────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    if (roles.length === 0) { setError('Debes seleccionar al menos un rol'); return }
    setSaving(true)
    const formacion = educacion
      .map(edu => `${edu.titulo} — ${edu.institucion}${edu.anio_fin ? ` (${edu.anio_fin})` : ''}`)
      .join(', ')
    try {
      await apiFetch('/profile', {
        method: 'PUT',
        body: JSON.stringify({
          nombre, roles, detalles_roles: detallesRoles,
          formacion, educacion, habilidades,
          experiencia_laboral: experiencias,
        }),
      })
      await refreshProfile()
      setSuccessMsg('Perfil guardado correctamente.')
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      setError(err.message || 'Error al guardar el perfil.')
    } finally {
      setSaving(false)
    }
  }

  const hasRole = (r) => roles.includes(r)
  const formBoxStyle = (editing) => ({
    background: editing ? '#FFF7ED' : 'var(--bg-main)',
    border: `1.5px solid ${editing ? '#F59E0B' : 'var(--border-color)'}`,
    borderRadius: 'var(--radius-sm)', padding: '1rem',
    display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '0.75rem',
  })

  if (pageLoading) {
    return (
      <div className="app-shell">
        <Header userName={nombre_display} userInitials={initials} onUserClick={() => navigate('/profile')} />
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={28} className="animate-spin" style={{ marginRight: '0.5rem' }} /> Cargando perfil...
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Header userName={nombre_display} userInitials={initials} onUserClick={() => navigate('/profile')} />

      <div className="app-body">
        <Sidebar
          user={{ nombre: nombre_display, roles, tipo_usuario: tipoUsuario, initials, foto_perfil_url: null }}
          onCreateProject={() => navigate('/dashboard')}
          activePath="/profile"
        />

        <main className="workspace" style={{ overflowY: 'auto', padding: '2rem' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: 'var(--fs-sm)', padding: 0, marginBottom: '1rem' }}
          >
            <ArrowLeft size={16} /> Volver al inicio
          </button>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--c-blue-dark)', margin: '0 0 0.25rem 0' }}>Mi Perfil</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', margin: '0 0 1.5rem 0' }}>
            Aqui puedes ver y editar toda tu informacion de caracterizacion.
          </p>

          {/* CV Upload */}
          <input type="file" ref={fileInputRef} onChange={handleCvFileChange} accept=".pdf,.txt" style={{ display: 'none' }} />
          <div
            className={`cv-dropzone ${parsingCv ? 'active' : ''}`}
            onClick={parsingCv ? null : () => fileInputRef.current?.click()}
            style={{ marginBottom: '1.5rem' }}
          >
            {parsingCv ? (
              <><Loader2 size={32} className="animate-spin" style={{ color: 'var(--c-blue-light)' }} /><span className="cv-dropzone-text" style={{ fontWeight: 600 }}>Claude esta leyendo tu CV...</span></>
            ) : (
              <><UploadCloud size={32} style={{ color: 'var(--c-blue-soft)' }} /><span className="cv-dropzone-text"><strong>Actualizar con CV</strong> — Sube un PDF para auto-rellenar los campos</span></>
            )}
          </div>

          {successMsg && (
            <p style={{ color: 'var(--route-emprendimiento)', fontSize: 'var(--fs-sm)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem', fontWeight: 600 }}>
              <Check size={15} /> {successMsg}
            </p>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '680px' }}>

            {/* Nombre */}
            <div className="form-group">
              <label htmlFor="p-nombre" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                <User size={15} /> Nombre Completo
              </label>
              <input id="p-nombre" type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre completo" />
            </div>

            {/* Roles */}
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Roles en la Universidad</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem' }}>
                {availableRoles.map(r => (
                  <button key={r.value} type="button" onClick={() => handleToggleRole(r.value)} style={{
                    padding: '0.65rem 0.5rem', borderRadius: 'var(--radius-sm)', textAlign: 'center',
                    fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
                    border: '1.5px solid ' + (roles.includes(r.value) ? 'var(--c-blue-light)' : 'var(--border-color)'),
                    background: roles.includes(r.value) ? 'var(--route-transferencia-bg)' : '#fff',
                    color: roles.includes(r.value) ? 'var(--c-blue-dark)' : 'var(--text-secondary)',
                    fontWeight: roles.includes(r.value) ? 700 : 500,
                  }}>{r.label}</button>
                ))}
              </div>
            </div>

            {/* Detalles de rol */}
            {(hasRole('estudiante') || hasRole('profesor') || hasRole('administrativo') || hasRole('externo') || hasRole('aliado')) && (
              <div style={{ borderLeft: '3px solid var(--c-blue-light)', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--c-blue-dark)', margin: 0 }}>Detalles del rol</h3>
                {hasRole('estudiante') && (
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="p-carrera">Carrera</label>
                      <input id="p-carrera" type="text" placeholder="Ej. Ingenieria Informatica" value={detallesRoles.estudiante.carrera}
                        onChange={e => setDetallesRoles(d => ({ ...d, estudiante: { ...d.estudiante, carrera: e.target.value } }))} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="p-semestre">Semestre</label>
                      <input id="p-semestre" type="number" min="1" max="16" value={detallesRoles.estudiante.semestre}
                        onChange={e => setDetallesRoles(d => ({ ...d, estudiante: { ...d.estudiante, semestre: parseInt(e.target.value) || 1 } }))} />
                    </div>
                  </div>
                )}
                {hasRole('profesor') && (
                  <div className="form-group">
                    <label>Materias que dictas</label>
                    <div className="tags-input-container">
                      <input type="text" placeholder="Agregar materia..." value={newClass}
                        onChange={e => setNewClass(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addClass())} />
                      <button type="button" onClick={addClass} className="primary" style={{ padding: '0.65rem 1rem' }}><Plus size={14} /></button>
                    </div>
                    <div className="tags-list">
                      {(detallesRoles.profesor.clases || []).map(c => (
                        <span key={c} className="tag-badge">{c}
                          <button type="button" onClick={() => setDetallesRoles(d => ({ ...d, profesor: { ...d.profesor, clases: d.profesor.clases.filter(x => x !== c) } }))}><X size={12} /></button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {hasRole('administrativo') && (
                  <div className="form-group">
                    <label htmlFor="p-puesto">Cargo administrativo</label>
                    <input id="p-puesto" type="text" placeholder="Ej. Coordinador de Laboratorio" value={detallesRoles.administrativo?.puesto || ''}
                      onChange={e => setDetallesRoles(d => ({ ...d, administrativo: { ...d.administrativo, puesto: e.target.value } }))} />
                  </div>
                )}
                {(hasRole('externo') || hasRole('aliado')) && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Organizacion</label>
                      <input type="text" placeholder="Empresa donde labora" value={detallesRoles.externo?.organizacion || ''}
                        onChange={e => setDetallesRoles(d => ({ ...d, externo: { ...d.externo, organizacion: e.target.value } }))} />
                    </div>
                    <div className="form-group">
                      <label>Cargo</label>
                      <input type="text" placeholder="Ej. Gerente de Innovacion" value={detallesRoles.externo?.puesto || ''}
                        onChange={e => setDetallesRoles(d => ({ ...d, externo: { ...d.externo, puesto: e.target.value } }))} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── EDUCACION ─── */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                <GraduationCap size={15} /> Formacion Academica
              </label>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', margin: '0 0 0.75rem' }}>
                Agrega cada titulo por separado: pregrado, especializacion, maestria, etc.
              </p>

              {/* Formulario diploma */}
              <div style={formBoxStyle(editingEduIdx !== null)}>
                {editingEduIdx !== null && (
                  <p style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: '#F59E0B', margin: 0 }}>Editando diploma #{editingEduIdx + 1}</p>
                )}
                <div className="form-row">
                  <div>
                    <label style={{ fontSize: 'var(--fs-xs)' }}>Titulo obtenido *</label>
                    <input name="titulo" type="text" placeholder="Ej. Administracion de Empresas" value={tempEdu.titulo} onChange={handleTempEduChange} />
                  </div>
                  <div>
                    <label style={{ fontSize: 'var(--fs-xs)' }}>Institucion *</label>
                    <input name="institucion" type="text" placeholder="Ej. Universidad de La Sabana" value={tempEdu.institucion} onChange={handleTempEduChange} />
                  </div>
                </div>
                <div className="form-row">
                  <div>
                    <label style={{ fontSize: 'var(--fs-xs)' }}>Nivel</label>
                    <select name="nivel" value={tempEdu.nivel} onChange={handleTempEduChange}
                      style={{ width: '100%', padding: '0.65rem', border: '1.5px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-main)', fontSize: 'var(--fs-base)' }}>
                      {NIVELES_EDU.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 'var(--fs-xs)' }}>Ano de graduacion</label>
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
              </div>

              {/* Lista de diplomas */}
              <div className="experience-list">
                {educacion.map((edu, idx) => (
                  <div key={idx} className="experience-card">
                    <div className="experience-card-header">
                      <div>
                        <span className="experience-org">{edu.titulo}</span>
                        <span style={{ margin: '0 0.5rem', color: 'var(--text-muted)' }}>-</span>
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

            {/* ─── EXPERIENCIA LABORAL ─── */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                <Briefcase size={15} /> Historial de Experiencia Laboral
              </label>

              {/* Formulario experiencia */}
              <div style={formBoxStyle(editingExpIdx !== null)}>
                {editingExpIdx !== null && (
                  <p style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: '#F59E0B', margin: 0 }}>Editando experiencia #{editingExpIdx + 1}</p>
                )}
                <div className="form-row">
                  <div>
                    <label style={{ fontSize: 'var(--fs-xs)' }}>Organizacion *</label>
                    <input name="organizacion" type="text" placeholder="Empresa o Institucion" value={tempExp.organizacion} onChange={handleTempExpChange} />
                  </div>
                  <div>
                    <label style={{ fontSize: 'var(--fs-xs)' }}>Cargo *</label>
                    <input name="titulo" type="text" placeholder="Ej. Analista de Procesos" value={tempExp.titulo} onChange={handleTempExpChange} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 'var(--fs-xs)' }}>Responsabilidades</label>
                  <textarea name="responsabilidades" value={tempExp.responsabilidades} onChange={handleTempExpChange}
                    placeholder="Describe brevemente lo que hacias..." style={{ minHeight: '60px', padding: '0.65rem', width: '100%', boxSizing: 'border-box' }} />
                </div>
                <div className="form-row" style={{ alignItems: 'center' }}>
                  <div>
                    <label style={{ fontSize: 'var(--fs-xs)' }}>Fecha de Inicio *</label>
                    <input name="fecha_inicio" type="date" value={tempExp.fecha_inicio} onChange={handleTempExpChange} />
                  </div>
                  <div>
                    <label style={{ fontSize: 'var(--fs-xs)', opacity: tempExp.actual ? 0.5 : 1 }}>Fecha de Fin</label>
                    <input name="fecha_fin" type="date" disabled={tempExp.actual} value={tempExp.actual ? '' : tempExp.fecha_fin} onChange={handleTempExpChange} />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" id="p-actual" name="actual" checked={tempExp.actual} onChange={handleTempExpChange} style={{ width: 'auto' }} />
                  <label htmlFor="p-actual" style={{ margin: 0, fontSize: 'var(--fs-sm)' }}>Trabajo actualmente aqui</label>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={saveExperience} className="secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}>
                    <Plus size={14} /> {editingExpIdx !== null ? 'Guardar cambios' : 'Agregar a mi CV'}
                  </button>
                  {editingExpIdx !== null && (
                    <button type="button" onClick={cancelEditExp} className="secondary" style={{ padding: '0.5rem 1rem' }}>Cancelar</button>
                  )}
                </div>
              </div>

              {/* Lista de experiencias */}
              <div className="experience-list">
                {experiencias.map((exp, idx) => (
                  <div key={idx} className="experience-card">
                    <div className="experience-card-header">
                      <div>
                        <span className="experience-org">{exp.organizacion}</span>
                        <span style={{ margin: '0 0.4rem', color: 'var(--text-muted)' }}>-</span>
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
                      <Calendar size={11} />
                      <span>{String(exp.fecha_inicio).slice(0, 10)} al {exp.actual ? 'Presente' : String(exp.fecha_fin || '').slice(0, 10)}</span>
                    </div>
                    {exp.responsabilidades && <p className="experience-desc">{exp.responsabilidades}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Habilidades */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--c-blue-dark)', margin: 0 }}>Conocimientos y Habilidades</h3>
              {[
                { field: 'idiomas',         label: 'Idiomas',                         placeholder: 'Ej. Ingles, Aleman...', val: newIdioma,   setVal: setNewIdioma   },
                { field: 'lenguajes',       label: 'Herramientas o Lenguajes',        placeholder: 'Ej. Excel, Python...',  val: newLenguaje, setVal: setNewLenguaje },
                { field: 'certificaciones', label: 'Certificaciones',                 placeholder: 'Ej. Scrum Master...',   val: newCert,     setVal: setNewCert     },
              ].map(({ field, label, placeholder, val, setVal }) => (
                <div className="form-group" key={field}>
                  <label>{label}</label>
                  <div className="tags-input-container">
                    <input type="text" placeholder={placeholder} value={val} onChange={e => setVal(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(field, val, setVal))} />
                    <button type="button" onClick={() => addTag(field, val, setVal)} className="secondary" style={{ padding: '0.65rem 1rem' }}><Plus size={14} /></button>
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
              <p role="alert" style={{ color: 'var(--c-red)', fontSize: 'var(--fs-sm)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                <FileText size={14} /> {error}
              </p>
            )}

            <button type="submit" className="btn-auth-submit" disabled={saving}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              {saving ? <><Loader2 size={16} className="animate-spin" /> Guardando...</> : <><Save size={16} /> Guardar Cambios</>}
            </button>
          </form>
        </main>
      </div>
    </div>
  )
}
