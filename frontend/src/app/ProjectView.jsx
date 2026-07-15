import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Loader2, Send, Leaf, Microscope, HeartPulse, Lightbulb, Rocket,
  Globe, Handshake, BarChart3, Construction, GraduationCap, Sprout,
  Settings, Cpu, Zap, Building2, TreePine, BookOpen, Telescope,
  MessageSquare, Clock, ChevronRight, CheckSquare, Square, ListTodo,
  TrendingUp, TrendingDown, Route, RefreshCw, FileText, X, Plus,
  Mic, MicOff, Download, FileDown, Trash2, GitBranch,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { apiFetch } from '../lib/api.js'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/AuthContext.jsx'
import Header from '../components/Header.jsx'
import '../styles/style.css'
import '../styles/germina.css'

// ─── Icono del proyecto ───────────────────────────────────────────────────
const LUCIDE_ICONS = {
  Leaf, Microscope, HeartPulse, Lightbulb, Rocket, Globe, Handshake,
  BarChart3, Construction, GraduationCap, Sprout, Settings, Cpu,
  Zap, Building2, TreePine, BookOpen, Telescope,
}
function ProjectIcon({ id, size = 20, color }) {
  const Icon = LUCIDE_ICONS[id] ?? Sprout
  return <Icon size={size} color={color} strokeWidth={1.8} />
}

// ─── Colores de ruta ──────────────────────────────────────────────────────
const RUTA_STYLES = {
  tronco:              { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E', label: 'Innovacion' },
  emprendimiento:      { bg: '#D1FAE5', border: '#10B981', text: '#065F46', label: 'Emprendimiento' },
  transferencia:       { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF', label: 'Transferencia' },
  intraemprendimiento: { bg: '#EDE9FE', border: '#8B5CF6', text: '#4C1D95', label: 'Intraemprendimiento' },
}
const ETAPA_NOMBRES = {
  '-1': 'Caracterizacion', '0': 'Creacion', '1': 'Exploracion',
  '2': 'Definicion', '3': 'Ideacion', '4': 'Prototipado',
  '5': 'Validacion', '6': 'Estructuracion', '7': 'Implementacion',
}

function getRutaStyle(proyecto) {
  const key = proyecto?.ruta || 'tronco'
  return RUTA_STYLES[key] ?? RUTA_STYLES.tronco
}

// ─── Etiqueta visual de tool call ─────────────────────────────────────────
const TOOL_LABELS = {
  agregar_tarea:              { icon: ListTodo,   label: 'Tarea agregada',        color: '#10B981' },
  completar_tarea:            { icon: CheckSquare, label: 'Tarea completada',      color: '#6366F1' },
  actualizar_resumen_proceso: { icon: RefreshCw,  label: 'Resumen actualizado',   color: '#F59E0B' },
  registrar_ruta:             { icon: GitBranch,  label: 'Ruta registrada',        color: '#8B5CF6' },
  bifurcacion:                { icon: GitBranch,  label: 'Bifurcación de ruta',    color: '#8B5CF6' },
  avanzar_etapa:              { icon: TrendingUp, label: 'Etapa avanzada',         color: '#10B981' },
  retroceder_etapa:           { icon: TrendingDown, label: 'Etapa retrocedida',   color: '#EF4444' },
  generar_documento:          { icon: FileDown,   label: 'Documento generado',     color: '#3B82F6' },
}

function ToolCallChip({ toolCall }) {
  const meta = TOOL_LABELS[toolCall.tool] ?? { icon: FileText, label: toolCall.tool, color: '#6B7280' }
  const Icon = meta.icon
  let detail = ''
  if (toolCall.input.descripcion) detail = toolCall.input.descripcion
  else if (toolCall.input.nueva_etapa !== undefined) detail = `Etapa ${toolCall.input.nueva_etapa}`
  else if (toolCall.input.ruta) detail = toolCall.input.ruta
  else if (toolCall.input.resumen) detail = toolCall.input.resumen.slice(0, 60) + '...'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.4rem',
      padding: '0.3rem 0.75rem', borderRadius: '50px',
      background: meta.color + '15', border: `1px solid ${meta.color}40`,
      fontSize: '0.72rem', color: meta.color, fontWeight: 600,
      margin: '0.25rem 0', alignSelf: 'center', maxWidth: '80%',
    }}>
      <Icon size={12} />
      <span>{meta.label}</span>
      {detail && <span style={{ color: '#6B7280', fontWeight: 400 }}>· {detail}</span>}
    </div>
  )
}

// ─── Burbuja de mensaje ───────────────────────────────────────────────────
function MessageBubble({ mensaje }) {
  const isUser = mensaje.rol === 'usuario'
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '0.75rem',
    }}>
      <div style={{
        maxWidth: '72%',
        padding: '0.75rem 1rem',
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        background: isUser ? 'var(--c-blue-dark)' : '#fff',
        color: isUser ? '#fff' : 'var(--text-primary)',
        fontSize: 'var(--fs-sm)',
        lineHeight: 1.6,
        boxShadow: 'var(--shadow)',
        border: isUser ? 'none' : '1px solid var(--border-color)',
        wordBreak: 'break-word',
      }}>
        {isUser ? (
          <span style={{ whiteSpace: 'pre-wrap' }}>{mensaje.contenido}</span>
        ) : (
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{mensaje.contenido}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Item de entrada de bitácora ──────────────────────────────────────────
function EntradaItem({ entrada, isActive, onClick }) {
  const etapa = ETAPA_NOMBRES[String(entrada.etapa_en_ese_momento)] ?? `Etapa ${entrada.etapa_en_ese_momento}`
  const rutaKey = entrada.ruta_en_ese_momento || 'tronco'
  const style = RUTA_STYLES[rutaKey] ?? RUTA_STYLES.tronco
  const fecha = new Date(entrada.iniciada_en)
  const fechaLabel = fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
  const msgCount = entrada.mensajes?.length ?? 0

  return (
    <button
      onClick={onClick}
      style={{
        all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center',
        gap: '0.6rem', padding: '0.65rem 0.75rem',
        borderRadius: 'var(--radius-sm)',
        background: isActive ? 'var(--c-blue-tint)' : 'transparent',
        border: isActive ? '1.5px solid var(--c-blue-soft)' : '1.5px solid transparent',
        width: '100%', boxSizing: 'border-box', transition: 'all 0.12s',
      }}
    >
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: style.border, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {etapa}
        </p>
        <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)' }}>
          {fechaLabel} · {msgCount} mensaje{msgCount !== 1 ? 's' : ''}
        </p>
      </div>
      {isActive && <ChevronRight size={12} style={{ color: 'var(--c-blue-soft)', flexShrink: 0 }} />}
    </button>
  )
}

// ─── Item de tarea (solo visual, el agente la completa) ────────────────────────────────────────
function TareaItem({ tarea }) {
  const completada = tarea.estado === 'completada'
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
      padding: '0.4rem 0', width: '100%', boxSizing: 'border-box',
      opacity: completada ? 0.5 : 1,
    }}>
      {completada
        ? <CheckSquare size={14} style={{ color: '#10B981', flexShrink: 0, marginTop: 2 }} />
        : <Square size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }} />
      }
      <span style={{
        fontSize: '0.72rem', lineHeight: 1.45, color: 'var(--text-secondary)',
        textDecoration: completada ? 'line-through' : 'none',
      }}>
        {tarea.descripcion}
      </span>
    </div>
  )
}

// ─── Item de documento ───────────────────────────────────────────────────
function DocumentoItem({ doc, onDelete }) {
  const [confirmando, setConfirmando] = useState(false)
  const fecha = new Date(doc.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
      <a
        href={doc.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.4rem 0.5rem', borderRadius: 'var(--radius-sm)',
          textDecoration: 'none', color: 'var(--text-secondary)',
          fontSize: '0.72rem', minWidth: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-main)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <FileText size={13} style={{ color: '#3B82F6', flexShrink: 0 }} />
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.nombre}</span>
        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', flexShrink: 0 }}>{fecha}</span>
        <Download size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
      </a>
      {confirmando ? (
        <>
          <button
            onClick={() => { setConfirmando(false); onDelete(doc.id) }}
            style={{ all: 'unset', cursor: 'pointer', fontSize: '0.6rem', color: 'var(--c-red)', fontWeight: 700, whiteSpace: 'nowrap' }}
          >Borrar</button>
          <button
            onClick={() => setConfirmando(false)}
            style={{ all: 'unset', cursor: 'pointer', fontSize: '0.6rem', color: 'var(--text-muted)' }}
          >No</button>
        </>
      ) : (
        <button
          onClick={() => setConfirmando(true)}
          style={{ all: 'unset', cursor: 'pointer', padding: '0.2rem', borderRadius: '4px', color: 'var(--text-muted)', display: 'flex' }}
          title="Eliminar documento"
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--c-red)'; e.currentTarget.style.background = '#FEF2F2' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  )
}

export default function ProjectView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const [proyecto, setProyecto]           = useState(null)
  const [entradas, setEntradas]           = useState([])
  const [tareas, setTareas]               = useState([])
  const [documentos, setDocumentos]       = useState([])
  const [entradaActiva, setEntradaActiva] = useState(null)
  const [loadingPage, setLoadingPage]     = useState(true)
  const [sending, setSending]             = useState(false)
  const [input, setInput]                 = useState('')
  const [error, setError]                 = useState('')
  const [lastToolCalls, setLastToolCalls] = useState([])
  const [showCompletadas, setShowCompletadas] = useState(false)
  const [sessionVigente, setSessionVigente]   = useState(null) // id de entrada activa o null

  // ── Grabacion de voz ──
  const [recording, setRecording]         = useState(false)
  const [transcribing, setTranscribing]   = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef   = useRef([])

  const messagesEndRef = useRef(null)
  const textareaRef    = useRef(null)

  // ── Cargar proyecto y bitácora ──
  const loadData = useCallback(async () => {
    try {
      const [{ proyecto: p }, bitacoraData, docsData, vigenteData] = await Promise.all([
        apiFetch(`/proyectos/${id}`),
        apiFetch(`/chat/${id}/bitacora`),
        apiFetch(`/documentos/${id}`).catch(() => ({ documentos: [] })),
        apiFetch(`/chat/${id}/vigente`).catch(() => ({ vigente: null })),
      ])
      setProyecto(p)
      setEntradas(bitacoraData.entradas)
      setTareas(bitacoraData.tareas ?? [])
      setDocumentos(docsData.documentos ?? [])
      setSessionVigente(vigenteData.vigente)
      if (bitacoraData.entradas.length > 0)
        setEntradaActiva(bitacoraData.entradas[bitacoraData.entradas.length - 1])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingPage(false)
    }
  }, [id])

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entradaActiva?.mensajes])

  // Los chips de tool-calls ahora son persistentes (rol='evento'), no necesitan timer

  // ── Enviar mensaje ──
  const handleSend = async () => {
    const texto = input.trim()
    if (!texto || sending) return
    setInput('')
    setSending(true)
    setError('')
    setLastToolCalls([])

    const msgTemp = { id: 'temp-' + Date.now(), rol: 'usuario', contenido: texto, created_at: new Date().toISOString() }
    setEntradaActiva(prev => prev
      ? { ...prev, mensajes: [...(prev.mensajes ?? []), msgTemp] }
      : { mensajes: [msgTemp] }
    )

    try {
      const result = await apiFetch(`/chat/${id}`, {
        method: 'POST',
        body: JSON.stringify({ contenido: texto }),
      })

      // Mostrar chips de tool calls
      if (result.tool_calls?.length > 0) setLastToolCalls(result.tool_calls)

      // Actualizar proyecto si cambio etapa/ruta
      if (result.proyecto) {
        setProyecto(prev => prev ? { ...prev, ...result.proyecto } : result.proyecto)
      }

      // Actualizar tareas
      if (result.tareas) setTareas(result.tareas)

      // Si se genero un documento, recargar lista de documentos
      const docGenerated = result.tool_calls?.some(tc => tc.tool === 'generar_documento')
      if (docGenerated) {
        apiFetch(`/documentos/${id}`).then(d => setDocumentos(d.documentos ?? [])).catch(() => {})
      }

      // Recargar la bitácora completa
      const bitacoraData = await apiFetch(`/chat/${id}/bitacora`)
      setEntradas(bitacoraData.entradas)
      const entradaActualizada = bitacoraData.entradas.find(en => en.id === result.entrada_id) ?? bitacoraData.entradas[bitacoraData.entradas.length - 1]
      setEntradaActiva(entradaActualizada)
      setSessionVigente(result.entrada_id)
    } catch (err) {
      setError(err.message)
      setEntradaActiva(prev => prev
        ? { ...prev, mensajes: prev.mensajes.filter(m => m.id !== msgTemp.id) }
        : prev
      )
    } finally {
      setSending(false)
      textareaRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  // ── Borrar documento ──
  const handleDeleteDocumento = async (docId) => {
    try {
      await apiFetch(`/documentos/${docId}`, { method: 'DELETE' })
      setDocumentos(prev => prev.filter(d => d.id !== docId))
    } catch (err) {
      console.error('Error al borrar documento:', err.message)
    }
  }

  // ── Nueva sesión ──
  const handleNuevaSesion = async () => {
    setInput('Hola, volvamos a donde estabamos.')
    // Hacer foco en el textarea para que el usuario confirme o edite
    setTimeout(() => textareaRef.current?.focus(), 100)
  }

  // ── Grabacion de voz ──
  const handleMicToggle = async () => {
    if (recording) {
      // Detener grabacion
      mediaRecorderRef.current?.stop()
      setRecording(false)
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioChunksRef.current = []
      const mr = new MediaRecorder(stream)
      mediaRecorderRef.current = mr

      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data) }

      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        if (blob.size < 1000) return // muy corto, ignorar

        setTranscribing(true)
        try {
          const { data: { session } } = await supabase.auth.getSession()
          const formData = new FormData()
          formData.append('audio', blob, 'recording.webm')
          // Usar fetch directo: apiFetch inyecta Content-Type application/json
          // lo que rompe el boundary del multipart
          const API_BASE = import.meta.env.VITE_API_URL || '/api'
          const res = await fetch(`${API_BASE}/voz/${id}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${session.access_token}` },
            body: formData,
          })
          if (!res.ok) {
            const body = await res.json().catch(() => ({}))
            throw new Error(body.error ?? `Error ${res.status}`)
          }
          const { transcripcion } = await res.json()
          if (transcripcion) setInput(prev => (prev + ' ' + transcripcion).trim())
          textareaRef.current?.focus()
        } catch (err) {
          setError('No se pudo transcribir el audio: ' + err.message)
        } finally {
          setTranscribing(false)
        }
      }

      mr.start()
      setRecording(true)
    } catch (err) {
      setError('No se pudo acceder al microfono: ' + err.message)
    }
  }

  // Estados de carga y error
  if (loadingPage) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-main)' }}>
        <Loader2 size={32} style={{ color: 'var(--c-blue-soft)' }} className="animate-spin" />
      </div>
    )
  }
  if (error && !proyecto) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem' }}>
        <p style={{ color: 'var(--c-red)', fontWeight: 600 }}>{error}</p>
        <button className="secondary" onClick={() => navigate('/dashboard')}>Volver al dashboard</button>
      </div>
    )
  }

  const rutaStyle = getRutaStyle(proyecto)
  const etapaNombre = ETAPA_NOMBRES[String(proyecto?.etapa_actual)] ?? `Etapa ${proyecto?.etapa_actual}`
  const initials = (user?.user_metadata?.nombre ?? user?.email ?? 'U').slice(0, 2).toUpperCase()
  const nombreUser = user?.user_metadata?.nombre ?? user?.email?.split('@')[0] ?? 'Usuario'
  const mensajesActivos = entradaActiva?.mensajes ?? []
  const sesionCaducada = entradaActiva && entradaActiva.id !== sessionVigente && !sending

  const tareasPendientes  = tareas.filter(t => t.estado === 'pendiente')
  const tareasCompletadas = tareas.filter(t => t.estado === 'completada')

  return (
    <div className="app-shell">
      <Header
        userName={nombreUser}
        userInitials={initials}
        onUserClick={async () => { await signOut(); navigate('/') }}
      />

      <div className="app-body">
        {/* ── Panel izquierdo: bitácora + tareas ── */}
        <aside className="sidebar" aria-label="Bitacora del proyecto">
          {/* Volver */}
          <button
            onClick={() => navigate('/dashboard')}
            style={{ all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
              fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', paddingBottom: '1rem',
              borderBottom: '1px solid var(--border-color)', width: '100%', marginBottom: '0.5rem' }}
          >
            <ArrowLeft size={13} /> Mis proyectos
          </button>

          {/* Info del proyecto */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              {proyecto?.icono_forma && (
                <ProjectIcon id={proyecto.icono_forma} size={16} color={rutaStyle.border} />
              )}
              <p style={{ margin: 0, fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {proyecto?.nombre}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '50px',
                background: rutaStyle.bg, color: rutaStyle.text, border: `1px solid ${rutaStyle.border}`, fontWeight: 600 }}>
                {rutaStyle.label}
              </span>
              <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '50px',
                background: 'var(--bg-main)', color: 'var(--text-muted)', border: '1px solid var(--border-color)', fontWeight: 600 }}>
                {etapaNombre}
              </span>
            </div>
          </div>

          {/* Bitacora */}
          <p style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', margin: '0 0 0.5rem' }}>
            Bitacora
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {entradas.map(e => (
              <EntradaItem
                key={e.id}
                entrada={e}
                isActive={entradaActiva?.id === e.id}
                onClick={() => setEntradaActiva(e)}
              />
            ))}
            {entradas.length === 0 && (
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', margin: 0, padding: '0.5rem 0' }}>
                Todavia no hay entradas
              </p>
            )}
            {/* Botón Nueva Sesión: visible cuando no hay sesión vigente */}
            {!sessionVigente && (
              <button
                onClick={handleNuevaSesion}
                style={{
                  all: 'unset', cursor: 'pointer', marginTop: '0.5rem',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  fontSize: 'var(--fs-xs)', color: 'var(--c-blue-dark)',
                  fontWeight: 600, padding: '0.4rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px dashed var(--c-blue-soft)',
                  background: 'var(--c-blue-tint)',
                  width: '100%', boxSizing: 'border-box',
                }}
              >
                <Plus size={13} /> Nueva sesión
              </button>
            )}
          </div>

          {/* Tareas + Documentos */}
          <div>
            {tareas.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '0.75rem', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <p style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', margin: 0 }}>
                    Tareas ({tareasPendientes.length} pendientes)
                  </p>
                  {tareasCompletadas.length > 0 && (
                    <button
                      onClick={() => setShowCompletadas(v => !v)}
                      style={{ all: 'unset', cursor: 'pointer', fontSize: '0.6rem', color: 'var(--text-muted)' }}
                    >
                      {showCompletadas ? 'Ocultar' : 'Ver todas'}
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {tareasPendientes.map(t => (
                    <TareaItem key={t.id} tarea={t} />
                  ))}
                  {showCompletadas && tareasCompletadas.map(t => (
                    <TareaItem key={t.id} tarea={t} />
                  ))}
                </div>
                <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', margin: '0.4rem 0 0', fontStyle: 'italic' }}>
                  El asistente marca las tareas al ver el resultado.
                </p>
              </div>
            )}

            {documentos.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '0.75rem', paddingTop: '0.75rem' }}>
                <p style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', margin: '0 0 0.4rem' }}>
                  Documentos ({documentos.length})
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                  {documentos.map(d => <DocumentoItem key={d.id} doc={d} onDelete={handleDeleteDocumento} />)}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ── Area de chat ── */}
        <main className="workspace" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          {/* Header del chat */}
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <MessageSquare size={18} style={{ color: 'var(--c-blue-soft)' }} />
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 'var(--fs-sm)' }}>
                  {entradaActiva ? `Sesion del ${new Date(entradaActiva.iniciada_en).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}` : 'Nueva sesion'}
                </p>
                <p style={{ margin: 0, fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={11} /> {etapaNombre} · {rutaStyle.label}
                </p>
              </div>
            </div>
          </div>

          {/* Mensajes */}
          <div className="chat-messages">
            {mensajesActivos.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--text-muted)' }}>
                <Sprout size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                <p style={{ fontSize: 'var(--fs-sm)', margin: 0 }}>
                  Escribe tu primer mensaje para comenzar esta sesion.
                </p>
              </div>
            )}
            {mensajesActivos.map(m => {
              if (m.rol === 'evento') {
                try {
                  const ev = JSON.parse(m.contenido)
                  return (
                    <div key={m.id} style={{ display: 'flex', justifyContent: 'center', margin: '0.25rem 0' }}>
                      <ToolCallChip toolCall={ev} />
                    </div>
                  )
                } catch { return null }
              }
              return <MessageBubble key={m.id} mensaje={m} />
            })}

            {/* Chips de tool calls transitorios (mientras se procesa) */}
            {lastToolCalls.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', margin: '0.5rem 0' }}>
                {lastToolCalls.map((tc, i) => (
                  <ToolCallChip key={i} toolCall={tc} />
                ))}
              </div>
            )}

            {/* Indicador de escritura */}
            {sending && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '0.75rem' }}>
                <div style={{ padding: '0.75rem 1rem', borderRadius: '16px 16px 16px 4px', background: '#fff', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow)', display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--c-blue-soft)', display: 'inline-block', animation: `bounce 1s ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <p style={{ color: 'var(--c-red)', fontSize: 'var(--fs-xs)', background: '#FEF2F2', padding: '0.35rem 0.75rem', borderRadius: '50px', border: '1px solid #FECACA' }}>
                  {error}
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input — oculto si la sesión está caducada */}
          {sesionCaducada ? (
            <div style={{
              padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-main)', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '0.5rem',
            }}>
              <p style={{ margin: 0, fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', textAlign: 'center' }}>
                Esta sesión caducó. Para continuar, inicia una nueva.
              </p>
              <button
                className="btn-primary"
                onClick={handleNuevaSesion}
                style={{ fontSize: 'var(--fs-xs)', padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Plus size={14} /> Nueva sesión
              </button>
            </div>
          ) : (
          <div className="chat-input-area">
            <button
              className="chat-send-btn"
              onClick={handleMicToggle}
              disabled={sending || transcribing}
              aria-label={recording ? 'Detener grabacion' : 'Grabar mensaje de voz'}
              title={recording ? 'Click para detener y transcribir' : 'Grabar mensaje de voz'}
              style={{
                background: recording ? '#EF4444' : transcribing ? '#F59E0B' : undefined,
                animation: recording ? 'pulse 1.2s infinite' : 'none',
              }}
            >
              {transcribing ? <Loader2 size={18} className="animate-spin" /> : recording ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <textarea
              ref={textareaRef}
              className="chat-input"
              placeholder={recording ? 'Grabando... haz clic en el microfono para transcribir' : 'Escribe tu mensaje...'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending || recording}
              rows={1}
            />
            <button
              className="chat-send-btn"
              onClick={handleSend}
              disabled={sending || !input.trim() || recording}
              aria-label="Enviar mensaje"
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
          )}
        </main>
      </div>
    </div>
  )
}
