# Roadmap de construcción — Germina

Plan paso a paso para desarrollar Germina con un agente de programación (Antigravity). Cada paso es una tarea acotada, con un resultado revisable por una persona antes de pasar al siguiente — nada de "construye toda la app" en un solo prompt.

Para el detalle completo de cada decisión referenciada aquí (modelo de datos, contexto del LLM, sistema de diseño, etc.), ver [`Proceso_de_Innovacion.md`](./Proceso_de_Innovacion.md), sección indicada entre paréntesis.

La estructura de carpetas (`frontend/`, `backend/`) ya está creada y vacía — se va llenando en el orden de este roadmap, no antes.

IMPORTANTE: no realizar DOM, correr en local y preguntar al usuario desarrollador

---

## Fase 0 — Esqueleto y sistema de diseño

**Paso 1 — Inicializar el proyecto**
Elegir el framework de frontend (ej. Next.js o React + Vite) y de backend (ej. Node + Express o Fastify), inicializar ambos dentro de `frontend/` y `backend/` con la configuración mínima, sin ninguna pantalla ni endpoint real todavía.
*Revisar: que `frontend` y `backend` corran localmente cada uno con un "hello world".*

**Paso 2 — Aplicar el sistema de diseño heredado (3.11)**
Mover `style.css`, `logo_azul.png`, `logo_blanco.png` y `GovLab_blanco.png` (están en la raíz del proyecto) a `frontend/src/styles/` y `frontend/src/assets/branding/`. También está en la raíz `PublicoBannerWeb-LightItalic_govlab.woff2`, la fuente institucional que `style.css` carga por `@font-face` desde `/static/fonts/` — debe ir a esa misma ruta relativa dentro de `frontend/public/` para que el `@font-face` seguir apuntando ahí sin editar el CSS. Construir el shell visual vacío: header con el doble logo (Germina + GovLab, separados por el divisor), sidebar vacío, área de trabajo vacía. Sin datos, sin rutas, sin lógica.
*Revisar: que el shell se vea consistente con las otras herramientas del GovLab (mismos colores, tipografía, proporciones).*

**Paso 3 — Landing page pre-login (3.3)**
Ícono, botón "crear cuenta", botón "iniciar sesión", con navegación entre pantallas — sin autenticación real todavía, solo la UI y el flujo de clics.
*Revisar: que el flujo visual (landing → registro / login) tenga sentido antes de conectar nada real.*

---

## Fase 1 — Autenticación y base de datos

**Paso 4 — Supabase Auth (3.1)**
Configurar Supabase Auth restringido a `@unisabana.edu.co`, y conectar los botones de la landing page a un flujo de registro/login real.
*Revisar: crear una cuenta de prueba con un correo institucional y confirmar que un correo externo es rechazado.*

**Paso 5 — Esquema de base de datos (4.2)**
Crear el Postgres en Railway y correr las migraciones de `usuarios`, `proyectos`, `tareas`, `entradas_bitacora`, `mensajes`, `documentos` en `backend/src/db/migrations/`. Sin datos de prueba todavía, solo el esquema.
*Revisar: que las tablas y llaves foráneas existan tal como están en el documento.*

**Paso 6 — Vincular Supabase con Railway (4.1)**
Middleware en el backend que valida el JWT de Supabase, y crea la fila en `usuarios` la primera vez que alguien inicia sesión.
*Revisar: iniciar sesión con la cuenta de prueba y confirmar que aparece una fila nueva en `usuarios`.*

---

## Fase 2 — Dashboard con datos simulados

**Paso 7 — Formulario de fase -1 (2.1, 3.4)**
El formulario de caracterización que se muestra justo después del primer login, con las preguntas de rol/formación/experiencia. Usar datos mock — todavía no se guarda en la base de datos real.
*Revisar: que el formulario se sienta breve y conversacional, no como un trámite.*

**Paso 8 — Dashboard con proyectos mock (3.5, 3.6)**
Grid de proyectos con 2-3 proyectos falsos, distintos colores de ruta (amarillo/verde/azul/morado) y distintas etapas, sin backend real de proyectos todavía.
*Revisar exactamente lo que se pidió al arrancar esto: cargar el mockup y buscar errores — de iconografía, de color, de layout, de proporción del sidebar vs. área de trabajo.*

**Paso 9 — Menú de proyecto (3.6)**
Tooltip/menú de abrir / editar / eliminar al hacer clic en un ícono de proyecto (todavía sobre datos mock).
*Revisar: que la interacción se sienta natural y no ambigua.*

---

## Fase 3 — Proyectos reales

**Paso 10 — CRUD de proyectos (2.2)**
Conectar el dashboard a Railway: crear, listar, editar y eliminar proyectos de verdad. La fase 0 (creación de proyecto) queda funcional de principio a fin — todavía sin el asistente.
*Revisar: crear un proyecto real y verlo aparecer en el dashboard con su ícono correcto.*

**Paso 11 — Vista de proyecto / bitácora (3.7)**
Layout de dos columnas al abrir un proyecto: sidebar con las entradas de la bitácora (mock) y área de trabajo para la conversación (todavía sin chat funcional).
*Revisar: que el layout y el listado de entradas lateral tengan sentido visualmente.*

---

## Fase 4 — El asistente conversacional

**Paso 12 — Chat básico**
Integrar el LLM elegido con un system prompt simple, sin function calling todavía. Los mensajes se guardan de verdad en `mensajes`, pero sin lógica de etapas ni contexto de proyecto.
*Revisar: mantener una conversación de prueba y confirmar que los mensajes persisten.*

**Paso 13 — Contexto por turno (4.3)**
Armar el objeto de contexto real (usuario, proyecto, resumen, `etapa_config`) antes de cada llamada al LLM.
*Revisar: que el asistente responda con conocimiento correcto del proyecto y la etapa actual.*

**Paso 14 — Function calling, una función a la vez (4.4)**
Agregar `agregar_tarea`, `completar_tarea`, `actualizar_resumen_proceso`, `registrar_ruta`, `avanzar_etapa`, `retroceder_etapa` — de a una, probando cada una antes de agregar la siguiente.
*Revisar cada función por separado: que el estado en la base de datos cambie como se espera.*

**Paso 15 — Regla de las 3 horas (3.7)**
Lógica de corte de entradas de bitácora: nueva entrada si pasan más de 3 horas desde la última interacción.
*Revisar: forzar el corte manualmente (ajustando una fecha en la base de datos) y confirmar que se crea una entrada nueva.*

---

## Fase 5 — Capacidades avanzadas

**Paso 16 — Generación de documentos (4.5)**
`generar_documento` produce un `.docx`, lo sube a R2, y crea la fila en `documentos`.
*Revisar: generar un documento de prueba desde el chat y abrirlo en Word.*

**Paso 17 — Entrada de voz (4.6)**
Grabación en el navegador (`MediaRecorder`), subida a R2, transcripción con Whisper, mensaje guardado con `tipo_entrada = 'audio'`.
*Revisar: grabar un mensaje de prueba y confirmar que la transcripción es correcta.*

**Paso 18 — Cloudflare (3.2, 4.1, 4.7)**
DNS del dominio, bucket de R2 conectado en producción (no solo en desarrollo), Turnstile en el formulario de registro.
*Revisar: que el dominio real cargue y que subir/generar un archivo funcione en producción.*

---

## Fase 6 — Bifurcación y cierre

**Paso 19 — Bifurcación y las tres rutas (2.8, 2.9)**
Las tres preguntas de bifurcación, y el contenido específico de etapa 6 para cada ruta (Business Model Canvas, ficha de transferencia, caso de negocio interno).
*Revisar con un caso de prueba por cada una de las tres rutas.*

**Paso 20 — Pulido de punta a punta**
Manejo de errores, estados de carga, y una corrida completa del flujo con un usuario de prueba real, desde el registro hasta la etapa 6.
*Revisar: que una persona nueva pueda completar el recorrido sin quedarse atascada en ningún punto.*
