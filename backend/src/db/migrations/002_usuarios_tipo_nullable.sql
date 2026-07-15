-- =====================================================================
-- GERMINA — Migración 002
-- tipo_usuario permite NULL en la creación inicial del usuario.
-- Se rellena en la fase -1 (onboarding, Paso 7).
-- =====================================================================

ALTER TABLE usuarios
  ALTER COLUMN tipo_usuario DROP NOT NULL;
