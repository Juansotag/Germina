import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { query } from '../db/index.js'

const router = Router()

/**
 * GET /api/auth/me
 * Devuelve el perfil completo del usuario desde Railway.
 * Crea la fila en `usuarios` si es la primera vez (via requireAuth).
 *
 * El frontend lo llama justo después del login para sincronizar
 * el usuario de Supabase con la base de datos de la aplicación.
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT id, correo, nombre, tipo_usuario, roles, formacion, experiencia_previa, foto_perfil_url, created_at FROM usuarios WHERE id = $1',
      [req.user.id]
    )

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    res.json({ user: rows[0] })
  } catch (err) {
    console.error('Error en GET /api/auth/me:', err.message)
    res.status(500).json({ error: 'Error al obtener perfil de usuario' })
  }
})

export default router
