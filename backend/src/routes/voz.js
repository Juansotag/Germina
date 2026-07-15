/**
 * Germina — Ruta de entrada de voz
 * Pipeline: audio blob -> Supabase Storage -> Whisper -> texto
 *
 * POST /api/voz/:proyectoId
 * Content-Type: multipart/form-data  (campo: audio)
 */
import { Router } from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import OpenAI, { toFile } from 'openai'
import { requireAuth } from '../middleware/auth.js'
import { uploadAudio } from '../lib/storage.js'
import { query } from '../db/index.js'

const router = Router()
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOADS_DIR = path.join(__dirname, '../../uploads')

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })

const upload = multer({ dest: UPLOADS_DIR, limits: { fileSize: 25 * 1024 * 1024 } })

// Inicializar cliente Whisper
let openai = null
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  console.log('[voz] OpenAI Whisper configurado correctamente.')
} else {
  console.warn('[voz] OPENAI_API_KEY no configurada — la transcripcion de voz no funcionara.')
}

/**
 * POST /api/voz/:proyectoId
 * Recibe blob de audio, lo sube a Supabase y lo transcribe con Whisper.
 */
router.post('/:proyectoId', requireAuth, upload.single('audio'), async (req, res) => {
  const { proyectoId } = req.params
  const file = req.file
  const filePath = file?.path

  try {
    if (!file) return res.status(400).json({ error: 'No se recibio ningun archivo de audio' })
    if (!openai) return res.status(503).json({ error: 'El servicio de transcripcion de voz no esta configurado (falta OPENAI_API_KEY)' })

    // 1. Verificar que el proyecto pertenece al usuario
    const { rows: [proyecto] } = await query(
      `SELECT id FROM proyectos WHERE id = $1 AND owner_id = $2`,
      [proyectoId, req.user.id]
    )
    if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' })

    // 2. Leer el buffer del archivo temporal
    const audioBuffer = fs.readFileSync(filePath)
    const extension = (file.mimetype || '').includes('ogg') ? 'ogg'
      : (file.mimetype || '').includes('mp4') ? 'mp4'
      : 'webm'

    // 3. Subir a Supabase Storage (en paralelo con la transcripcion)
    const storagePath = `${req.user.id}/${proyectoId}/${Date.now()}.${extension}`
    const storagePromise = uploadAudio(audioBuffer, storagePath, file.mimetype || 'audio/webm')
      .catch(err => { console.warn('[voz] Storage upload failed (non-fatal):', err.message); return { signedUrl: null } })

    // 4. Transcribir con Whisper usando toFile() para adjuntar el nombre correcto
    //    (Whisper detecta el formato por la extension del filename)
    const audioFile = await toFile(audioBuffer, `recording.${extension}`, { type: file.mimetype || 'audio/webm' })
    const transcripcion = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file: audioFile,
      language: 'es',
      response_format: 'text',
    })

    const texto = (typeof transcripcion === 'string' ? transcripcion : transcripcion?.text || '').trim()
    if (!texto) return res.status(422).json({ error: 'No se pudo detectar voz en el audio' })

    const { signedUrl: audioUrl } = await storagePromise
    res.json({ transcripcion: texto, audio_url: audioUrl })

  } catch (err) {
    console.error('[voz] Error:', err.message)
    res.status(500).json({ error: 'Error al procesar el audio: ' + err.message })
  } finally {
    // Limpiar archivo temporal siempre
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath) } catch (_) {}
    }
  }
})

export default router
