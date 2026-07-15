import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import '../styles/style.css'
import '../styles/germina.css'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Onboarding from './Onboarding'
import ProjectsGrid from '../components/ProjectsGrid'

export default function Dashboard() {
  // ── Todos los hooks primero, sin excepción ──
  const { user, profile, signOut, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [triggerCreate, setTriggerCreate] = useState(0)
  const [projectCount, setProjectCount]   = useState(null)

  // ── Early return DESPUÉS de todos los hooks ──
  if (profile && !profile.tipo_usuario) {
    return <Onboarding onComplete={refreshProfile} />
  }

  const rawName     = profile?.nombre ?? user?.user_metadata?.nombre ?? user?.email ?? 'Usuario'
  const nombre      = rawName.includes('@') ? rawName.split('@')[0] : rawName
  const initials    = nombre.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const tipoUsuario = profile?.tipo_usuario ?? 'Por definir'

  const handleSignOut = async () => { await signOut(); navigate('/') }

  return (
    <div className="app-shell">
      <Header
        userName={nombre}
        userInitials={initials}
        onUserClick={handleSignOut}
      />

      <div className="app-body">
        <Sidebar
          user={{ nombre, roles: profile?.roles ?? [], tipo_usuario: tipoUsuario, initials, foto_perfil_url: null }}
          hasProjects={projectCount !== null && projectCount > 0}
          onCreateProject={() => setTriggerCreate(t => t + 1)}
        />

        <main className="workspace" id="main-workspace" style={{ padding: 0 }}>
          <ProjectsGrid
            triggerCreate={triggerCreate}
            onCountChange={setProjectCount}
            onOpenProject={(p) => navigate(`/proyecto/${p.id}`)}
          />
        </main>
      </div>
    </div>
  )
}
