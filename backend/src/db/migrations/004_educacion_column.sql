-- =====================================================================
-- GERMINA -- Migracion 004: Campo educacion estructurado en usuarios
-- Guarda el array de diplomas como JSONB para poder editarlos
-- despues del onboarding desde la pantalla de perfil.
-- =====================================================================

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS educacion JSONB DEFAULT '[]';
