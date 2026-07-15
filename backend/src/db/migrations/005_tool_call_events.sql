-- =====================================================================
-- GERMINA — Migración 005: Eventos persistentes de tool-calls
-- Amplía el CHECK de mensajes.rol para incluir 'evento'
-- =====================================================================

-- Ampliar el CHECK constraint de rol en mensajes
ALTER TABLE mensajes DROP CONSTRAINT IF EXISTS mensajes_rol_check;
ALTER TABLE mensajes ADD CONSTRAINT mensajes_rol_check
  CHECK (rol IN ('usuario', 'asistente', 'evento'));

-- Ampliar el CHECK de tipo_entrada para incluir 'tool_call'
ALTER TABLE mensajes DROP CONSTRAINT IF EXISTS mensajes_tipo_entrada_check;
ALTER TABLE mensajes ADD CONSTRAINT mensajes_tipo_entrada_check
  CHECK (tipo_entrada IN ('texto', 'audio', 'tool_call'));
