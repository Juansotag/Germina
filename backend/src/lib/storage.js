/**
 * Germina — Supabase Storage helper
 * Usa el service_role key para subir archivos sin restricciones de RLS.
 */
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

const BUCKET_DOCS  = 'germina-docs'
const BUCKET_AUDIO = 'germina-audio'

/**
 * Sube un buffer al bucket de documentos y devuelve la URL publica firmada (1 año).
 * @param {Buffer} buffer
 * @param {string} path  - Ruta dentro del bucket: ej. "user-uuid/proyecto-uuid/filename.docx"
 * @param {string} contentType
 */
export async function uploadDoc(buffer, path, contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_DOCS)
    .upload(path, buffer, { contentType, upsert: true })

  if (error) throw new Error(`Storage upload error: ${error.message}`)

  // Signed URL válida por 1 año — funciona en buckets públicos y privados
  const { data: signed, error: signErr } = await supabaseAdmin.storage
    .from(BUCKET_DOCS)
    .createSignedUrl(data.path, 60 * 60 * 24 * 365)

  if (signErr) throw new Error(`Storage sign error: ${signErr.message}`)

  return signed?.signedUrl ?? null
}

/**
 * Sube un blob de audio al bucket de audio y devuelve la ruta almacenada.
 * @param {Buffer} buffer
 * @param {string} path  - ej. "user-uuid/entrada-uuid/recording.webm"
 * @param {string} contentType
 */
export async function uploadAudio(buffer, path, contentType = 'audio/webm') {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_AUDIO)
    .upload(path, buffer, { contentType, upsert: true })

  if (error) throw new Error(`Audio upload error: ${error.message}`)

  const { data: signed } = await supabaseAdmin.storage
    .from(BUCKET_AUDIO)
    .createSignedUrl(path, 60 * 60 * 24 * 7) // 7 dias

  return { path: data.path, signedUrl: signed?.signedUrl ?? null }
}
