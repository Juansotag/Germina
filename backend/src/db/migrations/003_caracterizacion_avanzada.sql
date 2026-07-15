-- =====================================================================
-- GERMINA — Migración 003: Caracterización avanzada de usuarios
-- Soporta roles múltiples, detalles dinámicos en JSON y experiencia laboral estructurada.
-- =====================================================================

-- 1. Modificar tabla usuarios para soportar roles múltiples y JSON
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS detalles_roles JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS habilidades JSONB DEFAULT '{}';

-- 2. Crear tabla experiencia_laboral para historial tipo CV
CREATE TABLE IF NOT EXISTS experiencia_laboral (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id        UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  organizacion      TEXT NOT NULL,
  titulo            TEXT NOT NULL,
  responsabilidades TEXT,
  fecha_inicio      DATE NOT NULL,
  fecha_fin         DATE,
  actual            BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Índice para acelerar búsquedas de experiencia de un usuario
CREATE INDEX IF NOT EXISTS idx_experiencia_usuario ON experiencia_laboral (usuario_id);
