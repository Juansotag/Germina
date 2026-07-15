import { Router } from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import OpenAI from 'openai'
import { extractText } from 'unpdf'
import { requireAuth } from '../middleware/auth.js'
import { query, getClient } from '../db/index.js'

const router = Router()
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOADS_DIR = path.join(__dirname, '../../uploads')

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

const upload = multer({
  dest: UPLOADS_DIR,
  limits: { fileSize: 5 * 1024 * 1024 }
})

// Inicializar OpenAI si la API key existe
const openaiKey = process.env.OPENAI_API_KEY
let openai = null

if (openaiKey) {
  openai = new OpenAI({ apiKey: openaiKey })
  console.log('🤖  OpenAI configurado correctamente en el backend (profile).')
} else {
  console.warn('⚠️  OPENAI_API_KEY no definida en .env. Se usará el modo simulado en local.')
}

const CV_PROMPT = `Analiza el currículum adjunto y devuelve ÚNICAMENTE un objeto JSON (sin markdown, sin explicaciones) con esta estructura exacta:

{
  "nombre": "Nombre completo",
  "roles": ["uno o más de: estudiante|profesor|investigador|administrativo|graduado|aliado|externo"],
  "detalles_roles": {
    "estudiante": { "carrera": "...", "semestre": 1 },
    "profesor": { "clases": ["materia1", "materia2"] },
    "administrativo": { "puesto": "..." },
    "externo": { "organizacion": "...", "puesto": "..." }
  },
  "formacion": "Resumen corto de titulos, ej: Administrador de Empresas, Mg. en Innovacion",
  "educacion": [
    {
      "titulo": "Nombre del titulo o grado obtenido",
      "institucion": "Nombre de la universidad o instituto",
      "nivel": "uno de: bachillerato|tecnico|pregrado|especializacion|maestria|doctorado|postdoctorado|diplomado|otro",
      "anio_fin": "YYYY o cadena vacia si no se sabe"
    }
  ],
  "experiencia_laboral": [
    {
      "organizacion": "Empresa",
      "titulo": "Cargo",
      "responsabilidades": "Descripción breve",
      "fecha_inicio": "YYYY-MM-DD",
      "fecha_fin": "YYYY-MM-DD o null",
      "actual": false
    }
  ],
  "habilidades": {
    "idiomas": ["Español", "Inglés"],
    "lenguajes": ["Python", "Excel"],
    "certificaciones": ["Cert 1"]
  }
}

Reglas:
- Solo incluye los roles que efectivamente apliquen a la persona.
- En detalles_roles incluye solo los objetos de los roles presentes.
- educacion: incluye TODOS los titulos y diplomas encontrados, cada uno como un objeto separado. Si el nivel exacto no se puede determinar, usa "otro".
- Las fechas de experiencia_laboral deben estar en formato YYYY-MM-DD. Si solo hay año, usa YYYY-01-01.
- Si el trabajo es actual, fecha_fin debe ser null y actual debe ser true.
- anio_fin de educacion debe ser solo el año (YYYY) como string, o cadena vacia si no aparece.
- IMPORTANTE: Si la persona trabaja o trabajó en la Universidad de La Sabana (o "Unisabana"), inclúyela en el rol "administrativo" y extrae su cargo como detalles_roles.administrativo.puesto.
- Responde exclusivamente con el JSON, nada más.`

/**
 * POST /api/profile/parse-cv
 * Lee un CV (PDF) y usa Claude para estructurarlo en JSON.
 */
router.post('/parse-cv', requireAuth, upload.single('cv'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Debes subir un archivo de currículum' })
  }

  const filePath = req.file.path
  const mimeType = req.file.mimetype

  try {
    let cvDataJson = null

    if (openai) {
      const fileBuffer = fs.readFileSync(filePath)

      // Extraer el texto del PDF con unpdf (requiere Uint8Array, no Buffer)
      let cvText = ''
      if (mimeType === 'application/pdf') {
        const uint8 = new Uint8Array(fileBuffer.buffer, fileBuffer.byteOffset, fileBuffer.byteLength)
        const { text } = await extractText(uint8, { mergePages: true })
        cvText = text
      } else {
        cvText = fileBuffer.toString('utf8')
      }

      const message = await openai.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: `${CV_PROMPT}\n\n---\nCONTENIDO DEL CV:\n${cvText}`
          }
        ]
      })

      const rawText = message.choices[0].message.content?.trim() ?? ''
      // Extraer el JSON aunque GPT haya añadido algún delimitador de markdown
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('OpenAI no devolvió un JSON válido')
      cvDataJson = JSON.parse(jsonMatch[0])

    } else {
      // MOCK sin API Key — útil para desarrollo local
      console.log('📝  Modo simulado: ANTHROPIC_API_KEY no configurada.')
      await new Promise(r => setTimeout(r, 1500))
      cvDataJson = {
        nombre: req.user.nombre || 'Usuario de Prueba',
        roles: ['profesor', 'administrativo'],
        detalles_roles: {
          profesor: { clases: ['Innovación y Emprendimiento', 'Metodologías Ágiles'] },
          administrativo: { puesto: 'Coordinador de Innovación y Transferencia' }
        },
        formacion: 'Magíster en Gerencia de la Innovación, Universidad de La Sabana',
        experiencia_laboral: [
          {
            organizacion: 'Universidad de La Sabana',
            titulo: 'Docente y Coordinador',
            responsabilidades: 'Liderar procesos de transferencia tecnológica y dictar clases.',
            fecha_inicio: '2021-01-01',
            fecha_fin: null,
            actual: true
          }
        ],
        habilidades: {
          idiomas: ['Español', 'Inglés'],
          lenguajes: ['Python', 'JavaScript'],
          certificaciones: ['Scrum Master Professional']
        }
      }
    }

    res.json(cvDataJson)
  } catch (err) {
    console.error('Error al parsear el CV con OpenAI:', err.message)
    res.status(500).json({ error: 'No se pudo procesar el currículum: ' + err.message })
  } finally {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  }
})


/**
 * GET /api/profile
 * Devuelve el perfil completo del usuario, incluyendo su experiencia laboral.
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows: userRows } = await query(
      'SELECT id, correo, nombre, roles, detalles_roles, formacion, educacion, habilidades, tipo_usuario FROM usuarios WHERE id = $1',
      [req.user.id]
    )
    if (userRows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' })

    const { rows: expRows } = await query(
      'SELECT id, organizacion, titulo, responsabilidades, fecha_inicio, fecha_fin, actual FROM experiencia_laboral WHERE usuario_id = $1 ORDER BY fecha_inicio DESC',
      [req.user.id]
    )

    res.json({ user: { ...userRows[0], experiencia_laboral: expRows } })
  } catch (err) {
    console.error('Error en GET /api/profile:', err.message)
    res.status(500).json({ error: 'Error al obtener el perfil' })
  }
})

/**
 * PUT /api/profile
 * Guarda la caracterización avanzada del usuario en una transacción segura.
 */
router.put('/', requireAuth, async (req, res) => {

  const { nombre, roles, detalles_roles, formacion, educacion, habilidades, experiencia_laboral } = req.body

  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    return res.status(400).json({ error: 'Debes seleccionar al menos un rol' })
  }

  const client = await getClient()

  try {
    await client.query('BEGIN')

    // 1. Actualizar datos base en la tabla usuarios
    const { rows: userRows } = await client.query(`
      UPDATE usuarios
      SET nombre = COALESCE($1, nombre),
          roles = $2,
          detalles_roles = $3,
          formacion = $4,
          educacion = $5,
          habilidades = $6,
          tipo_usuario = $7
      WHERE id = $8
      RETURNING id, correo, nombre, roles, detalles_roles, formacion, educacion, habilidades
    `, [
      nombre || null,
      roles,
      detalles_roles || {},
      formacion || null,
      JSON.stringify(educacion || []),
      habilidades || {},
      roles[0],
      req.user.id
    ])

    if (userRows.length === 0) {
      throw new Error('Usuario no encontrado')
    }

    // 2. Limpiar experiencias laborales previas
    await client.query('DELETE FROM experiencia_laboral WHERE usuario_id = $1', [req.user.id])

    // 3. Insertar la nueva lista de experiencia laboral
    if (experiencia_laboral && Array.isArray(experiencia_laboral) && experiencia_laboral.length > 0) {
      for (const exp of experiencia_laboral) {
        if (!exp.organizacion || !exp.titulo || !exp.fecha_inicio) continue

        // Validar e inicializar fechas
        const fechaInicio = exp.fecha_inicio
        const fechaFin = exp.actual ? null : exp.fecha_fin
        
        await client.query(`
          INSERT INTO experiencia_laboral (usuario_id, organizacion, titulo, responsabilidades, fecha_inicio, fecha_fin, actual)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          req.user.id,
          exp.organizacion,
          exp.titulo,
          exp.responsabilidades || null,
          fechaInicio,
          fechaFin,
          exp.actual || false
        ])
      }
    }

    await client.query('COMMIT')

    // 4. Obtener las experiencias guardadas para retornarlas
    const { rows: savedExperiences } = await client.query(
      'SELECT organizacion, titulo, responsabilidades, fecha_inicio, fecha_fin, actual FROM experiencia_laboral WHERE usuario_id = $1 ORDER BY fecha_inicio DESC',
      [req.user.id]
    )

    const updatedUser = {
      ...userRows[0],
      tipo_usuario: userRows[0].roles[0], // para compatibilidad con el front antiguo
      experiencia_laboral: savedExperiences
    }

    res.json({ user: updatedUser })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Error al guardar perfil de caracterización:', err.message)
    console.error('Stack:', err.stack)
    res.status(500).json({ error: 'Error al guardar el perfil: ' + err.message })
  } finally {
    client.release()
  }
})

export default router
