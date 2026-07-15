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

const app = express()
const PORT = process.env.PORT || 3001

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
]

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origen (curl, Postman, mobile apps)
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

// Health check (sin auth)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Germina backend corriendo correctamente' })
})

// ── Arranque ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Germina backend escuchando en http://localhost:${PORT}`)
})
