import 'dotenv/config'
import pg from 'pg'

const { Client } = pg
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: false })
await client.connect()

const { rows } = await client.query('SELECT id, correo, nombre, tipo_usuario, created_at FROM usuarios ORDER BY created_at DESC LIMIT 10')

if (rows.length === 0) {
  console.log('\n⚠️  La tabla usuarios está vacía.')
  console.log('   Esto significa que /api/auth/me aún no fue llamado.')
  console.log('   Asegúrate de que el frontend esté conectado al backend (/api proxy en Vite).')
} else {
  console.log(`\nUsuarios en Railway (${rows.length}):\n`)
  rows.forEach(r => {
    console.log(`  ✅  ${r.correo}`)
    console.log(`       nombre:       ${r.nombre ?? '(vacío)'}`)
    console.log(`       tipo_usuario: ${r.tipo_usuario ?? '(no definido aún)'}`)
    console.log(`       creado:       ${r.created_at.toISOString()}`)
    console.log()
  })
}

await client.end()
