import { useState, useRef, useEffect, useCallback } from 'react'
import { FolderOpen, Pencil, Trash2, Plus, Loader2, AlertTriangle,
  Leaf, Microscope, HeartPulse, Lightbulb, Rocket, Globe, Handshake,
  BarChart3, Construction, GraduationCap, Sprout, Settings, Cpu,
  Zap, Building2, TreePine, BookOpen, Telescope } from 'lucide-react'
import { apiFetch } from '../lib/api.js'
import ProjectModal from './ProjectModal.jsx'

// Mapa de id → componente Lucide (mismo set que ProjectModal)
const LUCIDE_ICONS = {
  Leaf, Microscope, HeartPulse, Lightbulb, Rocket, Globe, Handshake,
  BarChart3, Construction, GraduationCap, Sprout, Settings, Cpu,
  Zap, Building2, TreePine, BookOpen, Telescope,
}
function ProjectIcon({ id, size = 28, color }) {
  const Icon = LUCIDE_ICONS[id] ?? Sprout
  return <Icon size={size} color={color} strokeWidth={1.8} />
}

// ─── Colores por ruta (Proceso_de_Innovacion.md §3.6) ───
const RUTA_STYLES = {
  tronco:              { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E', label: 'Innovación' },
  emprendimiento:      { bg: '#D1FAE5', border: '#10B981', text: '#065F46', label: 'Emprendimiento' },
  transferencia:       { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF', label: 'Transferencia' },
  intraemprendimiento: { bg: '#EDE9FE', border: '#8B5CF6', text: '#4C1D95', label: 'Intraemprendimiento' },
  sin_definir:         { bg: '#F3F4F6', border: '#9CA3AF', text: '#374151', label: 'Sin ruta' },
}

const ETAPA_NOMBRES = {
  '-1': 'Caracterización', '0': 'Creación', '1': 'Exploración',
  '2': 'Definición', '3': 'Ideación', '4': 'Prototipado',
  '5': 'Validación', '6': 'Estructuración', '7': 'Implementación',
}

function getRutaKey(proyecto) {
  if (!proyecto.ruta) return 'tronco'
  return proyecto.ruta
}

function formatRelativeTime(isoDate) {
  if (!isoDate) return '—'
  const diff = Date.now() - new Date(isoDate).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'ahora mismo'
  if (m < 60) return `hace ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `hace ${h}h`
  const d = Math.floor(h / 24)
  return `hace ${d}d`
}

// ─── Menú contextual flotante ───
function ProjectMenu({ proyecto, anchor, onClose, onOpen, onEdit, onDelete }) {
  const menuRef = useRef(null)
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const top  = Math.min(anchor.y, window.innerHeight - 170)
  const left = Math.min(anchor.x, window.innerWidth  - 185)

  return (
    <div ref={menuRef} role="menu"
      style={{
        position: 'fixed', top, left, background: '#fff', borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-hover)', border: '1px solid var(--border-color)',
        padding: '0.4rem', zIndex: 1000, minWidth: '165px', animation: 'fadeInScale 0.12s ease',
      }}
    >
      <button className="project-menu-item" onClick={() => { onOpen(proyecto); onClose() }}>
        <FolderOpen size={14} /> Abrir
      </button>
      <button className="project-menu-item" onClick={() => { onEdit(proyecto); onClose() }}>
        <Pencil size={14} /> Editar
      </button>
      <div style={{ height: '1px', background: 'var(--border-color)', margin: '0.25rem 0' }} />
      <button className="project-menu-item danger" onClick={() => { onDelete(proyecto); onClose() }}>
        <Trash2 size={14} /> Eliminar
      </button>
    </div>
  )
}

// ─── Tarjeta de proyecto ───
function ProjectCard({ proyecto, onMenuOpen }) {
  const rutaKey = getRutaKey(proyecto)
  const style   = RUTA_STYLES[rutaKey] ?? RUTA_STYLES.sin_definir
  const etapa   = ETAPA_NOMBRES[String(proyecto.etapa_actual)] ?? `Etapa ${proyecto.etapa_actual}`

  const handleClick = (e) => {
    e.stopPropagation()
    onMenuOpen(proyecto, { x: e.clientX + 8, y: e.clientY + 8 })
  }

  return (
    <button className="project-card" onClick={handleClick}
      aria-label={`Proyecto ${proyecto.nombre}, ${etapa}`}
      style={{ '--ruta-bg': style.bg, '--ruta-border': style.border, '--ruta-text': style.text }}
    >
      <div className="project-card-icon" style={{ background: style.bg, border: `2px solid ${style.border}` }}>
        <ProjectIcon id={proyecto.icono_forma} size={28} color={style.border} />
      </div>
      <span className="project-ruta-chip" style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }}>
        {style.label}
      </span>
      <p className="project-card-name">{proyecto.nombre}</p>
      <p className="project-card-stage">
        <span className="project-stage-dot" style={{ background: style.border }} />
        {etapa}
      </p>
      <p className="project-card-time">{formatRelativeTime(proyecto.ultima_actividad_en)}</p>
    </button>
  )
}

// ─── Diálogo de confirmación de borrado ───
function DeleteConfirm({ proyecto, onCancel, onConfirm, loading }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,19,91,0.4)',
      backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div style={{
        background: '#fff', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-hover)',
        padding: '2rem', maxWidth: '380px', width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem',
        animation: 'fadeInScale 0.15s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--c-red)' }}>
          <AlertTriangle size={22} />
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Eliminar proyecto</h3>
        </div>
        <p style={{ margin: 0, fontSize: 'var(--fs-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          ¿Estás seguro de que quieres eliminar <strong>{proyecto.nombre}</strong>? Esta acción no se puede deshacer y borrará toda la bitácora y mensajes asociados.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="secondary" onClick={onCancel}>Cancelar</button>
          <button className="primary"
            style={{ background: 'var(--c-red)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            onClick={onConfirm} disabled={loading}
          >
            {loading ? <><Loader2 size={14} className="animate-spin" /> Eliminando…</> : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Grid principal ───
export default function ProjectsGrid({ onOpenProject, triggerCreate = 0, onCountChange }) {
  const [proyectos, setProyectos]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [menu, setMenu]               = useState(null)
  const [modal, setModal]             = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting]       = useState(false)

  // Abre el modal de crear cuando el Sidebar pulsa "Crear proyecto"
  useEffect(() => {
    if (triggerCreate > 0) setModal('create')
  }, [triggerCreate])

  // ── Cargar proyectos ──
  const fetchProyectos = useCallback(async () => {
    try {
      const { proyectos: data } = await apiFetch('/proyectos')
      setProyectos(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Notifica al padre cada vez que cambia la lista
  useEffect(() => { onCountChange?.(proyectos.length) }, [proyectos, onCountChange])

  useEffect(() => { fetchProyectos() }, [fetchProyectos])

  const handleCreate = async (payload) => {
    const { proyecto } = await apiFetch('/proyectos', { method: 'POST', body: JSON.stringify(payload) })
    setProyectos(prev => [proyecto, ...prev])
  }

  // ── Editar ──
  const handleEdit = async (payload) => {
    const { id } = modal.proyecto
    const { proyecto } = await apiFetch(`/proyectos/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
    setProyectos(prev => prev.map(p => p.id === id ? proyecto : p))
  }

  // ── Eliminar ──
  const handleDeleteConfirm = async () => {
    setDeleting(true)
    try {
      await apiFetch(`/proyectos/${deleteTarget.id}`, { method: 'DELETE' })
      setProyectos(prev => prev.filter(p => p.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  // ── Abrir ──
  const handleOpen = (p) => { if (onOpenProject) onOpenProject(p) }

  if (loading) {
    return (
      <div className="projects-workspace" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
        <Loader2 size={24} className="animate-spin" /> Cargando proyectos…
      </div>
    )
  }

  return (
    <div className="projects-workspace" onClick={() => setMenu(null)}>
      {/* Header — solo título y contador, sin botón duplicado */}
      <div className="projects-header">
        <div>
          <h2 className="projects-title">Mis proyectos</h2>
          <p className="projects-subtitle">{proyectos.length} proyecto{proyectos.length !== 1 ? 's' : ''} activo{proyectos.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {error && (
        <p style={{ color: 'var(--c-red)', fontSize: 'var(--fs-sm)', marginBottom: '1rem', fontWeight: 600 }}>
          <AlertTriangle size={14} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} /> {error}
        </p>
      )}

      {/* Grid o estado vacío */}
      {proyectos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Plus size={40} strokeWidth={1.5} /></div>
          <h3>Sin proyectos todavía</h3>
          <p>Crea tu primer proyecto para comenzar tu proceso de innovación en Germina.</p>
          <button className="primary" onClick={() => setModal('create')}>
            <Plus size={16} /> Crear mi primer proyecto
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {proyectos.map(p => (
            <ProjectCard key={p.id} proyecto={p} onMenuOpen={(proj, anchor) => { setMenu({ proyecto: proj, anchor }) }} />
          ))}
        </div>
      )}

      {/* Menú contextual */}
      {menu && (
        <ProjectMenu
          proyecto={menu.proyecto}
          anchor={menu.anchor}
          onClose={() => setMenu(null)}
          onOpen={handleOpen}
          onEdit={(p) => setModal({ proyecto: p })}
          onDelete={(p) => setDeleteTarget(p)}
        />
      )}

      {/* Modal crear / editar */}
      {modal && (
        <ProjectModal
          proyecto={modal === 'create' ? null : modal.proyecto}
          onClose={() => setModal(null)}
          onSave={modal === 'create' ? handleCreate : handleEdit}
        />
      )}

      {/* Confirmación de borrado */}
      {deleteTarget && (
        <DeleteConfirm
          proyecto={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          loading={deleting}
        />
      )}
    </div>
  )
}
