import 'dotenv/config'
import pg from 'pg'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
})

try {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS documentos (
      id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      proyecto_id  UUID        NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
      etapa        INTEGER     NOT NULL DEFAULT 0,
      tipo         TEXT        NOT NULL DEFAULT 'otro',
      nombre       TEXT        NOT NULL,
      url          TEXT        NOT NULL,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_documentos_proyecto ON documentos (proyecto_id);
  `)
  console.log('OK: tabla documentos creada')
} catch (e) {
  console.error('Error:', e.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
