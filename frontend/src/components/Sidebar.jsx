import { Plus } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

/**
 * Sidebar del dashboard.
 * Props:
 *  - user: { nombre, roles, tipo_usuario, initials, foto_perfil_url } | null
 *  - onCreateProject: fn
 *  - activePath: string (ruta activa para resaltar nav items)
 */
export default function Sidebar({ user, onCreateProject, activePath, hasProjects = false }) {
  const navigate = useNavigate()
  const location = useLocation()
  const initials = user?.initials ?? user?.nombre?.slice(0, 2).toUpperCase() ?? '??'
  const isProfileActive = (activePath ?? location.pathname) === '/profile'

  // Mostrar todos los roles formateados. Si hay roles, los muestra separados por " / ".
  // Fallback a tipo_usuario (para compatibilidad) o '—'.
  const ROLE_LABELS = {
    estudiante:     'Estudiante',
    profesor:       'Profesor',
    investigador:   'Investigador',
    administrativo: 'Administrativo',
    graduado:       'Graduado',
    aliado:         'Aliado',
    externo:        'Externo',
  }
  // tipo_usuario puede ser un string con comas ("estudiante,graduado") o un solo valor.
  // roles[] es un campo calculado que puede no venir del backend — lo derivamos aquí.
  const rolesText = (() => {
    // 1. Preferir el array explícito si viene (desde Profile)
    const arr = user?.roles
    if (Array.isArray(arr) && arr.length > 0) {
      return arr.map(r => ROLE_LABELS[r] ?? r).join(' / ')
    }
    // 2. Derivar desde tipo_usuario (puede tener comas o ser un solo valor)
    const raw = user?.tipo_usuario ?? ''
    if (!raw) return '—'
    return raw.split(',').map(r => ROLE_LABELS[r.trim()] ?? r.trim()).join(' / ')
  })()

  const handleProfileClick = () => {
    navigate(isProfileActive ? '/dashboard' : '/profile')
  }

  return (
    <aside className="sidebar" aria-label="Panel lateral">
      {/* Perfil — clickeable para ir a /profile */}
      <button
        onClick={() => handleProfileClick()}
        style={{
          all: 'unset',
          cursor: 'pointer',
          width: '100%',
          display: 'block',
        }}
        title="Ver y editar mi perfil"
        aria-label="Ir a mi perfil"
      >
        <div
          className="sidebar-profile"
          style={{
            borderRadius: 'var(--radius-sm)',
            padding: '0.5rem',
            transition: 'background 0.15s',
            background: isProfileActive ? 'var(--route-transferencia-bg)' : 'transparent',
            outline: isProfileActive ? '1.5px solid var(--route-transferencia-border)' : 'none',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-main)'}
          onMouseLeave={e => e.currentTarget.style.background = isProfileActive ? 'var(--route-transferencia-bg)' : 'transparent'}
        >
          <div className="sidebar-avatar" aria-hidden="true">
            {user?.foto_perfil_url
              ? <img src={user.foto_perfil_url} alt="Foto de perfil" />
              : initials
            }
          </div>
          <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <p className="sidebar-name">{user?.nombre ?? 'Usuario'}</p>
            <p className="sidebar-role">{rolesText}</p>
          </div>
        </div>
      </button>

      {/* Acciones — solo visibles cuando ya hay proyectos */}
      {hasProjects && (
        <div className="sidebar-actions">
          <button id="btn-create-project" className="primary" onClick={onCreateProject}>
            <Plus size={15} />
            Crear proyecto
          </button>
        </div>
      )}
    </aside>
  )
}
