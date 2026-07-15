import { Router } from 'express'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import Anthropic from '@anthropic-ai/sdk'
import { requireAuth } from '../middleware/auth.js'
import { query } from '../db/index.js'
import { uploadDoc } from '../lib/storage.js'
import { generarDocx } from '../lib/docgen.js'

const router = Router()
const __dirname = dirname(fileURLToPath(import.meta.url))
const ETAPAS = JSON.parse(readFileSync(join(__dirname, '../config/etapas.json'), 'utf8'))

const THREE_HOURS_MS = 3 * 60 * 60 * 1000

const claude = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

if (!claude) console.warn('[chat] ANTHROPIC_API_KEY no configurada - el chat no funcionara.')

// ─── Definicion de herramientas para Claude (function calling) ─────────────
const TOOLS = [
  {
    name: 'actualizar_resumen_proceso',
    description: 'Actualiza el resumen del proceso del proyecto con los avances y decisiones clave de la sesion actual. Usalo al final de una sesion productiva o cuando el usuario haya presentado hallazgos importantes.',
    input_schema: {
      type: 'object',
      properties: {
        resumen: {
          type: 'string',
          description: 'Resumen conciso del estado actual del proyecto: que se ha hecho, que se aprendio, que sigue. Maximo 3 parrafos.'
        }
      },
      required: ['resumen']
    }
  },
  {
    name: 'agregar_tarea',
    description: 'Agrega una tarea concreta al proyecto. Usalo cuando el usuario acuerde hacer algo especifico para la proxima sesion.',
    input_schema: {
      type: 'object',
      properties: {
        descripcion: {
          type: 'string',
          description: 'Descripcion clara de la tarea en lenguaje simple. Ej: "Realizar 8 entrevistas con estudiantes de primer semestre".'
        },
        etapa: {
          type: 'integer',
          description: 'Etapa del proceso a la que pertenece esta tarea (0-7).'
        }
      },
      required: ['descripcion', 'etapa']
    }
  },
  {
    name: 'completar_tarea',
    description: 'Marca una tarea como completada cuando el usuario confirma que la realizo.',
    input_schema: {
      type: 'object',
      properties: {
        tarea_id: {
          type: 'string',
          description: 'UUID de la tarea a completar.'
        }
      },
      required: ['tarea_id']
    }
  },
  {
    name: 'registrar_ruta',
    description: 'Registra la ruta de innovacion del proyecto en el punto de bifurcacion (despues de la etapa 5). Solo usalo cuando el usuario haya respondido claramente las tres preguntas de bifurcacion.',
    input_schema: {
      type: 'object',
      properties: {
        ruta: {
          type: 'string',
          enum: ['emprendimiento', 'intraemprendimiento', 'transferencia'],
          description: 'La ruta elegida: emprendimiento (crear empresa propia), intraemprendimiento (dentro de la organizacion), transferencia (ceder el conocimiento a un tercero).'
        }
      },
      required: ['ruta']
    }
  },
  {
    name: 'avanzar_etapa',
    description: 'Avanza el proyecto a la siguiente etapa. Solo usalo cuando el usuario haya presentado evidencia suficiente de que completo la etapa actual (entregables concretos, no solo intencion).',
    input_schema: {
      type: 'object',
      properties: {
        nueva_etapa: {
          type: 'integer',
          description: 'Numero de la etapa a la que avanza el proyecto (1-7).',
          minimum: 1,
          maximum: 7
        },
        justificacion: {
          type: 'string',
          description: 'Evidencia concreta que justifica el avance. Ej: "El usuario presento los resultados de 15 entrevistas con hallazgos cuantificados".'
        }
      },
      required: ['nueva_etapa', 'justificacion']
    }
  },
  {
    name: 'retroceder_etapa',
    description: 'Regresa el proyecto a una etapa anterior. Usalo cuando los hallazgos de validacion indiquen que hay que redefinir el desafio o repetir una etapa.',
    input_schema: {
      type: 'object',
      properties: {
        nueva_etapa: {
          type: 'integer',
          description: 'Numero de la etapa a la que regresa el proyecto (0-6).',
          minimum: 0,
          maximum: 6
        },
        justificacion: {
          type: 'string',
          description: 'Razon por la que se regresa a la etapa anterior.'
        }
      },
      required: ['nueva_etapa', 'justificacion']
    }
  },
  {
    name: 'generar_documento',
    description: 'Genera un documento Word (.docx) con el contenido indicado, lo sube al almacenamiento y registra el archivo en el proyecto. Usalo cuando el usuario pida un entregable formal: canvas, informe de entrevistas, propuesta de prototipo, etc.',
    input_schema: {
      type: 'object',
      properties: {
        tipo: {
          type: 'string',
          description: 'Tipo de documento: canvas, entrevistas, prototipo, propuesta, informe, plan, otro.'
        },
        titulo: {
          type: 'string',
          description: 'Titulo del documento. Ej: "Business Model Canvas - TutorUni" o "Informe de Entrevistas de Exploracion".'
        },
        contenido: {
          type: 'string',
          description: 'Contenido completo del documento en texto. Usa ## para encabezados de seccion, - para listas, y **texto** para negritas. Se exportara a Word con formato profesional.'
        }
      },
      required: ['tipo', 'titulo', 'contenido']
    }
  }
]

// ─── Ejecutores de herramientas en la DB ───────────────────────────────────
async function executeTool(toolName, toolInput, proyectoId) {
  switch (toolName) {
    case 'actualizar_resumen_proceso': {
      await query(
        `UPDATE proyectos SET resumen_proceso = $1 WHERE id = $2`,
        [toolInput.resumen, proyectoId]
      )
      return { ok: true, accion: 'resumen_actualizado' }
    }
    case 'agregar_tarea': {
      const { rows: [t] } = await query(
        `INSERT INTO tareas (proyecto_id, descripcion, etapa) VALUES ($1,$2,$3) RETURNING id`,
        [proyectoId, toolInput.descripcion, toolInput.etapa]
      )
      return { ok: true, tarea_id: t.id, accion: 'tarea_agregada', descripcion: toolInput.descripcion }
    }
    case 'completar_tarea': {
      await query(
        `UPDATE tareas SET estado = 'completada', completada_en = NOW() WHERE id = $1 AND proyecto_id = $2`,
        [toolInput.tarea_id, proyectoId]
      )
      return { ok: true, accion: 'tarea_completada' }
    }
    case 'registrar_ruta': {
      await query(
        `UPDATE proyectos SET ruta = $1 WHERE id = $2`,
        [toolInput.ruta, proyectoId]
      )
      return { ok: true, accion: 'ruta_registrada', ruta: toolInput.ruta }
    }
    case 'avanzar_etapa': {
      await query(
        `UPDATE proyectos SET etapa_actual = $1 WHERE id = $2`,
        [toolInput.nueva_etapa, proyectoId]
      )
      return { ok: true, accion: 'etapa_avanzada', nueva_etapa: toolInput.nueva_etapa, justificacion: toolInput.justificacion }
    }
    case 'retroceder_etapa': {
      await query(
        `UPDATE proyectos SET etapa_actual = $1 WHERE id = $2`,
        [toolInput.nueva_etapa, proyectoId]
      )
      return { ok: true, accion: 'etapa_retrocedida', nueva_etapa: toolInput.nueva_etapa, justificacion: toolInput.justificacion }
    }
    case 'generar_documento': {
      // Obtener datos del proyecto para el encabezado del doc
      const { rows: [proy] } = await query(
        `SELECT p.nombre, p.etapa_actual, u.nombre as usuario_nombre
         FROM proyectos p JOIN usuarios u ON u.id = p.owner_id
         WHERE p.id = $1`,
        [proyectoId]
      )
      const etapaNombre = {
        '0':'Creacion','1':'Exploracion','2':'Definicion','3':'Ideacion',
        '4':'Prototipado','5':'Validacion','6':'Estructuracion','7':'Implementacion'
      }[String(proy?.etapa_actual)] ?? `Etapa ${proy?.etapa_actual}`

      // Generar el .docx en memoria
      const buffer = await generarDocx({
        tipo: toolInput.tipo,
        titulo: toolInput.titulo,
        contenido: toolInput.contenido,
        meta: {
          proyectoNombre: proy?.nombre ?? 'Proyecto',
          usuarioNombre: proy?.usuario_nombre ?? '',
          etapaNombre,
        }
      })

      // Subir a Supabase Storage
      const storagePath = `${proyectoId}/${Date.now()}-${toolInput.tipo}.docx`
      const url = await uploadDoc(buffer, storagePath)

      // Registrar en tabla documentos
      const { rows: [doc] } = await query(
        `INSERT INTO documentos (proyecto_id, etapa, tipo, nombre, url)
         VALUES ($1, $2, 'generado_por_asistente', $3, $4)
         RETURNING id, nombre, url, created_at`,
        [proyectoId, proy?.etapa_actual ?? 0, toolInput.titulo, url]
      )

      return { ok: true, accion: 'documento_generado', documento: doc, titulo: toolInput.titulo }
    }
    default:
      return { ok: false, error: `Herramienta desconocida: ${toolName}` }
  }
}

// ─── Helper: obtener o crear la entrada activa ─────────────────────────────
async function getOrCreateEntrada(proyectoId, proyecto) {
  const { rows: [ultima] } = await query(
    `SELECT id, ultima_interaccion_en FROM entradas_bitacora
     WHERE proyecto_id = $1
     ORDER BY ultima_interaccion_en DESC LIMIT 1`,
    [proyectoId]
  )
  if (ultima) {
    const diffMs = Date.now() - new Date(ultima.ultima_interaccion_en).getTime()
    if (diffMs < THREE_HOURS_MS) return ultima.id
  }
  const { rows: [nueva] } = await query(
    `INSERT INTO entradas_bitacora (proyecto_id, etapa_en_ese_momento, ruta_en_ese_momento)
     VALUES ($1, $2, $3) RETURNING id`,
    [proyectoId, proyecto.etapa_actual, proyecto.ruta || null]
  )
  return nueva.id
}

// ─── Helper: construir el system prompt ───────────────────────────────────
function buildSystemPrompt(usuario, proyecto, etapaConfig, tareasPendientes) {
  const rutaLabel = {
    emprendimiento: 'Emprendimiento',
    intraemprendimiento: 'Intraemprendimiento',
    transferencia: 'Transferencia de conocimiento',
  }[proyecto.ruta] || 'Tronco de innovacion (sin ruta definida aun)'

  const etapaNombre = etapaConfig?.nombre ?? `Etapa ${proyecto.etapa_actual}`

  const tareasStr = tareasPendientes.length > 0
    ? tareasPendientes.map(t => `- [ID: ${t.id}] ${t.descripcion}`).join('\n')
    : 'Ninguna'

  return `Eres Germina, el asistente de innovacion de la Universidad de La Sabana (GovLab).
Tu rol es acompanar al usuario a lo largo de su proceso de innovacion con lenguaje conversacional, claro y sin jerga tecnica innecesaria.
Responde siempre en formato Markdown: usa encabezados, listas, negritas y separadores cuando ayuden a la claridad. Nunca uses emojis, flechas (->), guiones largos (--) ni caracteres especiales decorativos.

## Usuario
- Nombre: ${usuario.nombre ?? 'Usuario'}
- Tipo: ${usuario.tipo_usuario ?? 'No especificado'}
- Formacion: ${usuario.formacion ?? 'No especificada'}

## Proyecto actual
- Nombre: ${proyecto.nombre}
- Ruta: ${rutaLabel}
- Etapa actual: ${proyecto.etapa_actual} - ${etapaNombre}
- Nivel de maduracion: ${proyecto.nivel_maduracion ?? 'No especificado'}
${proyecto.resumen_proceso ? `- Resumen del proceso: ${proyecto.resumen_proceso}` : ''}

## Tareas pendientes del proyecto
${tareasStr}

## Tu rol en esta etapa
${etapaConfig?.rol_ia ?? 'Acompana al usuario en su proceso de innovacion.'}

## Descripcion de la etapa
${etapaConfig?.descripcion ?? ''}

## Herramientas disponibles en esta etapa
${Array.isArray(etapaConfig?.herramientas) ? etapaConfig.herramientas.map(h => `- ${h}`).join('\n') : ''}

## Entregables esperados
${Array.isArray(etapaConfig?.entregables_esperados) ? etapaConfig.entregables_esperados.map(e => `- ${e}`).join('\n') : ''}

## Instrucciones de comportamiento
- Habla siempre en espanol, de forma cercana y profesional.
- Cada respuesta debe terminar con una accion concreta que el usuario pueda hacer.
- Si el usuario no sabe que hacer, ofrecele opciones numeradas (A, B, C) pero siempre permite respuesta libre.
- Usa las herramientas (function calling) cuando corresponda: agrega tareas al acordar compromisos, actualiza el resumen al cerrar una sesion productiva, avanza la etapa solo cuando haya evidencia suficiente.
- No avances de etapa por tu cuenta: solo cuando el usuario presente evidencia concreta de los entregables de la etapa.
- Se conciso: maximo 3-4 parrafos por respuesta en conversacion normal.
- Si esta es la primera conversacion del proyecto, comienza con un diagnostico breve para confirmar en que punto esta el proyecto.`.trim()
}

// ─── GET /api/chat/:proyectoId/bitacora ───────────────────────────────────
router.get('/:proyectoId/bitacora', requireAuth, async (req, res) => {
  const { proyectoId } = req.params
  try {
    const { rows: [proyecto] } = await query(
      `SELECT id FROM proyectos WHERE id = $1 AND owner_id = $2`,
      [proyectoId, req.user.id]
    )
    if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' })

    const { rows: entradas } = await query(
      `SELECT eb.id, eb.etapa_en_ese_momento, eb.ruta_en_ese_momento,
              eb.iniciada_en, eb.ultima_interaccion_en
       FROM entradas_bitacora eb
       WHERE eb.proyecto_id = $1
       ORDER BY eb.iniciada_en ASC`,
      [proyectoId]
    )

    const entradasConMensajes = await Promise.all(entradas.map(async (entrada) => {
      const { rows: mensajes } = await query(
        `SELECT id, rol, contenido, tipo_entrada, created_at
         FROM mensajes WHERE entrada_id = $1 ORDER BY created_at ASC`,
        [entrada.id]
      )
      return { ...entrada, mensajes }
    }))

    // Tareas del proyecto
    const { rows: tareas } = await query(
      `SELECT id, descripcion, etapa, estado, created_at, completada_en
       FROM tareas WHERE proyecto_id = $1 ORDER BY created_at ASC`,
      [proyectoId]
    )

    res.json({ entradas: entradasConMensajes, tareas })
  } catch (err) {
    console.error('GET bitacora error:', err.message)
    res.status(500).json({ error: 'Error al cargar la bitacora' })
  }
})

// ─── POST /api/chat/:proyectoId ───────────────────────────────────────────
router.post('/:proyectoId', requireAuth, async (req, res) => {
  const { proyectoId } = req.params
  const { contenido } = req.body

  if (!contenido?.trim()) {
    return res.status(400).json({ error: 'El mensaje no puede estar vacio' })
  }

  try {
    // 1. Proyecto + usuario + tareas pendientes
    const { rows: [proyecto] } = await query(
      `SELECT p.id, p.nombre, p.ruta, p.etapa_actual, p.nivel_maduracion, p.resumen_proceso,
              u.nombre as usuario_nombre, u.tipo_usuario, u.formacion
       FROM proyectos p
       JOIN usuarios u ON u.id = p.owner_id
       WHERE p.id = $1 AND p.owner_id = $2`,
      [proyectoId, req.user.id]
    )
    if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' })

    const { rows: tareasPendientes } = await query(
      `SELECT id, descripcion, etapa FROM tareas
       WHERE proyecto_id = $1 AND estado = 'pendiente'
       ORDER BY created_at ASC`,
      [proyectoId]
    )

    // 2. Entrada activa (regla 3h)
    const entradaId = await getOrCreateEntrada(proyectoId, proyecto)

    // 3. Guardar mensaje del usuario
    await query(
      `INSERT INTO mensajes (entrada_id, rol, contenido) VALUES ($1, 'usuario', $2)`,
      [entradaId, contenido.trim()]
    )

    // 4. Historial de esta entrada
    const { rows: historial } = await query(
      `SELECT rol, contenido FROM mensajes WHERE entrada_id = $1 ORDER BY created_at ASC`,
      [entradaId]
    )

    // 5. Contexto para Claude
    const etapaConfig = ETAPAS[String(proyecto.etapa_actual)] ?? null
    const usuario = {
      nombre: proyecto.usuario_nombre,
      tipo_usuario: proyecto.tipo_usuario,
      formacion: proyecto.formacion,
    }
    const systemPrompt = buildSystemPrompt(usuario, proyecto, etapaConfig, tareasPendientes)

    if (!claude) {
      return res.status(503).json({ error: 'El servicio de IA no esta configurado en el servidor.' })
    }

    const claudeMessages = historial.map(m => ({
      role: m.rol === 'usuario' ? 'user' : 'assistant',
      content: m.contenido,
    }))

    // 6. Primera llamada a Claude (puede responder con tool_use)
    let response = await claude.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2048,
      system: systemPrompt,
      tools: TOOLS,
      messages: claudeMessages,
    })

    // 7. Loop de tool_use: ejecutar herramientas hasta obtener respuesta de texto
    const toolCallsExecuted = []

    while (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(b => b.type === 'tool_use')
      const toolResults = []

      for (const toolBlock of toolUseBlocks) {
        const result = await executeTool(toolBlock.name, toolBlock.input, proyectoId)
        toolCallsExecuted.push({ tool: toolBlock.name, input: toolBlock.input, result })
        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolBlock.id,
          content: JSON.stringify(result),
        })
      }

      // Re-llamar a Claude con los resultados de las herramientas
      response = await claude.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 2048,
        system: systemPrompt,
        tools: TOOLS,
        messages: [
          ...claudeMessages,
          { role: 'assistant', content: response.content },
          { role: 'user', content: toolResults },
        ],
      })
    }

    // 8. Extraer la respuesta de texto final
    const respuesta = response.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n')
      .trim() || '(Sin respuesta)'

    // 9. Guardar respuesta del asistente
    const { rows: [msgGuardado] } = await query(
      `INSERT INTO mensajes (entrada_id, rol, contenido)
       VALUES ($1, 'asistente', $2) RETURNING id, rol, contenido, created_at`,
      [entradaId, respuesta]
    )

    // 10. Actualizar timestamps
    await query(`UPDATE entradas_bitacora SET ultima_interaccion_en = NOW() WHERE id = $1`, [entradaId])
    await query(`UPDATE proyectos SET ultima_actividad_en = NOW() WHERE id = $1`, [proyectoId])

    // 11. Devolver el estado actualizado del proyecto (por si cambio etapa/ruta)
    const { rows: [proyectoActualizado] } = await query(
      `SELECT etapa_actual, ruta, resumen_proceso FROM proyectos WHERE id = $1`,
      [proyectoId]
    )

    const { rows: tareasActualizadas } = await query(
      `SELECT id, descripcion, etapa, estado, created_at, completada_en
       FROM tareas WHERE proyecto_id = $1 ORDER BY created_at ASC`,
      [proyectoId]
    )

    res.json({
      mensaje: msgGuardado,
      entrada_id: entradaId,
      tool_calls: toolCallsExecuted,
      proyecto: proyectoActualizado,
      tareas: tareasActualizadas,
    })

  } catch (err) {
    console.error('POST chat error:', err.message, err.stack)
    res.status(500).json({ error: 'Error al procesar el mensaje: ' + err.message })
  }
})

// ─── POST /api/chat/:proyectoId/tareas/:tareaId/completar ─────────────────
// Permite al usuario completar una tarea directamente desde el sidebar
router.post('/:proyectoId/tareas/:tareaId/completar', requireAuth, async (req, res) => {
  const { proyectoId, tareaId } = req.params
  try {
    const { rows: [proyecto] } = await query(
      `SELECT id FROM proyectos WHERE id = $1 AND owner_id = $2`,
      [proyectoId, req.user.id]
    )
    if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' })

    await query(
      `UPDATE tareas SET estado = 'completada', completada_en = NOW()
       WHERE id = $1 AND proyecto_id = $2`,
      [tareaId, proyectoId]
    )
    res.json({ ok: true })
  } catch (err) {
    console.error('completar-tarea error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router
