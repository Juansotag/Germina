import 'dotenv/config'
import pg from 'pg'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
})

try {
  await pool.query(`ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS educacion JSONB DEFAULT '[]'`)
  console.log('OK: columna educacion agregada a la tabla usuarios')
} catch (e) {
  console.error('Error al aplicar migración:', e.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
