import { useState } from 'react'
import { X, Loader2, FolderOpen, Lightbulb, FlaskConical, TrendingUp, Rocket,
  Leaf, Microscope, HeartPulse, Globe, Handshake, BarChart3,
  Construction, GraduationCap, Sprout, Settings, Gem, Telescope,
  Cpu, Zap, Building2, TreePine, BookOpen } from 'lucide-react'

// Íconos disponibles — solo lucide-react, sin emojis
const ICONOS = [
  { id: 'Leaf',         Icon: Leaf },
  { id: 'Microscope',   Icon: Microscope },
  { id: 'HeartPulse',   Icon: HeartPulse },
  { id: 'Lightbulb',    Icon: Lightbulb },
  { id: 'Rocket',       Icon: Rocket },
  { id: 'Globe',        Icon: Globe },
  { id: 'Handshake',    Icon: Handshake },
  { id: 'BarChart3',    Icon: BarChart3 },
  { id: 'Construction', Icon: Construction },
  { id: 'GraduationCap',Icon: GraduationCap },
  { id: 'Sprout',       Icon: Sprout },
  { id: 'Settings',     Icon: Settings },
  { id: 'Cpu',          Icon: Cpu },
  { id: 'Zap',          Icon: Zap },
  { id: 'Building2',    Icon: Building2 },
  { id: 'TreePine',     Icon: TreePine },
  { id: 'BookOpen',     Icon: BookOpen },
  { id: 'Telescope',    Icon: Telescope },
]

const MADURACION_OPTIONS = [
  {
    value: 'idea',
    label: 'Idea',
    desc: 'Todavía no hay prototipo ni validación',
    icon: Lightbulb,
    etapa: 'Entra en Etapa 1 · Exploración',
  },
  {
    value: 'prototipo',
    label: 'Prototipo',
    desc: 'Existe algo concreto pero no hay ventas aún',
    icon: FlaskConical,
    etapa: 'Entra en Etapa 1 · Exploración',
  },
  {
    value: 'ventas',
    label: 'Con ventas',
    desc: 'Ya hay ventas reales, aunque sea a pequeña escala',
    icon: TrendingUp,
    etapa: 'Entra en Etapa 5 · Validación',
  },
  {
    value: 'negocio_en_marcha',
    label: 'Negocio en marcha',
    desc: 'Empresa o iniciativa ya operando',
    icon: Rocket,
    etapa: 'Entra en Etapa 6 · Estructuración',
  },
]

export default function ProjectModal({ proyecto = null, onClose, onSave }) {
  const isEdit = Boolean(proyecto)

  const [nombre, setNombre] = useState(proyecto?.nombre ?? '')
  const [objetivo, setObjetivo] = useState(proyecto?.objetivo ?? '')
  const [maduracion, setMaduracion] = useState(proyecto?.nivel_maduracion ?? 'idea')
  const [icono, setIcono] = useState(proyecto?.icono_forma ?? 'Leaf')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!nombre.trim()) { setError('El nombre es obligatorio'); return }
    setSaving(true)
    try {
      await onSave({ nombre, objetivo, nivel_maduracion: maduracion, icono_forma: icono })
      onClose()
    } catch (err) {
      setError(err.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,19,91,0.35)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: '#fff', borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-hover)', width: '100%', maxWidth: '520px',
          maxHeight: '90vh', overflowY: 'auto',
          padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem',
          animation: 'fadeInScale 0.15s ease',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--c-blue-dark)', margin: 0 }}>
            <FolderOpen size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            {isEdit ? 'Editar proyecto' : 'Nuevo proyecto'}
          </h2>
          <button
            onClick={onClose}
            style={{ all: 'unset', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Ícono */}
          <div className="form-group">
            <label style={{ fontWeight: 600 }}>Ícono del proyecto</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
              {ICONOS.map(({ id, Icon }) => (
                <button
                  key={id} type="button" onClick={() => setIcono(id)}
                  style={{
                    all: 'unset', cursor: 'pointer',
                    width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 'var(--radius-sm)',
                    border: '2px solid ' + (icono === id ? 'var(--c-blue-light)' : 'transparent'),
                    background: icono === id ? 'var(--c-blue-tint)' : 'var(--bg-main)',
                    transition: 'all 0.12s',
                    color: icono === id ? 'var(--c-blue-dark)' : 'var(--text-muted)',
                  }}
                >
                  <Icon size={20} />
                </button>
              ))}
            </div>
          </div>

          {/* Nombre */}
          <div className="form-group">
            <label htmlFor="p-nombre-modal" style={{ fontWeight: 600 }}>Nombre del proyecto *</label>
            <input
              id="p-nombre-modal" type="text"
              placeholder="Ej. BioTrack, CampusMed…"
              value={nombre} onChange={e => setNombre(e.target.value)}
              autoFocus
            />
          </div>

          {/* Objetivo */}
          <div className="form-group">
            <label htmlFor="p-objetivo-modal" style={{ fontWeight: 600 }}>Objetivo <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opcional)</span></label>
            <textarea
              id="p-objetivo-modal"
              placeholder="¿Qué problema resuelve o qué quieres lograr?"
              value={objetivo} onChange={e => setObjetivo(e.target.value)}
              style={{ minHeight: '80px', padding: '0.65rem', width: '100%', boxSizing: 'border-box',
                border: '1.5px solid var(--border-color)', borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-main)', fontSize: 'var(--fs-base)', resize: 'vertical' }}
            />
          </div>

          {/* Nivel de maduración — solo en creación */}
          {!isEdit && (
            <div className="form-group">
              <label style={{ fontWeight: 600 }}>¿En qué punto está tu proyecto?</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.4rem' }}>
                {MADURACION_OPTIONS.map(opt => {
                  const Icon = opt.icon
                  const selected = maduracion === opt.value
                  return (
                    <button
                      key={opt.value} type="button" onClick={() => setMaduracion(opt.value)}
                      style={{
                        all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'flex-start',
                        gap: '0.75rem', padding: '0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1.5px solid ' + (selected ? 'var(--c-blue-light)' : 'var(--border-color)'),
                        background: selected ? 'var(--c-blue-tint)' : '#fff',
                        transition: 'all 0.15s', width: '100%', boxSizing: 'border-box',
                      }}
                    >
                      <Icon size={18} style={{ color: selected ? 'var(--c-blue-dark)' : 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 'var(--fs-sm)', color: 'var(--text-primary)' }}>{opt.label}</p>
                        <p style={{ margin: 0, fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{opt.desc}</p>
                        {selected && <p style={{ margin: '0.2rem 0 0', fontSize: 'var(--fs-xs)', color: 'var(--c-blue-light)', fontWeight: 600 }}>{opt.etapa}</p>}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {error && (
            <p style={{ color: 'var(--c-red)', fontSize: 'var(--fs-sm)', fontWeight: 600, margin: 0 }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {saving ? <><Loader2 size={15} className="animate-spin" /> Guardando…</> : isEdit ? 'Guardar cambios' : 'Crear proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
