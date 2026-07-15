import logoBlancoUrl from '../assets/branding/logo_blanco.png'
import govlabLogoUrl from '../assets/branding/GovLab_blanco.png'

/**
 * Header fijo con doble logo: Germina (logo_blanco.png) + divisor + GovLab
 * Sigue la convención establecida en otras herramientas del GovLab (3.11).
 *
 * Props:
 *  - userName: string | null   (nombre del usuario logueado)
 *  - userInitials: string      (2 letras para el avatar)
 *  - onUserClick: fn           (abre menú de usuario)
 */
export default function Header({ userName, userInitials = '?', onUserClick }) {
  return (
    <header className="germina-header">
      <div className="germina-header-inner">
        {/* Lado izquierdo: doble logo */}
        <div className="germina-brand">
          <img
            src={logoBlancoUrl}
            alt="Germina"
            className="germina-logo"
          />
          <div className="header-divider" aria-hidden="true" />
          <img
            src={govlabLogoUrl}
            alt="GovLab Universidad de La Sabana"
            className="govlab-logo"
          />
        </div>

        {/* Lado derecho: chip de usuario (visible solo si hay sesión) */}
        {userName && (
          <div className="germina-header-right">
            <button
              className="header-signout-btn"
              onClick={onUserClick}
              aria-label="Cerrar sesión"
              id="header-user-chip"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
