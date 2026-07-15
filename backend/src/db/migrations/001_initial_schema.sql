-- =====================================================================
-- GERMINA — Esquema inicial de base de datos
-- Railway / PostgreSQL
-- Ref: Proceso_de_Innovacion.md § 4.2
-- =====================================================================

-- Extensión para gen_random_uuid() (disponible por defecto en PG 13+)
-- En Railway/Postgres 14+ no hace falta habilitarla manualmente.

-- ─── 1. Perfil de usuario ─────────────────────────────────────────────
-- id = auth.users.id de Supabase (no se genera un id propio)
CREATE TABLE IF NOT EXISTS usuarios (
  id                 UUID        PRIMARY KEY,
  correo             TEXT        UNIQUE NOT NULL,
  nombre             TEXT,
  tipo_usuario       TEXT        NOT NULL CHECK (tipo_usuario IN (
                       'estudiante','profesor','investigador',
                       'administrativo','graduado','aliado','externo'
                     )),
  formacion          TEXT,
  experiencia_previa TEXT,
  foto_perfil_url    TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. Proyectos ──────────────────────────────────────────────────────
-- ruta = NULL mientras el proyecto está en el tronco principal (color amarillo)
CREATE TABLE IF NOT EXISTS proyectos (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id              UUID        NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre                TEXT        NOT NULL,
  objetivo              TEXT,
  icono_forma           TEXT,        -- 'circulo' | 'geometrica' | 'libreria:<id>'
  ruta                  TEXT        CHECK (ruta IN (
                          'emprendimiento','intraemprendimiento','transferencia'
                        )),          -- NULL = tronco (amarillo)
  etapa_actual          INT         NOT NULL DEFAULT 0 CHECK (etapa_actual BETWEEN 0 AND 7),
  nivel_maduracion      TEXT        CHECK (nivel_maduracion IN (
                          'idea','prototipo','ventas','negocio_en_marcha'
                        )),
  resumen_proceso       TEXT,        -- resumen vivo mantenido por el asistente (§ 4.3)
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  ultima_actividad_en   TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-actualizar updated_at en cada UPDATE
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_proyectos_updated_at ON proyectos;
CREATE TRIGGER trg_proyectos_updated_at
  BEFORE UPDATE ON proyectos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── 3. Tareas ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tareas (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id    UUID        NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  etapa          INT         NOT NULL,
  descripcion    TEXT        NOT NULL,
  estado         TEXT        NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','completada')),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  completada_en  TIMESTAMPTZ
);

-- ─── 4. Entradas de bitácora ────────────────────────────────────────────
-- Una entrada = una sesión (se corta cuando pasan más de 3h sin actividad, § 3.7)
CREATE TABLE IF NOT EXISTS entradas_bitacora (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id            UUID        NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  etapa_en_ese_momento   INT         NOT NULL,
  ruta_en_ese_momento    TEXT,
  iniciada_en            TIMESTAMPTZ DEFAULT NOW(),
  ultima_interaccion_en  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 5. Mensajes ───────────────────────────────────────────────────────
-- Si el mensaje vino de voz: contenido = transcripción, audio_url = archivo en R2
CREATE TABLE IF NOT EXISTS mensajes (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  entrada_id    UUID        NOT NULL REFERENCES entradas_bitacora(id) ON DELETE CASCADE,
  rol           TEXT        NOT NULL CHECK (rol IN ('usuario','asistente')),
  contenido     TEXT        NOT NULL,
  tipo_entrada  TEXT        NOT NULL DEFAULT 'texto' CHECK (tipo_entrada IN ('texto','audio')),
  audio_url     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 6. Documentos ─────────────────────────────────────────────────────
-- url apunta a Cloudflare R2
CREATE TABLE IF NOT EXISTS documentos (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id  UUID        NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  entrada_id   UUID        REFERENCES entradas_bitacora(id),
  etapa        INT,
  tipo         TEXT        CHECK (tipo IN (
                 'generado_por_asistente','subido_por_usuario','plantilla'
               )),
  nombre       TEXT        NOT NULL,
  url          TEXT        NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Índices de rendimiento ────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_proyectos_owner        ON proyectos (owner_id);
CREATE INDEX IF NOT EXISTS idx_proyectos_etapa        ON proyectos (etapa_actual);
CREATE INDEX IF NOT EXISTS idx_tareas_proyecto        ON tareas (proyecto_id);
CREATE INDEX IF NOT EXISTS idx_tareas_estado          ON tareas (proyecto_id, estado);
CREATE INDEX IF NOT EXISTS idx_entradas_proyecto      ON entradas_bitacora (proyecto_id);
CREATE INDEX IF NOT EXISTS idx_entradas_ultima        ON entradas_bitacora (proyecto_id, ultima_interaccion_en DESC);
CREATE INDEX IF NOT EXISTS idx_mensajes_entrada       ON mensajes (entrada_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_created       ON mensajes (entrada_id, created_at);
CREATE INDEX IF NOT EXISTS idx_documentos_proyecto    ON documentos (proyecto_id);
