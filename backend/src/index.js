import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import profileRoutes from './routes/profile.js'
import proyectosRoutes from './routes/proyectos.js'
import chatRoutes from './routes/chat.js'
import demoRoutes from './routes/demo.js'
import vozRoutes from './routes/voz.js'
import { requireAuth } from './middleware/auth.js'
import { query } from './db/index.js'
import { createClient } from '@supabase/supabase-js'

const app = express()
const PORT = process.env.PORT || 3001

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://germina.up.railway.app',           // dominio Railway producción
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true)
    callback(new Error(`CORS: origen no permitido — ${origin}`))
  },
  credentials: true,
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// ── Rutas ──────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/proyectos', proyectosRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/demo', demoRoutes)
app.use('/api/voz', vozRoutes)

// ── Documentos del proyecto ────────────────────────────────────
app.get('/api/documentos/:proyectoId', requireAuth, async (req, res) => {
  const { proyectoId } = req.params
  try {
    const { rows: [proy] } = await query(
      `SELECT id FROM proyectos WHERE id = $1 AND owner_id = $2`,
      [proyectoId, req.user.id]
    )
    if (!proy) return res.status(404).json({ error: 'Proyecto no encontrado' })

    const { rows: docs } = await query(
      `SELECT id, nombre, tipo, etapa, url, created_at
       FROM documentos WHERE proyecto_id = $1 ORDER BY created_at DESC`,
      [proyectoId]
    )
    res.json({ documentos: docs })
  } catch (err) {
    console.error('GET documentos error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ── Borrar documento ─────────────────────────────────────
app.delete('/api/documentos/:docId', requireAuth, async (req, res) => {
  const { docId } = req.params
  try {
    // Verificar que el documento pertenece al usuario
    const { rows: [doc] } = await query(
      `SELECT d.id, d.url, d.proyecto_id FROM documentos d
       JOIN proyectos p ON p.id = d.proyecto_id
       WHERE d.id = $1 AND p.owner_id = $2`,
      [docId, req.user.id]
    )
    if (!doc) return res.status(404).json({ error: 'Documento no encontrado' })

    // Eliminar de la DB
    await query(`DELETE FROM documentos WHERE id = $1`, [docId])

    // Intentar borrar del Storage (no es bloqueante si falla)
    try {
      const supabaseAdmin = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { persistSession: false } }
      )
      // Extraer el path del bucket desde la URL publica
      const urlObj = new URL(doc.url)
      const storagePath = urlObj.pathname.replace('/storage/v1/object/public/germina-docs/', '')
      await supabaseAdmin.storage.from('germina-docs').remove([storagePath])
    } catch (_) { /* ignorar errores de storage */ }

    res.json({ ok: true })
  } catch (err) {
    console.error('DELETE documento error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// Health check (sin auth)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Germina backend corriendo correctamente' })
})

// ── Arranque ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Germina backend escuchando en http://localhost:${PORT}`)
})
