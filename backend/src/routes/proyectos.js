import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { query } from '../db/index.js'

const router = Router()

/**
 * GET /api/proyectos
 * Lista todos los proyectos del usuario autenticado.
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, nombre, objetivo, icono_forma, ruta, etapa_actual,
              nivel_maduracion, created_at, ultima_actividad_en
       FROM proyectos
       WHERE owner_id = $1
       ORDER BY ultima_actividad_en DESC`,
      [req.user.id]
    )
    res.json({ proyectos: rows })
  } catch (err) {
    console.error('GET /api/proyectos error:', err.message)
    res.status(500).json({ error: 'Error al obtener proyectos' })
  }
})

/**
 * GET /api/proyectos/:id
 * Retorna un proyecto específico del usuario autenticado.
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, nombre, objetivo, icono_forma, ruta, etapa_actual,
              nivel_maduracion, resumen_proceso, created_at, ultima_actividad_en
       FROM proyectos
       WHERE id = $1 AND owner_id = $2`,
      [req.params.id, req.user.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Proyecto no encontrado' })
    res.json({ proyecto: rows[0] })
  } catch (err) {
    console.error('GET /api/proyectos/:id error:', err.message)
    res.status(500).json({ error: 'Error al obtener el proyecto' })
  }
})

/**
 * POST /api/proyectos
 * Crea un nuevo proyecto (Fase 0).
 */
router.post('/', requireAuth, async (req, res) => {
  const { nombre, objetivo, nivel_maduracion, icono_forma } = req.body

  if (!nombre?.trim()) {
    return res.status(400).json({ error: 'El nombre del proyecto es obligatorio' })
  }

  // Según el nivel de maduración, el proyecto entra en distintas etapas
  // (negocio_en_marcha → etapa 6, resto → etapa 1 salvo que ya haya avances)
  const etapaInicial = nivel_maduracion === 'negocio_en_marcha' ? 6 : 1

  try {
    const { rows } = await query(
      `INSERT INTO proyectos (owner_id, nombre, objetivo, nivel_maduracion, icono_forma, etapa_actual)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, nombre, objetivo, icono_forma, ruta, etapa_actual, nivel_maduracion, created_at, ultima_actividad_en`,
      [req.user.id, nombre.trim(), objetivo?.trim() || null, nivel_maduracion || 'idea', icono_forma || null, etapaInicial]
    )
    res.status(201).json({ proyecto: rows[0] })
  } catch (err) {
    console.error('POST /api/proyectos error:', err.message)
    res.status(500).json({ error: 'Error al crear el proyecto' })
  }
})

/**
 * PUT /api/proyectos/:id
 * Edita nombre, objetivo e icono de un proyecto propio.
 */
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  const { nombre, objetivo, icono_forma } = req.body

  if (!nombre?.trim()) {
    return res.status(400).json({ error: 'El nombre del proyecto es obligatorio' })
  }

  try {
    const { rows } = await query(
      `UPDATE proyectos
       SET nombre = $1, objetivo = $2, icono_forma = $3, ultima_actividad_en = NOW()
       WHERE id = $4 AND owner_id = $5
       RETURNING id, nombre, objetivo, icono_forma, ruta, etapa_actual, nivel_maduracion, ultima_actividad_en`,
      [nombre.trim(), objetivo?.trim() || null, icono_forma || null, id, req.user.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Proyecto no encontrado' })
    res.json({ proyecto: rows[0] })
  } catch (err) {
    console.error('PUT /api/proyectos/:id error:', err.message)
    res.status(500).json({ error: 'Error al actualizar el proyecto' })
  }
})

/**
 * DELETE /api/proyectos/:id
 * Elimina un proyecto propio (cascade elimina tareas, bitácora, mensajes y docs).
 */
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  try {
    const { rowCount } = await query(
      `DELETE FROM proyectos WHERE id = $1 AND owner_id = $2`,
      [id, req.user.id]
    )
    if (rowCount === 0) return res.status(404).json({ error: 'Proyecto no encontrado' })
    res.json({ ok: true })
  } catch (err) {
    console.error('DELETE /api/proyectos/:id error:', err.message)
    res.status(500).json({ error: 'Error al eliminar el proyecto' })
  }
})

export default router
