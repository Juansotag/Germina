import { useNavigate } from 'react-router-dom'
import { Sprout, Bot, FileText, Mic, ArrowRight, CheckCircle } from 'lucide-react'
import '../styles/style.css'
import '../styles/germina.css'
import '../styles/landing.css'
import logoAzulUrl    from '../assets/branding/logo_azul.png'
import logoBlancoUrl  from '../assets/branding/logo_blanco.png'
import govlabLogoUrl  from '../assets/branding/GovLab_blanco.png'

// ── Datos ────────────────────────────────────────────────────────────────────
const FEATURES = [
  { Icon: Bot,      titulo: 'Asistente con IA',        desc: 'Claude acompaña cada sesión, hace preguntas, sugiere herramientas y registra tus avances automáticamente.' },
  { Icon: Sprout,   titulo: 'Proceso estructurado',    desc: 'Un recorrido claro que adapta las herramientas y los objetivos según el momento de tu proyecto.' },
  { Icon: FileText, titulo: 'Documentos profesionales',desc: 'Genera entregables en Word con identidad GovLab listos para compartir con aliados o inversionistas.' },
  { Icon: Mic,      titulo: 'Entrada por voz',          desc: 'Habla en lugar de escribir. Germina transcribe y procesa tu idea directamente desde el micrófono.' },
]

// ── Diagrama del proceso ─────────────────────────────────────────────────────
function ProcesoDiagram() {
  const C = {
    trunk: '#F8A719', // amarillo  — innovación / Design Thinking
    emp:   '#2E9E4F', // verde     — emprendimiento
    intra: '#7B3FA0', // morado    — intraemprendimiento
    trans: '#00387D', // azul      — transferencia
    muted: '#64748B',
  }

  const TRUNK = [
    { id: 1, label: 'Exploración' },
    { id: 2, label: 'Definición' },
    { id: 3, label: 'Ideación' },
    { id: 4, label: 'Prototipado' },
    { id: 5, label: 'Validación' },
  ]

  const RAMAS = [
    { key: 'emp',   color: C.emp,   title: 'Emprendimiento',      e6: 'Business Model Canvas',   e7: 'Lanzamiento',            dy: -180 },
    { key: 'intra', color: C.intra, title: 'Intraemprendimiento', e6: 'Caso de negocio interno', e7: 'Piloto organizacional',  dy:    0 },
    { key: 'trans', color: C.trans, title: 'Transferencia',       e6: 'Ficha OTRI',              e7: 'Ciclo de transferencia', dy:  180 },
  ]

  // Geometría
  const W = 940, H = 620
  const TY = H / 2          // y del tronco = 310
  const NR = 24             // radio nodo tronco
  const BR = 21             // radio nodo rama

  // Nodos 1-5: de x=55 hasta x=300  ← SEPARADOS del diamante
  const N0 = 55, N5 = 300
  const xs = TRUNK.map((_, i) => N0 + i * (N5 - N0) / 4)

  // Diamante: a la derecha del nodo 5, con hueco claro
  const FX  = 400           // centro del diamante
  const FD  = 18            // semidiámetro
  const FL  = FX - FD       // vértice izq (382) — donde llega la línea del tronco
  const FR  = FX + FD       // vértice der (418) — de donde salen las ramas

  // Nodos de rama
  const X6 = 570, X7 = 770

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%"
      role="img" aria-label="Diagrama del proceso de innovación Germina"
      style={{ maxWidth: 940, display: 'block', margin: '0 auto', overflow: 'visible' }}>

      <defs>
        <filter id="ns" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* ══ CAPA 1: LÍNEAS (primero = detrás de todo) ══ */}

      {/* Tronco continuo: nodo 1 → nodo 5 */}
      <line x1={xs[0]} y1={TY} x2={N5} y2={TY}
        stroke={C.trunk} strokeWidth="3.5" strokeLinecap="round" />

      {/* Conector punteado: nodo 5 → vértice izq del diamante */}
      <line x1={N5 + NR + 4} y1={TY} x2={FL} y2={TY}
        stroke={C.trunk} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="6 4" />

      {/* Ramas: diamond → E6 y E6 → E7 */}
      {RAMAS.map(({ key, color, dy }) => {
        const bY = TY + dy
        return (
          <g key={`ln-${key}`}>
            {dy === 0 ? (
              /* Intraemprendimiento: línea recta horizontal (dy=0), siempre visible */
              <line x1={FR} y1={TY} x2={X6 - BR - 5} y2={TY}
                stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            ) : (
              /* Emprendimiento / Transferencia: curva Bezier */
              <path
                d={`M ${FR} ${TY} C ${FR + 90} ${TY}, ${X6 - 80} ${bY}, ${X6 - BR - 5} ${bY}`}
                fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            )}
            {/* E6 → E7 */}
            <line x1={X6 + BR + 5} y1={bY} x2={X7 - BR - 5} y2={bY}
              stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )
      })}

      {/* ══ CAPA 2: DIAMANTE DE BIFURCACIÓN ══ */}
      {(() => {
        const pts = [`${FX},${TY - FD}`, `${FR},${TY}`, `${FX},${TY + FD}`, `${FL},${TY}`].join(' ')
        return (
          <g>
            <polygon points={pts} fill="white" filter="url(#ns)" />
            <polygon points={pts} fill={C.muted} fillOpacity="0.06"
              stroke={C.muted} strokeWidth="1.5" strokeDasharray="4 3" />
            <text x={FX} y={TY + FD + 16} textAnchor="middle"
              fill={C.muted} fontSize="9.5" fontStyle="italic"
              fontFamily="var(--font-main,'Libre Franklin',sans-serif)">
              Bifurcación
            </text>
          </g>
        )
      })()}

      {/* ══ CAPA 3: NODOS DEL TRONCO (sobre las líneas) ══ */}
      {TRUNK.map((etapa, i) => {
        const x = xs[i]
        return (
          <g key={`t${etapa.id}`}>
            <circle cx={x} cy={TY} r={NR + 4} fill="white" filter="url(#ns)" />
            <circle cx={x} cy={TY} r={NR} fill={C.trunk} />
            <text x={x} y={TY + 1} textAnchor="middle" dominantBaseline="middle"
              fill="#00135B" fontSize="13" fontWeight="700"
              fontFamily="var(--font-heading,'Cabinet Grotesk',sans-serif)">
              {etapa.id}
            </text>
            <text x={x} y={TY - NR - 13} textAnchor="middle"
              fill="#92400e" fontSize="11" fontWeight="600"
              fontFamily="var(--font-heading,'Cabinet Grotesk',sans-serif)">
              {etapa.label}
            </text>
          </g>
        )
      })}

      {/* Etiqueta del tronco */}
      <text x={(xs[0] + FX) / 2} y={TY + NR + 22} textAnchor="middle"
        fill={C.muted} fontSize="10.5" fontStyle="italic"
        fontFamily="var(--font-main,'Libre Franklin',sans-serif)">
        Tronco común · Design Thinking
      </text>

      {/* ══ CAPA 4: NODOS DE RAMA (sobre las curvas) ══ */}
      {RAMAS.map(({ key, color, title, e6, e7, dy }) => {
        const bY = TY + dy
        return (
          <g key={`b${key}`}>
            <circle cx={X6} cy={bY} r={BR + 4} fill="white" filter="url(#ns)" />
            <circle cx={X6} cy={bY} r={BR} fill={color} />
            <text x={X6} y={bY + 1} textAnchor="middle" dominantBaseline="middle"
              fill="white" fontSize="12" fontWeight="700"
              fontFamily="var(--font-heading,'Cabinet Grotesk',sans-serif)">6</text>

            <circle cx={X7} cy={bY} r={BR + 4} fill="white" filter="url(#ns)" />
            <circle cx={X7} cy={bY} r={BR} fill={color} />
            <text x={X7} y={bY + 1} textAnchor="middle" dominantBaseline="middle"
              fill="white" fontSize="12" fontWeight="700"
              fontFamily="var(--font-heading,'Cabinet Grotesk',sans-serif)">7</text>

            <text x={(X6 + X7) / 2} y={bY - BR - 13} textAnchor="middle"
              fill={color} fontSize="12" fontWeight="700"
              fontFamily="var(--font-heading,'Cabinet Grotesk',sans-serif)">
              {title}
            </text>

            <text x={X6} y={bY + BR + 15} textAnchor="middle"
              fill={C.muted} fontSize="9.5"
              fontFamily="var(--font-main,'Libre Franklin',sans-serif)">{e6}</text>
            <text x={X7} y={bY + BR + 15} textAnchor="middle"
              fill={C.muted} fontSize="9.5"
              fontFamily="var(--font-main,'Libre Franklin',sans-serif)">{e7}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Componente principal ─────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="landing-root">

      {/* ── Navbar ─── */}
      <nav className="landing-nav" role="navigation" aria-label="Navegación principal">
        <div className="landing-nav-inner">
          <div className="landing-nav-brand">
            <img src={logoAzulUrl} alt="Germina" className="landing-nav-logo" />
            <span className="landing-nav-name">Germina</span>
          </div>
          <div className="landing-nav-actions">
            <button id="btn-nav-login"    className="btn-nav-ghost"   onClick={() => navigate('/login')}>Iniciar sesión</button>
            <button id="btn-nav-register" className="btn-nav-primary" onClick={() => navigate('/registro')}>Crear cuenta</button>
          </div>
        </div>
      </nav>

      {/* ── Hero ─── */}
      <section className="landing-hero-v2" aria-label="Presentación">
        <div className="landing-hero-inner">
          <div className="hero-badge">
            <Sprout size={13} />
            GovLab · Universidad de La Sabana
          </div>
          <h1 className="hero-title">
            Tu proceso de innovación,<br />acompañado de principio a fin
          </h1>
          <p className="hero-subtitle">
            Germina es el asistente inteligente del Laboratorio de Gobierno que te guía
            a través de un proceso de Design Thinking y luego te orienta hacia la ruta
            correcta: emprendimiento, intraemprendimiento o transferencia de conocimiento.
          </p>
          <div className="hero-actions">
            <button id="btn-hero-register" className="btn-hero-primary" onClick={() => navigate('/registro')}>
              Comenzar gratis <ArrowRight size={16} />
            </button>
            <button id="btn-hero-login" className="btn-hero-ghost" onClick={() => navigate('/login')}>
              Ya tengo cuenta
            </button>
          </div>
          <p className="hero-disclaimer">Solo disponible para la comunidad UniSabana</p>
        </div>
        <div className="hero-orb hero-orb-1" aria-hidden="true" />
        <div className="hero-orb hero-orb-2" aria-hidden="true" />
        <div className="hero-orb hero-orb-3" aria-hidden="true" />
      </section>

      {/* ── Diagrama del proceso ─── */}
      <section className="landing-section landing-section-light" aria-labelledby="proceso-title">
        <div className="section-inner">
          <div className="section-header">
            <h2 id="proceso-title" className="section-title">Un tronco común, tres destinos posibles</h2>
            <p className="section-desc">
              Todas las ideas recorren las mismas cinco etapas de Design Thinking.
              Al validar, el proceso se bifurca hacia la ruta que mejor encaja con
              tu proyecto y contexto.
            </p>
          </div>
          <div className="proceso-diagram-wrap">
            <ProcesoDiagram />
          </div>
          <div className="proceso-legend-pills">
            <span className="legend-pill legend-emp">Emprendimiento — Business Model Canvas</span>
            <span className="legend-pill legend-intra">Intraemprendimiento — Caso de negocio interno</span>
            <span className="legend-pill legend-trans">Transferencia — Ciclo OTRI</span>
          </div>
        </div>
      </section>

      {/* ── Features ─── */}
      <section className="landing-section landing-section-dark" aria-labelledby="features-title">
        <div className="section-inner">
          <div className="section-header section-header-light">
            <h2 id="features-title" className="section-title">Todo lo que necesitas en un solo lugar</h2>
          </div>
          <div className="features-grid">
            {FEATURES.map(({ Icon, titulo, desc }) => (
              <article key={titulo} className="feature-card-dark-only">
                <div className="feature-icon-dark" aria-hidden="true">
                  <Icon size={20} />
                </div>
                <h3 className="feature-titulo-light">{titulo}</h3>
                <p className="feature-desc-light">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ─── */}
      <section className="landing-cta-section" aria-labelledby="cta-title">
        <div className="landing-hero-orb-cta" aria-hidden="true" />
        <div className="section-inner cta-inner">
          <h2 id="cta-title" className="cta-title">Comienza tu proceso hoy</h2>
          <p className="cta-desc">
            Crea tu cuenta con tu correo institucional y empieza a estructurar tu idea en minutos.
          </p>
          <div className="cta-checks">
            {[
              'Sin costo para la comunidad UniSabana',
              'Acompañamiento con IA en cada sesión',
              'Documentos profesionales generados automáticamente',
            ].map(c => (
              <span key={c} className="cta-check"><CheckCircle size={15} />{c}</span>
            ))}
          </div>
          <button id="btn-cta-register" className="btn-cta-primary" onClick={() => navigate('/registro')}>
            Crear cuenta gratis <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── Footer ─── */}
      <footer className="landing-footer" role="contentinfo">
        <div className="footer-inner">
          <div className="footer-brand">
            <img src={logoBlancoUrl} alt="Germina" className="footer-logo" />
            <span className="footer-brand-name">Germina</span>
          </div>
          <div className="footer-govlab">
            <img src={govlabLogoUrl} alt="GovLab" className="footer-govlab-logo" />
            <span>Laboratorio de Gobierno · Universidad de La Sabana</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
