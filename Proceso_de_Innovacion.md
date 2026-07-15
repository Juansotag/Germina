# Germina

### Proceso de innovación, emprendimiento y transferencia

Guía metodológica con asistente de inteligencia artificial
Propuesta preparada para Juan Carlos Camelo Vargas — Agente de Emprendimiento
Julio 2026

> **Objetivo:** crear una herramienta que estructure las propuestas de emprendedores e innovadores del ecosistema de la universidad para guiarlos a los servicios de la universidad y a lo largo de su proceso.

---

## Resumen ejecutivo

**Germina** es un asistente de inteligencia artificial que acompaña a estudiantes, profesores, investigadores, administrativos, graduados, aliados y externos de la Universidad de La Sabana a lo largo de todo un proceso de innovación: desde la primera idea hasta que se convierte en una empresa, una iniciativa dentro de su propia organización, o un activo de conocimiento transferido a un tercero.

**¿Para quién?** Para cualquier persona del ecosistema de la universidad que tenga una idea, un proyecto en curso, o algo que ya está funcionando y no sabe qué hacer con eso — sin necesitar conocimiento previo de metodologías de innovación. El acompañamiento se ajusta automáticamente según quién es el usuario y en qué momento está su proyecto.

**¿Qué resuelve?** Hoy ese acompañamiento depende casi por completo de la disponibilidad de un agente de emprendimiento humano y de que la persona sepa, por su cuenta, a qué oficina o servicio de la universidad acudir en cada momento. Germina estructura ese recorrido en nueve etapas claras, perfila automáticamente hacia dónde debe ir cada proyecto — emprendimiento, intraemprendimiento o transferencia — y conecta al usuario con los servicios correctos de la universidad, incluida la Oficina de Transferencia de Conocimiento (OTRI), en el momento adecuado. El nombre resume la apuesta: cada proyecto entra como una idea y Germina lo acompaña mientras germina hacia lo que tenga que ser.

---

## 1. Proceso de innovación, emprendimiento y transferencia

Esta guía presenta un proceso estructurado de acompañamiento en el que el usuario se ubica en uno de nueve momentos: una fase de caracterización, una fase de creación de proyecto, cinco etapas de un proceso de innovación basado en design thinking, un punto de bifurcación, una etapa de estructuración específica según la ruta elegida (emprendimiento, intraemprendimiento o transferencia), y una etapa final de implementación. En cada momento, un asistente de inteligencia artificial guía al usuario con recomendaciones prácticas y entregables concretos, sin exigirle conocimiento previo de metodologías de innovación.

### 1.1 Resumen del proceso

El proceso sigue una secuencia iterativa con un ciclo de aprendizaje continuo. Las etapas no son lineales: los resultados de la validación pueden llevar a redefinir el desafío o a generar nuevas ideas. La herramienta es, ante todo, un proceso para crear algo innovador — un producto, un servicio, un proceso o un modelo — no un proceso para decidir cómo hacer negocio con ello. La creación de valor económico y la transferencia de conocimiento son consecuencias posibles del proceso, no su objetivo central; por eso solo entran en juego después de que existe algo validado que ofrecer.

Antes de entrar al tronco de innovación, el proceso inicia con una fase -1 de caracterización del usuario (estudiante, graduado, profesor, investigador, administrativo, aliado o externo; su formación, conocimiento y experiencia), y una fase 0 de creación de proyecto, en la que se define nombre, objetivo, avances y, de forma crítica, el nivel de maduración del proyecto. Si el proyecto ya tiene ventas y un negocio en marcha, está más allá de la etapa 6 y el sistema lo ubica directamente en la etapa de estructuración de su ruta, sin recorrer las etapas 1 a 5.

> Nota: la lista de tipos de usuario se amplió respecto a la primera versión del documento — se agregaron **investigador** y **aliado** a partir de la descripción del menú lateral (sección 3).

El tronco central — etapas 1 a 5 — sigue la metodología de design thinking: exploración, definición, ideación, prototipado y validación. Estas etapas son agnósticas de la ruta final: su objetivo es producir un aprendizaje validado, no un modelo de negocio. Desde la etapa 4 el asistente empieza a perfilar al usuario como un potencial emprendedor o autor intelectual, y desde la etapa 5 la venta piloto se habilita como una señal de validación especialmente fuerte — vender, aunque sea a pequeña escala, es evidencia más contundente que cualquier encuesta.

Al cierre de la etapa 5, si hay algo validado que ofrecer, el proceso se bifurca según tres preguntas: ¿el creador quiere crear empresa propia? ¿el desarrollo pertenece a la misma organización del usuario? ¿el creador busca transferir el conocimiento generado a un tercero, sin crear empresa? Las respuestas ubican al usuario en una de tres rutas: emprendimiento, intraemprendimiento o transferencia.

La etapa 6, de estructuración por ruta, tiene un contenido distinto según la respuesta anterior. La ruta de emprendimiento se estructura con la metodología Business Model Canvas. La ruta de intraemprendimiento espeja el mismo ejercicio, pero construye un caso de negocio interno para la organización del usuario en lugar de crear una empresa. La ruta de transferencia no construye un modelo de negocio: prepara una ficha de identificación de activo de conocimiento y conecta al usuario con la Oficina de Transferencia de Conocimiento (OTRI) de la Universidad de La Sabana.

Las tres rutas convergen en la etapa 7, modelo de implementación. Para emprendimiento e intraemprendimiento, el asistente construye el plan de implementación, la gestión del cambio y las métricas de seguimiento. Para transferencia, el rol del asistente cambia: la ejecución la lleva OTRI a través de su propio ciclo de ocho pasos, y el asistente se limita a un acompañamiento ligero — recordatorios y checkpoints — mientras el usuario avanza por ese ciclo.

### 1.2 Mapa de las nueve etapas

| Momento | Nombre | Duración estimada |
|---|---|---|
| Fase -1 | Caracterización del usuario | 1 día |
| Fase 0 | Creación del proyecto | 1 día |
| 01 | Exploración | 2-4 semanas |
| 02 | Definición | 3-5 días |
| 03 | Ideación | 1-3 días |
| 04 | Prototipado | 1-2 semanas |
| 05 | Validación | 2-4 semanas |
| 06 | Estructuración por ruta | 2-6 semanas (varía según ruta) |
| 07 | Modelo de implementación | 3-6 meses |

*Entre la etapa 5 y la etapa 6 ocurre un punto de bifurcación (ver 2.8) que determina la ruta — emprendimiento, intraemprendimiento o transferencia — antes de continuar.*

---

## 2. Etapas del proceso

### 2.1 Fase -1 — Caracterización del usuario

**Descripción detallada**

Antes de acompañar a alguien en un proceso de innovación, el asistente necesita saber con quién está hablando. Un estudiante de pregrado sin experiencia previa requiere un acompañamiento distinto al de un profesor con trayectoria en investigación aplicada o al de un externo que ya dirige una empresa. Esta fase no evalúa ni califica al usuario: solo calibra el nivel de acompañamiento, el vocabulario y la profundidad de las explicaciones que el asistente usará en las etapas siguientes.

La caracterización se hace mediante una conversación breve, no un formulario extenso. El objetivo es obtener la información mínima necesaria para personalizar la experiencia sin convertir el primer contacto en una carga administrativa.

> **Caracterización.** Identificar quién es el usuario (estudiante, graduado, profesor, investigador, administrativo, aliado o externo), su formación y su experiencia previa, para calibrar el acompañamiento del asistente en todas las etapas siguientes.

**Herramientas clave**
- Cuestionario conversacional breve
- Preguntas de auto-reporte de experiencia

**Entregables**
- Perfil de usuario (rol, formación, experiencia)
- Nivel de acompañamiento calibrado

**Rol del asistente de IA**
El asistente conduce una conversación corta para identificar el rol del usuario en el ecosistema y su nivel de familiaridad con metodologías de innovación. Ajusta automáticamente el lenguaje y la profundidad de las etapas siguientes según este perfil, sin exponer al usuario a jerga metodológica innecesaria.

### 2.2 Fase 0 — Creación del proyecto

**Descripción detallada**

Cada usuario puede tener uno o más proyectos, y cada proyecto avanza por el proceso de forma independiente. Esta fase registra la identidad básica del proyecto — nombre, objetivo — y, de forma crítica, su nivel de maduración: si ya existen avances, si ya hay un prototipo, o si el proyecto ya genera ventas. Este dato decide en qué etapa se ubica el proyecto: uno que ya vende no necesita repetir la exploración ni la validación, y entra directamente a la etapa de estructuración de su ruta.

Definir mal el punto de partida es uno de los errores más costosos de un proceso de acompañamiento: hace perder tiempo a quien ya avanzó, o salta pasos críticos de quien apenas empieza. Por eso esta fase existe como paso independiente, y no como una pregunta más dentro de la exploración.

> **Creación de proyecto.** Registrar el proyecto (nombre, objetivo, avances) y determinar su nivel de maduración, que decide en qué etapa del proceso entra el usuario.

**Herramientas clave**
- Formulario conversacional de registro de proyecto
- Escala de nivel de maduración (idea, prototipo, ventas, negocio en marcha)

**Entregables**
- Ficha de proyecto (nombre, objetivo, avances)
- Nivel de maduración asignado
- Etapa de entrada al proceso

**Rol del asistente de IA**
El asistente registra el proyecto y, mediante preguntas dirigidas, determina objetivamente su nivel de maduración. Si detecta evidencia de ventas o negocio en marcha, ubica al proyecto directamente en la etapa 6 (estructuración por ruta) que le corresponda, evitando que el usuario repita trabajo ya hecho. En cualquier otro caso, lo ubica en la etapa 1.

### 2.3 Etapa 01 — Exploración y Descubrimiento

**Descripción detallada**

La exploración es la base de todo el proceso. Sin ella, los equipos corren el riesgo de innovar en la dirección equivocada. Esta etapa combina investigación primaria (directamente con usuarios) y secundaria (análisis de mercado, tendencias y competencia) para construir una imagen completa del espacio del problema.

Las técnicas de observación directa son especialmente valiosas porque revelan lo que los usuarios hacen, no solo lo que dicen. Las entrevistas en profundidad permiten explorar motivaciones, frustraciones y contextos que las encuestas no capturan.

> **01 · Exploración.** Identificar oportunidades reales observando el entorno: usuarios, mercado, tecnología y tendencias. El objetivo es descubrir necesidades insatisfechas o problemas que vale la pena resolver antes de diseñar cualquier solución. El error más común es saltarse esta etapa y resolver el problema equivocado.

**Herramientas clave**
- Entrevistas en profundidad
- Observación etnográfica
- Análisis PESTEL
- Mapa de tendencias
- Benchmarking competitivo
- Diario de usuario

**Entregables**
- Mapa de empatía
- Jobs-to-be-done identificados
- Hallazgos clave documentados
- Oportunidades priorizadas

**Rol del asistente de IA**
El asistente guía al usuario para diseñar preguntas de entrevista efectivas, analiza respuestas cualitativas para identificar patrones recurrentes y construye el mapa de empatía paso a paso mediante preguntas guiadas. No requiere experiencia previa en investigación de usuarios.

### 2.4 Etapa 02 — Definición del Desafío

**Descripción detallada**

Un buen enunciado del desafío cumple tres condiciones: identifica claramente al usuario afectado, describe la necesidad o problema desde su perspectiva, y está redactado de forma que invite soluciones diversas sin prescribir ninguna en particular.

El formato HMW (How Might We / Cómo podríamos) es el estándar de la industria porque equilibra amplitud y foco. Un desafío demasiado abierto genera soluciones dispersas; uno demasiado cerrado inhibe la creatividad. El punto dulce está en el medio.

> **02 · Definición.** Sintetizar los aprendizajes de la exploración en un enunciado del problema claro, específico y accionable. La técnica más usada es el formato "Cómo podríamos..." (HMW), que acota sin cerrar posibilidades creativas.

**Herramientas clave**
- HMW statements
- Point of View (POV)
- Problem framing
- Árbol de problemas
- 5 porqués

**Entregables**
- Enunciado del desafío (HMW)
- Criterios de éxito definidos
- Restricciones conocidas
- Métricas de validación

**Rol del asistente de IA**
El asistente transforma los hallazgos de exploración en enunciados HMW bien formulados, evalúa si el desafío está demasiado abierto o cerrado, y propone reformulaciones que maximizan el espacio de solución. También ayuda a priorizar entre múltiples desafíos posibles.

### 2.5 Etapa 03 — Ideación

**Descripción detallada**

La ideación efectiva requiere separar explícitamente la fase divergente (generar sin juzgar) de la fase convergente (seleccionar con criterio). Mezclarlas es el error más común y el que más inhibe la creatividad del equipo.

Las mejores ideas suelen emerger de analogías con sectores completamente diferentes. Un hospital puede aprender de la industria hotelera; una empresa de software puede inspirarse en la gastronomía. El asistente de IA es especialmente valioso aquí porque puede generar analogías cruzadas que los equipos humanos no considerarían naturalmente.

> **03 · Ideación.** Generar el mayor número posible de ideas sin filtros críticos. La divergencia es la prioridad: cantidad antes que calidad. Luego se converge mediante criterios estructurados hacia las ideas más prometedoras para prototipar.

**Herramientas clave**
- Brainstorming clásico
- SCAMPER
- Analogías de otros sectores
- Crazy 8s
- Votación silenciosa

**Entregables**
- 100+ ideas generadas
- Top 3-5 ideas priorizadas
- Justificación de selección
- Matriz impacto-esfuerzo

**Rol del asistente de IA**
El asistente facilita sesiones de ideación estructurada, propone analogías de otras industrias, aplica la técnica SCAMPER a las ideas existentes y evalúa el portafolio de ideas con la matriz de impacto/esfuerzo. Neutraliza los sesgos de confirmación típicos de los equipos.

### 2.6 Etapa 04 — Prototipado

**Descripción detallada**

El nivel de fidelidad del prototipo debe ser el mínimo necesario para responder las preguntas críticas de aprendizaje. Gastar semanas construyendo un prototipo sofisticado antes de validar hipótesis básicas es uno de los errores más costosos en innovación.

Para productos físicos, un boceto o maqueta de papel puede ser suficiente. Para servicios, un roleplay o storyboard. La regla es: el prototipo más barato que permita aprender lo más importante. A partir de esta etapa el asistente empieza a perfilar al usuario como un potencial emprendedor o autor intelectual, sin todavía hablar de modelo de negocio.

> **04 · Prototipado.** Convertir las ideas seleccionadas en representaciones tangibles de baja fidelidad para aprender rápido. El prototipo no es el producto final: es una herramienta de aprendizaje que se descarta o evoluciona con base en evidencia real.

**Herramientas clave**
- Bocetos en papel
- Storyboards
- Wireframes digitales
- Prototipo de servicio

**Entregables**
- Prototipo testeable
- Hipótesis a validar
- Guion de prueba de usuario
- Métricas de éxito del test

**Rol del asistente de IA**
El asistente sugiere el tipo de prototipo más adecuado según la naturaleza de la innovación (producto, proceso o servicio), genera guiones de prueba estructurados y ayuda a formular hipótesis medibles antes de iniciar la validación con usuarios.

### 2.7 Etapa 05 — Validación y Aprendizaje

**Descripción detallada**

La validación es el momento de la verdad del proceso. Aquí se descubre si el problema definido era el correcto, si la solución propuesta realmente lo resuelve, y si existe demanda real desde la perspectiva del usuario.

La decisión de pivotar, iterar o escalar debe basarse en evidencia, no en intuición. Un pivot no es un fracaso: es un aprendizaje que evita invertir recursos en la dirección incorrecta. Desde esta etapa se puede iniciar a vender: la venta piloto es una señal de validación especialmente fuerte, más contundente que cualquier encuesta.

Una técnica particularmente poderosa es la prueba de cobertura simulada o "fake door test": anunciar una oferta antes de tener la capacidad real de entregarla, para medir dónde existe demanda real. Rappi, por ejemplo, usó este principio ofreciendo cobertura en barrios donde en realidad no llegaba, para descubrir geográficamente dónde estaba la demanda antes de invertir en infraestructura de última milla.

> **05 · Validación.** Probar los prototipos con usuarios o clientes reales y recoger evidencia para decidir: pivotar, iterar o escalar. Esta etapa convierte suposiciones en datos. Un ciclo típico incluye 5 a 8 pruebas de usuario antes de tomar decisiones estratégicas.

**Herramientas clave**
- Pruebas de usuario moderadas
- Think aloud protocol
- A/B testing
- Encuestas de validación
- Entrevistas post-prototipo
- Fake door test (prueba de cobertura simulada)
- Venta piloto

**Entregables**
- Informe de aprendizajes
- Decisión: pivotar / iterar / escalar
- KPIs de validación
- Recomendaciones del siguiente paso
- Evidencia de venta piloto (si aplica)

**Rol del asistente de IA**
El asistente diseña los protocolos de prueba de usuario, analiza los resultados mediante patrones cualitativos y cuantitativos, e identifica señales críticas de validación o invalidación. Reconoce la venta piloto como la señal de validación más fuerte disponible y, cuando ocurre, la prioriza sobre cualquier otra métrica. Genera el informe de aprendizajes con recomendaciones claras y fundamentadas, y es también quien determina si existe algo validado para continuar hacia la bifurcación.

### 2.8 Bifurcación

**Descripción detallada**

Al cierre de la etapa 5 — o al ubicarse aquí directamente por nivel de maduración alto — el proceso deja de ser agnóstico: el usuario necesita elegir, o el asistente necesita ayudarlo a reconocer, hacia dónde va lo que construyó. Esta bifurcación no es una elección de metodología: es una elección de destino. ¿El activo se convierte en una empresa nueva, en una iniciativa dentro de una organización existente, o en conocimiento que se transfiere a un tercero?

La bifurcación solo tiene sentido si existe algo que bifurcar: sin un producto, proceso o modelo validado, no hay negocio que estructurar ni conocimiento que transferir. Por eso el asistente no ofrece esta decisión antes de que la etapa 5 (o su equivalente por maduración) produzca evidencia real.

| Pregunta | Ruta si la respuesta es sí |
|---|---|
| ¿El creador quiere crear una empresa propia e independiente? | Emprendimiento |
| ¿El desarrollo pertenece y seguirá perteneciendo a la organización del usuario? | Intraemprendimiento |
| ¿El creador no busca crear empresa, sino transferir el conocimiento generado a un tercero? | Transferencia |

**Rol del asistente de IA**
El asistente formula estas tres preguntas de forma conversacional, no como un cuestionario cerrado, y usa las respuestas junto con la evidencia recogida en las etapas anteriores para recomendar una ruta. La decisión final siempre queda en manos del usuario; el asistente puede señalar cuándo la evidencia sugiere una ruta distinta a la que el usuario está considerando, pero no la impone.

### 2.9 Etapa 06 — Estructuración por ruta

**Descripción detallada**

Esta etapa tiene un objetivo común a las tres rutas — dejar el activo listo para su siguiente destino — pero un contenido específico según la ruta elegida en la bifurcación. Un proyecto que llega aquí directamente desde la fase 0, por tener ya ventas o negocio en marcha, entra en el mismo punto que un proyecto que recorrió todo el tronco de innovación.

**Ruta de emprendimiento**

Se estructura con la metodología Business Model Canvas, construyendo cada uno de sus nueve bloques a partir de la evidencia recogida en las etapas anteriores.

- Herramientas: Business Model Canvas, Value Proposition Canvas, análisis de unit economics
- Entregables: Canvas de modelo de negocio completo, proyección financiera inicial, propuesta de valor validada
- Rol del asistente: completa el Business Model Canvas bloque por bloque junto con el usuario, señala inconsistencias entre bloques (por ejemplo, un canal que no corresponde al segmento de cliente definido) y estima unit economics básicos a partir de la información disponible.

**Ruta de intraemprendimiento**

Espeja el ejercicio de la ruta de emprendimiento, pero en lugar de construir una empresa independiente, construye un caso de negocio interno dirigido a la organización del usuario.

- Herramientas: Business Model Canvas adaptado a caso de negocio interno, análisis de alineación estratégica organizacional
- Entregables: caso de negocio interno, mapa de patrocinadores y stakeholders internos, estimación de recursos requeridos
- Rol del asistente: adapta el lenguaje del Business Model Canvas al de un caso de negocio interno (sponsor en lugar de inversionista, presupuesto interno en lugar de levantamiento de capital) y ayuda a identificar qué áreas de la organización deben involucrarse.

**Ruta de transferencia**

No construye un modelo de negocio: prepara al usuario para entrar al proceso de transferencia de conocimiento de la Universidad de La Sabana, gestionado por la Oficina de Transferencia de Conocimiento (OTRI). El entregable de esta etapa corresponde al primer paso del ciclo propio de OTRI: identificación del activo de conocimiento (ver sección 7).

- Herramientas: ficha de identificación de activo de conocimiento, checklist de elegibilidad para transferencia
- Entregables: ficha de identificación de AC lista para entregar a OTRI, contacto inicial con el equipo de transferencia
- Rol del asistente: traduce la evidencia generada en las etapas 1 a 5 al formato que OTRI necesita para su paso de identificación de activo de conocimiento, y facilita la conexión con el equipo de transferencia.

### 2.10 Etapa 07 — Modelo de implementación

**Descripción detallada**

Las tres rutas convergen aquí, aunque el rol del asistente cambia de forma importante según cuál fue la ruta.

**Emprendimiento e intraemprendimiento**

El escalamiento es frecuentemente la etapa más subestimada del proceso. Muchas innovaciones bien concebidas y validadas fracasan en la implementación por falta de un plan de cambio organizacional, recursos insuficientes o ausencia de métricas de seguimiento. Un escalamiento exitoso requiere alinear a los stakeholders clave, adaptar los procesos existentes, capacitar al equipo y establecer un sistema de monitoreo que permita ajustes continuos.

- Herramientas: plan de lanzamiento, OKRs de innovación, gestión del cambio, modelo financiero detallado, roadmap tecnológico
- Entregables: plan de implementación, modelo financiero, sistema de seguimiento (dashboard), estrategia de comunicación
- Rol del asistente: construye el plan de implementación por fases, define OKRs y KPIs de seguimiento adaptados al contexto organizacional, genera la narrativa de cambio para distintos públicos (directivos, equipo operativo, clientes) y facilita la comunicación a stakeholders.

**Transferencia**

Para esta ruta, la ejecución no la lleva el asistente sino OTRI, a través de su propio ciclo de ocho pasos: identificación del activo de conocimiento, viabilidad de creación de valor, análisis de riesgo, reducción de incertidumbre y valoración del activo — estos tres últimos en un ciclo iterativo —, definición de mecanismos de creación de valor, transferencia, y seguimiento y medición de impacto (ver sección 7). El rol del asistente se reduce a un acompañamiento ligero mientras el usuario avanza por ese ciclo.

- Herramientas: checkpoints periódicos, recordatorios de avance
- Entregables: registro de avance del usuario dentro del ciclo de OTRI
- Rol del asistente: no ejecuta ninguno de los ocho pasos de OTRI — eso corresponde al equipo de transferencia —, pero mantiene informado al usuario sobre en qué paso se encuentra su proceso y le recuerda las acciones pendientes de su parte.

---

## 3. Diseño visual y de producto

Especificación funcional de la herramienta: autenticación, infraestructura, y la interfaz que envuelve las nueve etapas descritas arriba.

### 3.1 Autenticación y acceso

- Autenticación con **Supabase**.
- Registro e inicio de sesión restringidos a correos del dominio `@unisabana.edu.co`.
- Inicio de sesión con usuario (correo) y contraseña.

### 3.2 Infraestructura y despliegue

- Despliegue en **Railway**, siguiendo el mismo patrón usado en otros proyectos del usuario.
- Base de datos también en Railway (Postgres), separada de Supabase — la suscripción actual de Supabase solo permite 2 proyectos y ya están ocupados, así que Supabase se usa únicamente como proveedor de autenticación, no de datos.
- **Nota técnica:** al vivir la autenticación en Supabase y los datos de negocio (proyectos, bitácoras) en Railway, el backend en Railway debe verificar el JWT de Supabase en cada petición y usar el `user_id` (UUID) de Supabase como llave foránea para todas las tablas propias. Es el patrón estándar cuando se separa auth de la base de datos de aplicación.

### 3.3 Landing page (antes de iniciar sesión)

- Ícono / logo de la herramienta.
- Botón **crear cuenta** → formulario de registro (correo institucional + contraseña).
- Botón **iniciar sesión** → formulario de correo + contraseña.

### 3.4 Primer ingreso: diagnóstico de usuario

Justo después de crear la cuenta (o del primer inicio de sesión), antes de mostrar cualquier otra pantalla, se presenta el formulario conversacional de la **fase -1** (caracterización — ver 2.1). Solo después de completarlo, el usuario llega al landing page interno (dashboard).

### 3.5 Estructura general de la aplicación (dashboard)

Layout de dos columnas:

- **Panel lateral izquierdo** (columna angosta):
  1. Foto de perfil, nombre y tipo de usuario (estudiante, profesor, investigador, administrativo, graduado, aliado o externo).
  2. Botón **crear proyecto**.
- **Área de trabajo** (columna ancha, 3/4 a 4/5 del ancho de pantalla): cuadrícula con los proyectos del usuario.

### 3.6 Sistema de proyectos (iconografía y estado)

Un usuario puede tener varios proyectos; cada proyecto avanza de forma independiente por el proceso. En la cuadrícula del área de trabajo, cada proyecto se representa como un ícono con:

- **Forma:** círculo, otra figura geométrica, o un ícono elegido por el usuario de una librería de íconos.
- **Color:** indica en qué proceso está el proyecto.
  - Amarillo → tronco principal de innovación (etapas 1-5)
  - Verde → modelo de negocio / ruta de emprendimiento
  - Azul → ruta de transferencia
  - Morado → ruta de intraemprendimiento
- **Número o subtítulo:** identifica la etapa exacta dentro de ese color (por ejemplo, "05" o "Validación").

Al hacer clic sobre un ícono se despliega un tooltip/menú con tres opciones: **abrir**, **editar** y **eliminar** el proyecto.

**Atributos mínimos de un proyecto** (borrador para discutir, ver 3.10):

| Atributo | Descripción |
|---|---|
| `id` | Identificador único |
| `owner_id` | UUID del usuario en Supabase |
| `nombre` | Nombre del proyecto |
| `icono` | Forma + color + referencia (si es de librería) |
| `ruta` | tronco / emprendimiento / intraemprendimiento / transferencia / sin definir |
| `etapa_actual` | -1, 0, 1, 2, 3, 4, 5, 6, 7 |
| `nivel_maduracion` | idea / prototipo / ventas / negocio en marcha |
| `fecha_creacion` | — |
| `fecha_ultima_actividad` | usada para la lógica de entradas de bitácora (3.7) |

### 3.7 Bitácora de proceso (vista de proyecto)

Al abrir un proyecto, la pantalla mantiene la misma estructura de dos columnas, pero cambia su contenido:

- **Panel lateral izquierdo:** listado de las entradas de la bitácora del proyecto (ver abajo), cada una mostrando el color y el número de etapa en que se encontraba el usuario en ese momento.
- **Área de trabajo:** la **bitácora de proceso** — una conversación con el asistente (texto o voz), equivalente a chatear con un LLM.

**Lógica de entradas (sesiones):**
- Cada vez que el usuario empieza a conversar con el asistente se registra fecha y hora.
- Si pasan más de **3 horas** desde la última interacción, la siguiente conversación se encapsula como una **entrada nueva** de la bitácora, en lugar de continuar la anterior.
- Esto permite que un usuario hable con el asistente, se tome un tiempo para investigar o construir un entregable fuera de la herramienta, y regrese después a continuar — sin mezclar todo en una sola conversación corrida.
- El propio asistente es quien, tras revisar lo que el usuario le entrega o le cuenta, decide si ya se puede avanzar a la siguiente etapa, o si conviene retroceder varias etapas por un hallazgo que lo amerite.

### 3.8 Diagnóstico inicial de proyecto (primera conversación)

La primera conversación de **todo** proyecto nuevo es, obligatoriamente, un diagnóstico: con ella el asistente ubica al usuario en la etapa y ruta adecuadas, en vez de asumir que todo proyecto arranca en la etapa 1.

Ejemplo de flujo: el asistente pide que el usuario le cuente sobre su proyecto, y luego indaga si es (a) algo que hace en el marco de su trabajo, (b) algo que quiere convertir en una fuente de ingresos, o (c) una actividad de investigación que quiere llevar a la realidad.

Casos ilustrativos:
- *"Es un proyecto de mi trabajo, pero lo quiero convertir en negocio personal y ya tengo algunas ventas"* → ruta de **emprendimiento**, y como ya hay ventas, el proyecto entra directo a la etapa 6 (estructuración por ruta) sin recorrer el tronco de innovación — aplica el atajo de madurez descrito en 2.2.
- *"Soy administrativo, optimicé un proceso en mi trabajo y quiero registrarlo a mi nombre para mejorar mi CV"* → el proyecto sí debe recorrer el tronco de innovación completo (1 a 5), con destino final en la ruta de **transferencia**.

### 3.9 Capacidades del asistente conversacional

El chat no es un chat genérico: tiene tres capacidades que debe tener siempre disponibles.

1. **Preguntas cerradas con salida abierta.** El asistente puede hacer preguntas de opción múltiple (A/B/C/D), pero siempre debe existir la posibilidad de responder libremente cuando ninguna opción cerrada se ajusta a la situación del usuario.
2. **Redacción de documentos.** Principalmente documentos Word, con una calidad y cuidado de formato comparable a los que genera Claude.ai en su versión web.
3. **Guía por etapa.** Para cada etapa, el asistente aclara conceptos, asigna tareas o actividades, y entrega plantillas para que el usuario las llene con la información que consiga. El asistente no puede buscar, descargar ni limpiar datos de internet por su cuenta, pero sí puede orientar al usuario sobre dónde conseguir esa información (datos abiertos del gobierno, foros de noticias, etc.) y qué hacer con ella una vez la tenga. El usuario hace el trabajo y se lo entrega de vuelta al asistente para revisión; si el resultado es suficientemente bueno, el asistente habilita el avance a la siguiente etapa.

### 3.10 Identidad de marca: nombre e ícono

La herramienta se llama **Germina** — cada proyecto entra como una idea y la herramienta lo acompaña mientras germina hacia lo que tenga que ser: una empresa, una iniciativa interna o un activo transferido.

El ícono ya está resuelto: una vaina/semilla abierta que deja ver los granos adentro, con dos hojas brotando arriba — la metáfora de germinación llevada directamente a la forma. Dos versiones, guardadas en la carpeta del proyecto:

- `logo_azul.png` — trazo en azul institucional (`#00135B`), para fondos claros. Esta es también la versión que funciona como **favicon**.
- `logo_blanco.png` — mismo ícono en blanco/contorno, para fondos oscuros (el navbar institucional, ver 3.11).

**Nota de color:** el azul institucional del logo (`#00135B`, navy) es distinto del "azul" reservado para la ruta de transferencia en los íconos de proyecto (3.6), pero son tonos de la misma familia. Como el navy va a dominar todo el chrome de la app (navbar, botones primarios — ver 3.11), se recomienda que el azul de "ruta de transferencia" en los íconos de proyecto sea un tono más claro o brillante, claramente distinguible del navy institucional, para que un ícono de proyecto no se confunda visualmente con la marca de fondo.

### 3.11 Sistema de diseño (heredado de GovLab)

Germina no diseña su interfaz desde cero: hereda el sistema de diseño que ya usan las demás herramientas del GovLab de la Universidad de La Sabana (ejemplo de referencia: el Simulador de Negociación, cuyo `style.css` se usó como base para lo que sigue). El objetivo es que todas las herramientas del GovLab se sientan parte de una misma familia, y que Antigravity tenga un punto de partida real — no un sistema de diseño que inventar.

**Doble marca en el header.** Todas las herramientas del GovLab muestran, además de su propio logo, el logo institucional `GovLab_blanco.png` (GovLab + Universidad de La Sabana) en el header, sobre fondo navy, separados por un divisor vertical — el mismo patrón que ya usa el Simulador de Negociación (`.header-brand` con `.header-logo` + `.header-divider`). Germina sigue esa misma convención: logo de Germina (`logo_blanco.png`, para que se vea sobre el navy) + divisor + logo de GovLab.

**Colores institucionales** (tokens ya definidos en el `style.css` de referencia):

| Token | Valor | Uso |
|---|---|---|
| `--c-blue-dark` | `#00135B` | Color principal: navbar, botones primarios, texto |
| `--c-blue-hover` | `#000e42` | Hover de botones primarios |
| `--c-blue-light` | `#00387D` | Foco, interacciones |
| `--c-blue-soft` | `#93AAC9` | Botones secundarios |
| `--c-blue-tint` | `#D9E1EF` | Bordes, fondos hover |
| `--c-cream` | `#F7EFD9` | Acento cálido |
| `--c-yellow` | `#f8a719` | Acento dorado |
| `--c-red` | `#96272D` | Rojo institucional (alertas, acciones destructivas) |

Estos son los colores de **marca** (chrome de la app). No hay que confundirlos con los cuatro colores **semánticos de ruta** de los íconos de proyecto (3.6: amarillo=tronco, verde=emprendimiento, azul=transferencia, morado=intraemprendimiento) — son dos sistemas de color distintos, con propósitos distintos, que conviven en la misma pantalla.

**Tipografía:** encabezados en "Publico Banner" (fuente institucional, peso 800), cuerpo y UI en "Libre Franklin" (Google Fonts, pesos 400-700).

**Componentes ya construidos y directamente reutilizables para Germina:**

- `.card` / `.card-header-row` — contenedor base para bloques de contenido (el dashboard y la vista de proyecto pueden apoyarse en esto).
- `button.primary` / `.secondary` / `.danger` / `.ghost` — cuatro variantes de botón ya resueltas.
- `.bubble.persona` / `.bubble.user` — burbujas de chat con distinción de rol y animación de entrada. Encaja directo con la bitácora de proceso (3.7): basta con mapear "persona" → asistente y "user" → usuario.
- `.modal-overlay` / `.modal-box` — modal reutilizable para el menú de abrir/editar/eliminar proyecto (3.6).
- `.status-line` con estados `active`/`loading` (punto de color con pulso) — útil para mostrar cuándo el asistente está generando una respuesta en la bitácora.
- Estilos `@media print` ya resueltos — relevante si más adelante se exportan reportes o entregables en PDF.

**Recomendación para Antigravity:** partir de este `style.css` tal cual, y solo *extenderlo* con lo específico de Germina (colores de ruta para íconos de proyecto, panel lateral de bitácora), en vez de construir un sistema de diseño nuevo.

### 3.12 Preguntas abiertas de esta sección

- **Esquema de datos de proyecto y bitácora:** el borrador de 3.6 es un punto de partida, no una decisión tomada — falta validar atributos y el modelo de la bitácora (entradas, mensajes).
- **Panel lateral dentro de un proyecto:** falta confirmar si el botón "crear proyecto" y el acceso al listado general de proyectos se mantienen visibles dentro de la vista de un proyecto abierto, o si el panel lateral en esa vista muestra únicamente las entradas de la bitácora.

---

## 4. Arquitectura de software

Especificación técnica para construir Germina con un agente de programación (Antigravity).

### 4.1 Decisiones de infraestructura

- **Autenticación:** Supabase Auth, restringida a correos `@unisabana.edu.co` (ver 3.1).
- **Base de datos de la aplicación:** Postgres en **Railway** — no en Supabase. La cuenta de Supabase del usuario solo permite 2 proyectos y ya están ocupados, así que Supabase se usa exclusivamente para autenticación (y, se propone abajo, para almacenamiento de archivos). Todos los datos propios de Germina (usuarios, proyectos, bitácora, documentos) viven en el Postgres de Railway.
- **Vínculo entre Supabase Auth y Railway:** el backend valida el JWT que emite Supabase en cada petición, y usa el `user_id` (UUID) de Supabase como llave primaria de la tabla `usuarios` en Railway. No hay una segunda tabla de usuarios con su propio id — se reutiliza el UUID de Supabase directamente.
- **Almacenamiento de archivos (documentos generados, subidos, y audio de la bitácora):** **Cloudflare R2**, un bucket S3-compatible. Se descarta Supabase Storage a propósito: meter también los archivos ahí acopla aún más cosas a un proveedor que ya tiene el límite de 2 proyectos como restricción activa. R2 es un servicio de un solo propósito (guardar archivos y servir URLs), no compite por el mismo límite de plan, no cobra por egreso, y cualquier librería S3 estándar funciona con él sin modificaciones — ni Railway ni Supabase quedan más enredados entre sí de lo que ya están.

### 4.2 Modelo de datos

Sobre tu propuesta original hay dos ajustes: "conversaciones" se separa en dos tablas (la sesión y los mensajes dentro de ella) para poder aplicar la regla de las 3 horas y el color/etapa por entrada descritos en 3.7; y la caracterización de fase -1 vive en `usuarios` (ocurre una sola vez, al crear la cuenta), mientras que la fase 0 vive en `proyectos` (ocurre una vez por proyecto).

```sql
-- Perfil de usuario. id = auth.users.id de Supabase (no se genera un id propio).
create table usuarios (
  id uuid primary key,
  correo text unique not null,
  nombre text,
  tipo_usuario text not null check (tipo_usuario in
    ('estudiante','profesor','investigador','administrativo','graduado','aliado','externo')),
  formacion text,
  experiencia_previa text,
  foto_perfil_url text,
  created_at timestamptz default now()
);

create table proyectos (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references usuarios(id),
  nombre text not null,
  objetivo text,
  icono_forma text,        -- 'circulo' | 'geometrica' | 'libreria:<id>'
  ruta text check (ruta in ('emprendimiento','intraemprendimiento','transferencia')), -- null = aún en el tronco (color amarillo)
  etapa_actual int not null default 0 check (etapa_actual between 0 and 7),
  nivel_maduracion text check (nivel_maduracion in ('idea','prototipo','ventas','negocio_en_marcha')),
  resumen_proceso text,     -- resumen vivo del proyecto, mantenido por el asistente (ver 4.3)
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  ultima_actividad_en timestamptz default now()
);

create table tareas (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid not null references proyectos(id) on delete cascade,
  etapa int not null,
  descripcion text not null,
  estado text not null default 'pendiente' check (estado in ('pendiente','completada')),
  created_at timestamptz default now(),
  completada_en timestamptz
);

-- Una entrada = una sesión de bitácora (se corta cuando pasan más de 3h sin actividad, ver 3.7)
create table entradas_bitacora (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid not null references proyectos(id) on delete cascade,
  etapa_en_ese_momento int not null,
  ruta_en_ese_momento text,
  iniciada_en timestamptz default now(),
  ultima_interaccion_en timestamptz default now()
);

create table mensajes (
  id uuid primary key default gen_random_uuid(),
  entrada_id uuid not null references entradas_bitacora(id) on delete cascade,
  rol text not null check (rol in ('usuario','asistente')),
  contenido text not null,        -- siempre texto: si vino de voz, es la transcripción
  tipo_entrada text not null default 'texto' check (tipo_entrada in ('texto','audio')),
  audio_url text,                 -- solo si tipo_entrada = 'audio' (R2), para poder reproducir el original
  created_at timestamptz default now()
);

create table documentos (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid not null references proyectos(id) on delete cascade,
  entrada_id uuid references entradas_bitacora(id),
  etapa int,
  tipo text check (tipo in ('generado_por_asistente','subido_por_usuario','plantilla')),
  nombre text not null,
  url text not null,        -- Cloudflare R2
  created_at timestamptz default now()
);
```

La lógica de "nueva entrada si pasan más de 3 horas" es del backend, no del LLM: al recibir un mensaje, se compara `now()` contra `ultima_interaccion_en` de la última entrada del proyecto; si la diferencia supera 3 horas se crea una entrada nueva, si no, se agrega el mensaje a la existente y se actualiza `ultima_interaccion_en`.

### 4.3 Qué ve el LLM en cada turno

En vez de darle al modelo acceso a SQL o a la base de datos completa, el backend arma un objeto de contexto antes de cada llamada:

```json
{
  "usuario": { "nombre": "...", "tipo_usuario": "...", "formacion": "..." },
  "proyecto": {
    "nombre": "...",
    "ruta": "emprendimiento",
    "etapa_actual": 6,
    "nivel_maduracion": "prototipo",
    "resumen_proceso": "...",
    "tareas_pendientes": [ { "descripcion": "...", "etapa": 6 } ],
    "documentos_recientes": [ { "nombre": "...", "etapa": 5 } ]
  },
  "etapa_config": {
    "descripcion": "...",
    "herramientas": ["..."],
    "entregables_esperados": ["..."],
    "rol_ia": "..."
  },
  "entrada_actual": {
    "mensajes_recientes": [ { "rol": "usuario", "contenido": "..." } ]
  }
}
```

`etapa_config` no sale de la base de datos: es un archivo de configuración estático (JSON) versionado junto con el código, derivado directamente de la sección 2 de este documento (descripción, herramientas, entregables y rol del asistente de cada etapa). Así, si cambia la metodología, se actualiza ese archivo y no hace falta tocar el modelo de datos.

El `resumen_proceso` es lo que evita que la conversación crezca sin control: en vez de reinyectar todo el historial de mensajes de todas las entradas anteriores, el backend mantiene un resumen corto que se actualiza cuando una entrada se da por cerrada (por la regla de las 3 horas). Los `mensajes_recientes` solo cubren la entrada activa.

### 4.4 Herramientas del asistente (function calling)

El LLM nunca escribe directo a la base de datos. Solo puede modificar el estado a través de funciones explícitas que el backend expone y valida:

- `actualizar_resumen_proceso(resumen)`
- `agregar_tarea(descripcion, etapa)`
- `completar_tarea(tarea_id)`
- `registrar_ruta(ruta)` — usada en la bifurcación (2.8)
- `avanzar_etapa(nueva_etapa, justificacion)`
- `retroceder_etapa(nueva_etapa, justificacion)`
- `generar_documento(tipo, titulo, contenido)` — genera el archivo (.docx u otro), lo sube a almacenamiento y crea la fila en `documentos`

Cada llamada queda registrada porque el estado que produce (nueva etapa, nueva tarea, nuevo documento) se guarda con marca de tiempo — no hace falta una tabla de auditoría aparte, la secuencia de `entradas_bitacora` ya funciona como historial de en qué etapa estuvo el proyecto y cuándo.

### 4.5 Generación de documentos

Para que los documentos generados tengan la calidad de formato que pides en 3.9 (comparable a Claude.ai web), se recomienda un servicio de generación aparte (no el LLM escribiendo el .docx directamente) que reciba contenido estructurado del LLM y lo convierta a Word con estilos, tablas y encabezados — el mismo enfoque que se usó para construir este documento en la sesión actual, con la librería `docx`.

### 4.6 Entrada de voz

La voz entra desde la primera versión, no como fase 2. Pipeline propuesto:

1. El navegador graba el audio con la API `MediaRecorder` (nativa, sin librerías adicionales) y lo envía al backend como un blob.
2. El backend sube el audio a Cloudflare R2 y lo pasa por un servicio de transcripción (voz a texto) — **Whisper (API de OpenAI)** es la recomendación por defecto: buen soporte de español, costo bajo, y es un servicio de un solo propósito que no depende de qué modelo termine usándose para las respuestas del asistente.
3. La transcripción resultante entra al pipeline exactamente igual que un mensaje escrito: se guarda en `mensajes` con `tipo_entrada = 'audio'` y `audio_url` apuntando al archivo en R2 (para que el usuario pueda reproducir lo que dijo si quiere), y `contenido` con el texto transcrito.
4. De ahí en adelante — construcción del contexto, function calling, todo lo descrito en 4.3 y 4.4 — no distingue si el mensaje vino de texto o de voz.

Mantener la transcripción desacoplada del LLM conversacional (en vez de depender de que ese modelo específico soporte audio nativo) evita que un cambio de proveedor de LLM más adelante obligue a rehacer también la entrada de voz.

### 4.7 Glosario: DNS, CDN y productos de Cloudflare

Conceptos generales de internet (no son de Cloudflare, cualquier proveedor los tiene):

- **DNS (Domain Name System):** la "guía telefónica" de internet. Las computadoras se hablan por direcciones IP (números), pero los humanos usamos nombres de dominio (`germina.app`). El DNS traduce el nombre a la dirección. Poner el dominio "en Cloudflare" significa que Cloudflare es quien responde esa traducción.
- **CDN (Content Delivery Network):** red de servidores repartidos por el mundo que guardan copias del contenido estático cerca de cada usuario, para que cargue más rápido y para que los ataques y picos de tráfico le peguen a la red del CDN antes que al servidor real.
- **S3 (Simple Storage Service):** el producto de almacenamiento de objetos de Amazon, el original — guarda archivos y los sirve por URL, a cualquier escala. Tan dominante que "S3-compatible" ahora es una frase genérica: significa que otro proveedor habla la misma API.

Productos específicos de Cloudflare usados o considerados para Germina:

- **R2:** la versión de Cloudflare de S3 — mismos buckets, misma API S3-compatible, pero sin costo de egreso. Es donde vive el almacenamiento de Germina (4.1).
- **Turnstile:** alternativa a reCAPTCHA; corre chequeos invisibles en vez de interrumpir al usuario con retos visuales. Candidato para el formulario de registro.
- **Workers:** cómputo serverless que corre en el edge (cerca del usuario, en vez de un solo datacenter). No es necesario para Germina — Railway ya cubre el backend.
- **Pages:** hosting de frontend con deploy automático desde git, tipo Vercel/Netlify. Redundante para Germina — Railway ya sirve el frontend.
- **D1:** base de datos SQL serverless de Cloudflare sobre SQLite. No aplica — Postgres en Railway es más maduro para el modelo relacional de Germina (4.2).

### 4.8 Preguntas abiertas de esta sección

Sin preguntas pendientes por ahora — almacenamiento (Cloudflare R2) y voz (Whisper, incluida desde v1) ya quedaron resueltos arriba.

---

## 5. Consideraciones finales

El proceso de innovación descrito en esta guía no es lineal. En la práctica, los equipos iteran entre etapas, regresan a la exploración cuando los hallazgos de validación lo requieren, o rediseñan prototipos múltiples veces. El ciclo de aprendizaje continuo es la característica definitoria de los procesos de innovación exitosos.

Las tres rutas de la etapa 6 no son excluyentes en el tiempo: un mismo usuario puede, en proyectos distintos, recorrer rutas distintas.

El asistente de IA no reemplaza la creatividad humana, la intuición de mercado ni el juicio estratégico del equipo. Su valor reside en estructurar el proceso, reducir la curva de aprendizaje metodológico, generar entregables de calidad y garantizar que ningún paso crítico sea omitido, especialmente en equipos que se aproximan por primera vez a la innovación sistemática.

Con la combinación de un proceso riguroso y un asistente inteligente, cualquier organización puede desarrollar capacidades de innovación sostenibles, independientemente del nivel de experiencia inicial de sus equipos.

---

## 6. Requerimientos del asistente de IA

A continuación se presentan los requerimientos clave para un asistente de inteligencia artificial que acompañe todo el proceso de innovación, diseñado específicamente para usuarios no expertos en metodologías de innovación.

### 6.1 Diseño de experiencia para no expertos

El asistente debe operar bajo un principio fundamental: el usuario no necesita saber metodología de innovación para poder innovar. Esto implica que el lenguaje debe ser completamente libre de jerga técnica, las instrucciones deben ser conversacionales y cada interacción debe concluir con una acción concreta y clara.

**Los cuatro pilares del diseño de experiencia del asistente son:**
- Acompañamiento progresivo: el asistente introduce conceptos metodológicos gradualmente, solo cuando son necesarios para avanzar.
- Feedback inmediato: cada entregable generado recibe retroalimentación automática sobre su calidad y completitud.
- Escalamiento inteligente: el asistente reconoce cuando una situación requiere la intervención de un experto humano y facilita esa conexión.
- Memoria de proyecto: el asistente mantiene coherencia entre etapas, recordando decisiones previas y alertando sobre contradicciones.

| Área | Requerimientos |
|---|---|
| Capacidades funcionales | Guía conversacional por etapa sin jerga metodológica · Generación de plantillas adaptadas al contexto · Análisis y síntesis de hallazgos · Producción de entregables listos para usar |
| Arquitectura técnica | Modelo de lenguaje con memoria de contexto larga · Salidas estructuradas (tablas, canvas, informes) · Integración con herramientas de productividad · APIs abiertas para extensión |
| Experiencia de usuario | Lenguaje libre de jerga metodológica · Flujo de acompañamiento, no evaluación · Cada interacción termina con acción concreta · Escalamiento a experto cuando se requiera |
| Integración con el proceso | Modo por etapa que reconoce la fase actual · Alertas proactivas ante saltos de etapa · Detección de errores comunes del proceso · Memoria de decisiones anteriores del proyecto |

---

## 7. Anexo — Oficina de Transferencia de Conocimiento (OTRI)

Referencia institucional para la ruta de transferencia de la etapa 6 y la etapa 7.

### 7.1 ¿Qué hacemos?

Apoyamos la transferencia de activos de conocimiento en la Universidad de La Sabana a través de cuatro ejes estratégicos:

- **Open U:** Universidad abierta a la innovación tecnológica y social.
- **PI+:** Generar una cultura de propiedad intelectual de alto valor.
- **TTx:** Transferencia de conocimiento de impacto exponencial.
- **CulturaINN:** Desarrollo y fomento de la cultura de innovación.

### 7.2 ¿Por qué lo hacemos?

Creemos firmemente en el poder del conocimiento para transformar la sociedad y generar impacto tangible, mejorando la calidad de vida de las personas, resolviendo problemas del entorno, aumentando la productividad y competitividad de las empresas y fomentando el desarrollo del ecosistema de innovación en el país.

### 7.3 ¿Qué es un activo de conocimiento?

La transferencia de conocimiento es el proceso mediante el cual los activos de conocimiento — recursos de base intelectual desarrollados o adaptados por la Universidad, con potencial de crear valor e impacto — llegan a otros usuarios (stakeholders) para su uso y adopción. Algunos ejemplos: patentes, software, diseños industriales, variedades vegetales, manuales, cartillas y metodologías, entre otros.

### 7.4 El ciclo de transferencia de OTRI

El proceso de OTRI recibe activos de conocimiento desde tres fuentes: docentes, proyección social e investigación. La ruta de transferencia de este proceso de innovación es una cuarta fuente de entrada, en el mismo punto: identificación del activo de conocimiento.

| # | Paso | Qué ocurre |
|---|---|---|
| 01 | Identificación de AC | Se reconoce y registra el activo de conocimiento. Punto de entrada de la ruta de transferencia de este proceso. |
| 02 | Viabilidad de creación de valor del AC | Se evalúa si el activo tiene potencial real de generar valor. |
| 03 | Análisis de riesgo | Ciclo iterativo junto con los pasos 04 y 05. |
| 04 | Reducción de incertidumbre | Ciclo iterativo junto con los pasos 03 y 05. |
| 05 | Valoración de AC | Ciclo iterativo junto con los pasos 03 y 04. |
| 06 | Definición de mecanismos de creación de valor | Se define cómo se transferirá el activo (licencia, spin-off, venta, entre otros). |
| 07 | Transferencia | Se ejecuta la transferencia del activo al tercero correspondiente. |
| 08 | Seguimiento y medición de impacto | Se mide el impacto generado tras la transferencia. |

### 7.5 Contacto del equipo de transferencia

| Nombre | Rol | Correo |
|---|---|---|
| César Parada | Director de Innovación y Emprendimiento | cesar.parada@unisabana.edu.co |
| Liliana Pinilla | Jefe de Transferencia de Conocimiento | liliana.pinilla3@unisabana.edu.co |
| Paula Andrea Roa | Coordinadora de Transferencia de Conocimiento | paula.roa@unisabana.edu.co |
