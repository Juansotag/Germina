/**
 * POST /api/demo/proyecto
 *
 * Crea los 4 proyectos de ejemplo con historial COMPLETO de etapas,
 * tarjetas de bifurcacion, tareas y documentos.
 *
 * Mock-ups:
 *   1. PolyCheck       — tronco (innovacion amarillo), etapa 3 - Ideacion
 *   2. TutorUni        — emprendimiento (verde),        etapa 6 - Estructuracion
 *   3. BioSensor UDES  — transferencia (azul),          etapa 6 - Estructuracion
 *   4. GovAssist       — intraemprendimiento (morado),  etapa 6 - Estructuracion
 */
import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { query } from '../db/index.js'
import { generarDocx } from '../lib/docgen.js'
import { uploadDoc } from '../lib/storage.js'

const router = Router()

// ─── Helpers ─────────────────────────────────────────────────────────────────
function hace(horas) {
  return new Date(Date.now() - horas * 3600000).toISOString()
}

async function crearEntrada(proyectoId, etapa, ruta, horas, horasFin = null) {
  const inicio = hace(horas)
  const fin = horasFin ? hace(horasFin) : inicio
  const { rows: [eb] } = await query(
    `INSERT INTO entradas_bitacora
       (proyecto_id, etapa_en_ese_momento, ruta_en_ese_momento, iniciada_en, ultima_interaccion_en)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING id`,
    [proyectoId, etapa, ruta, inicio, fin]
  )
  return eb.id
}

async function msgs(entradaId, mensajes) {
  for (const m of mensajes) {
    await query(
      `INSERT INTO mensajes (entrada_id, rol, contenido, tipo_entrada)
       VALUES ($1,$2,$3,$4)`,
      [entradaId, m.rol, m.contenido, m.tipo ?? 'texto']
    )
  }
}

function ev(tool, input, result = { ok: true }) {
  return { rol: 'evento', contenido: JSON.stringify({ tool, input, result }), tipo: 'tool_call' }
}

async function tarea(proyectoId, descripcion, etapa, completada = false) {
  await query(
    `INSERT INTO tareas (proyecto_id, descripcion, etapa, estado, completada_en)
     VALUES ($1,$2,$3,$4,$5)`,
    [proyectoId, descripcion, etapa,
      completada ? 'completada' : 'pendiente',
      completada ? new Date().toISOString() : null]
  )
}

async function subirDoc(proyectoId, tipo, titulo, contenido, etapa, meta) {
  const buffer = await generarDocx({ tipo, titulo, contenido, meta })
  const key = `${proyectoId}/${Date.now()}-${titulo.replace(/[^a-z0-9]/gi,'_').toLowerCase().slice(0,40)}.docx`
  const url = await uploadDoc(buffer, key)
  await query(
    `INSERT INTO documentos (proyecto_id, etapa, tipo, nombre, url) VALUES ($1,$2,'generado_por_asistente',$3,$4)`,
    [proyectoId, etapa, titulo, url]
  )
  return url
}

async function proyecto(userId, campos) {
  const { rows: [p] } = await query(
    `INSERT INTO proyectos (owner_id, nombre, objetivo, icono_forma, ruta, etapa_actual, nivel_maduracion, resumen_proceso)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
    [userId, campos.nombre, campos.objetivo, campos.icono, campos.ruta,
      campos.etapa, campos.nivel, campos.resumen]
  )
  return p.id
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK-UP 1: PolyCheck — Innovacion (tronco), etapa 3
// ═══════════════════════════════════════════════════════════════════════════════
async function crearPolyCheck(userId) {
  const id = await proyecto(userId, {
    nombre: 'PolyCheck - Verificador de hechos',
    objetivo: 'Herramienta de verificacion de hechos en tiempo real para periodistas, usando IA multilingue.',
    icono: 'Microscope', ruta: null, etapa: 3, nivel: 'idea',
    resumen: 'Exploracion completa con 15 entrevistas a periodistas (80% dedica 20-45 min por dato). Desafio definido. En ideacion evaluando modelos de distribucion. Proxima etapa: prototipado del plugin Chrome.',
  })

  // ── Etapa 0: Creacion ───────────────────────────────────────────────────
  const e0 = await crearEntrada(id, 0, null, 24 * 28, 24 * 27)
  await msgs(e0, [
    { rol: 'usuario', contenido: 'Hola, tengo una idea para ayudar a periodistas a verificar noticias falsas con IA. Quiero que puedan comprobar hechos en segundos en lugar de horas.' },
    { rol: 'asistente', contenido: 'Bienvenido a Germina. Es una idea con potencial real en un momento donde la desinformacion es un problema estructural.\n\nAntes de arrancar, necesito entender el contexto:\n\n1. ¿Ya existe algo construido o es solo la idea?\n2. ¿Lo quieres como negocio, como herramienta gratuita, o como proyecto de investigacion?\n3. ¿Que te llevo a pensar en esto?' },
    { rol: 'usuario', contenido: 'Solo es la idea. Lo quiero como negocio, venderselo a medios de comunicacion. Vi que en mi trabajo en un periodico digital perdiamos horas verificando cosas manualmente y a veces igual cometemos errores.' },
    { rol: 'asistente', contenido: 'Perfecto, tienes un problema real vivido de primera mano.\n\n**Ruta:** Emprendimiento (modelo B2B, ventas a medios).\n**Siguiente paso:** Salir a validar si ese problema es generalizado o particular de tu empresa.\n\n**Primera tarea:** Habla con al menos 8 periodistas o editores de diferentes medios. No les preguntes si comprarian la herramienta. Preguntales como verifican hechos hoy, cuanto tiempo les toma y que pasa cuando se equivocan.\n\nCon eso construimos sobre datos reales.' },
    ev('agregar_tarea', { descripcion: 'Realizar 8 entrevistas con periodistas sobre su proceso de verificacion de hechos', etapa: 1 }),
    ev('avanzar_etapa', { nueva_etapa: 1, justificacion: 'Proyecto registrado con ruta y objetivo claros. Listo para exploracion.' }),
  ])

  // ── Etapa 1: Exploracion ────────────────────────────────────────────────
  const e1 = await crearEntrada(id, 1, null, 24 * 21, 24 * 20)
  await msgs(e1, [
    { rol: 'usuario', contenido: 'Hice 15 entrevistas a periodistas de 6 medios diferentes. El 80% dice que verificar un dato les toma entre 20 y 45 minutos. El 60% ha publicado algo incorrecto alguna vez. Los de noticias de ultimo minuto son los que mas sufren. Usan Google, bases de datos de agencias y a veces llaman directamente a fuentes.' },
    { rol: 'asistente', contenido: 'Excelente trabajo de campo. Hay un patron claro y consistente.\n\n**Hallazgos clave:**\n- Problema real y generalizado: 15 entrevistas, 6 medios distintos\n- Segmento mas afectado: periodistas de ultima hora\n- Tiempo promedio de verificacion: 20-45 minutos por dato\n- Errores con consecuencias reales: correcciones publicas, perdida de anunciantes\n\nSi bajas ese tiempo a 2-3 minutos, tienes una propuesta de valor muy clara.\n\n**Para cerrar la exploracion:** ¿Cuanto le cuesta a un medio publicar una noticia incorrecta en terminos de reputacion? ¿Tienes algun caso concreto?' },
    { rol: 'usuario', contenido: 'Varios mencionaron casos de correcciones publicas que danan la credibilidad. Uno conto que perdieron un anunciante importante despues de publicar un dato erroneo sobre esa empresa.' },
    { rol: 'asistente', contenido: 'Perfecto. Ya tienes todo lo necesario para cerrar la exploracion y pasar a Definicion.\n\n**Resumen de hallazgos:**\n- Mercado objetivo: periodistas de medios digitales, cobertura de ultima hora\n- Dolor validado: 20-45 min de verificacion, 60% ha publicado errores\n- Consecuencias economicas reales: perdida de anunciantes por errores\n- Dispuesto a pagar: el ROI de evitar un error es mayor al costo de la herramienta\n\nPasamos a Definicion. En la proxima sesion trabajaremos el mapa de empatia de tu usuario principal.' },
    ev('completar_tarea', { tarea_id: 'mock-poly-1' }),
    ev('actualizar_resumen_proceso', { resumen: 'Exploracion completa: 15 entrevistas, 6 medios. Problema validado: 20-45 min verificacion, 60% errores. Segmento clave: periodistas de ultima hora.' }),
    ev('avanzar_etapa', { nueva_etapa: 2, justificacion: 'Exploracion con evidencia solida y consistente completada.' }),
  ])

  // ── Etapa 2: Definicion ─────────────────────────────────────────────────
  const e2 = await crearEntrada(id, 2, null, 24 * 14, 24 * 13)
  await msgs(e2, [
    { rol: 'usuario', contenido: 'Trabaje el mapa de empatia. Mi usuario tipico es un periodista digital de 28 anos, que cubre politica y redes sociales. Siente presion constante por publicar primero y miedo a equivocarse. Su editor le exige velocidad y no tiene tiempo de verificar todo.' },
    { rol: 'asistente', contenido: 'Ese mapa de empatia captura bien la tension central: velocidad vs. precision. Tu usuario vive ese dilema todos los dias y la presion de publicar primero es estructural, no un capricho.\n\n**Enunciado del desafio propuesto:**\n\n> ¿Como podriamos ayudar a periodistas de medios digitales a verificar hechos en tiempo real, reduciendo el riesgo de errores publicos, sin sacrificar la velocidad de publicacion?\n\nEste enunciado mantiene la tension real, esta centrado en el usuario y no presupone la solucion. ¿Lo apruebas o quieres ajustar algo?' },
    { rol: 'usuario', contenido: 'Me parece bien. Vamos a ideacion.' },
    { rol: 'asistente', contenido: 'Perfecto. El enunciado queda aprobado.\n\nPara la proxima sesion quiero que traigas al menos 15 ideas, sin filtro y sin autocensura. Todas cuentan: tecnologicas, manuales, locas. Despues las evaluamos juntos con criterios claros.' },
    ev('avanzar_etapa', { nueva_etapa: 3, justificacion: 'Enunciado del desafio definido y aprobado.' }),
  ])

  // ── Etapa 3: Ideacion (sesion vigente reciente) ─────────────────────────
  const e3 = await crearEntrada(id, 3, null, 2, 1)
  await msgs(e3, [
    { rol: 'usuario', contenido: 'Traje 20 ideas. Las mas interesantes para mi: 1) Plugin de Chrome que verifica en tiempo real mientras escribes, 2) Bot de WhatsApp al que consultas, 3) API que los medios integran en su CMS, 4) Dashboard con alertas de desinformacion trending en tiempo real.' },
    { rol: 'asistente', contenido: 'Buenas ideas. Evaluemoslas con dos criterios: impacto en el usuario y viabilidad tecnica inicial.\n\n| Idea | Impacto usuario | Viabilidad inicial | Nota |\n|---|---|---|---|\n| Plugin Chrome | Alto | Media | Integra en el flujo real de trabajo |\n| Bot WhatsApp | Medio | Alta | Rapido pero fuera del flujo editorial |\n| API para CMS | Alto | Baja | Requiere integracion con cada CMS distinto |\n| Dashboard alertas | Medio | Media | Mas reactivo que preventivo |\n\n**Recomendacion:** El plugin de Chrome tiene la mejor combinacion. Esta donde el periodista ya trabaja y no requiere cambiar habitos.\n\n**Para la proxima sesion:** Define con tu equipo tecnico que APIs usarian y construye el flujo en papel.' },
    ev('agregar_tarea', { descripcion: 'Disenar mockup en papel del flujo del plugin Chrome con el equipo tecnico', etapa: 3 }),
    ev('agregar_tarea', { descripcion: 'Definir que APIs se usaran para la verificacion (OpenAI, busqueda web, bases de datos)', etapa: 3 }),
  ])

  // Tareas
  await tarea(id, 'Realizar 8 entrevistas con periodistas sobre su proceso de verificacion', 1, true)
  await tarea(id, 'Disenar mockup en papel del flujo del plugin Chrome', 3, false)
  await tarea(id, 'Definir que APIs se usaran para la verificacion', 3, false)

  return id
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK-UP 2: TutorUni — Emprendimiento, etapa 6
// ═══════════════════════════════════════════════════════════════════════════════
async function crearTutorUni(userId) {
  const id = await proyecto(userId, {
    nombre: 'TutorUni - Tutores entre pares',
    objetivo: 'Conectar estudiantes con companeros de cursos superiores para apoyo academico remunerado dentro de la universidad.',
    icono: 'GraduationCap', ruta: 'emprendimiento', etapa: 6, nivel: 'ventas',
    resumen: '120 sesiones vendidas en 2 meses. 2.1M COP de ingresos. Empresa en proceso de constitucion. Evaluando modelo de franquicia para otras universidades y desarrollando app movil v1.',
  })

  // ── Etapa 0: Creacion ───────────────────────────────────────────────────
  const e0 = await crearEntrada(id, 0, null, 24 * 60, 24 * 59)
  await msgs(e0, [
    { rol: 'usuario', contenido: 'Hola, quiero crear algo que conecte estudiantes con tutores entre pares en la universidad. La idea es cobrar a los estudiantes por las sesiones.' },
    { rol: 'asistente', contenido: 'Bienvenido. Idea con potencial. Dos preguntas rapidas:\n\n1. ¿Ya existe algo construido o es solo la idea?\n2. ¿Lo quieres como negocio independiente o como iniciativa dentro de la universidad?' },
    { rol: 'usuario', contenido: 'Solo es la idea. Lo quiero como mi propio negocio. Vi que muchos companeros reprueban materias y los tutores privados son muy caros.' },
    { rol: 'asistente', contenido: 'Perfecto. Tienes un problema real observado de primera mano.\n\n**Ruta:** Emprendimiento (negocio propio con ingresos).\n\n**Primera tarea:** Habla con al menos 8 estudiantes de primer y segundo semestre. Preguntales como buscan ayuda cuando tienen dificultades academicas, cuanto pagan ahora y que les frena. No les preguntes si comprarian tu servicio.' },
    ev('agregar_tarea', { descripcion: 'Realizar 8 entrevistas con estudiantes de primeros semestres sobre dificultades academicas', etapa: 1 }),
    ev('avanzar_etapa', { nueva_etapa: 1, justificacion: 'Proyecto registrado. Listo para exploracion.' }),
  ])

  // ── Etapa 1: Exploracion ────────────────────────────────────────────────
  const e1 = await crearEntrada(id, 1, null, 24 * 53, 24 * 52)
  await msgs(e1, [
    { rol: 'usuario', contenido: 'Hice 15 entrevistas. El 80% ha reprobado o estado a punto de reprobar alguna materia. Los tutores externos cuestan 40.000 a 80.000 pesos la hora. Los estudiantes dijeron que pagarian entre 15.000 y 25.000 por una sesion de 2 horas con un par. 6 de los 15 dijeron que darian tutoria si les pagaran.' },
    { rol: 'asistente', contenido: 'Datos muy solidos. Tienes una brecha de precio real y oferta potencial identificada.\n\n**Hallazgos clave:**\n- Problema confirmado: 8 de cada 10 con dificultades academicas serias\n- Barrera: precio prohibitivo de tutores externos (40-80k COP/hora)\n- Disposicion a pagar: 15-25k COP por sesion de par (7.500-12.500/hora)\n- Oferta: 40% de los entrevistados daria tutoria\n- Materias con mayor demanda: Calculo, Estadistica, Programacion\n\nPasamos a Definicion. Necesito que trabajes el mapa de empatia del estudiante que mas se repitio en las entrevistas.' },
    ev('completar_tarea', { tarea_id: 'mock-tutor-1' }),
    ev('actualizar_resumen_proceso', { resumen: 'Exploracion: 15 entrevistas. Problema validado. Brecha de precio real. 6/15 dispuestos a dar tutoria. Materias: Calculo, Estadistica, Programacion.' }),
    ev('avanzar_etapa', { nueva_etapa: 2, justificacion: 'Exploracion con datos cuantitativos y cualitativos suficientes.' }),
  ])

  // ── Etapa 2: Definicion ─────────────────────────────────────────────────
  const e2 = await crearEntrada(id, 2, null, 24 * 46, 24 * 45)
  await msgs(e2, [
    { rol: 'usuario', contenido: 'Trabaje el mapa de empatia. Mi usuario tipico: estudiante de 2do semestre de Ingenieria, reprobo Calculo el semestre pasado. Siente verguenza de pedir ayuda al profesor y no puede pagar un tutor externo. Quiere pasar la materia sin sentir que es el unico que no entiende.' },
    { rol: 'asistente', contenido: 'Ese mapa de empatia es muy bueno. Identificaste algo que va mas alla del precio: la barrera emocional.\n\nTu usuario no solo tiene un problema economico. Tiene un problema de autoestima academica. Un par de carrera que "paso por lo mismo" es mucho mas accesible emocionalmente que un tutor externo.\n\n**Enunciado del desafio:**\n\n> ¿Como podriamos ayudar a estudiantes de primeros semestres de Ingenieria a conseguir apoyo academico asequible y sin la barrera de la verguenza, conectandolos con companeros que ya pasaron por las mismas materias?\n\n¿Lo apruebas o quieres ajustar algo?' },
    { rol: 'usuario', contenido: 'Me parece muy bien. Vamos a idear.' },
    ev('avanzar_etapa', { nueva_etapa: 3, justificacion: 'Desafio definido con dimension emocional. Aprobado por el usuario.' }),
  ])

  // ── Etapa 3: Ideacion ───────────────────────────────────────────────────
  const e3 = await crearEntrada(id, 3, null, 24 * 38, 24 * 37)
  await msgs(e3, [
    { rol: 'usuario', contenido: 'Genere 25 ideas. Las mejores para mi: 1) App movil donde el estudiante publica que necesita tutoria, 2) Canal de WhatsApp donde se publican tutores disponibles, 3) Sistema de creditos universitarios para los tutores.' },
    { rol: 'asistente', contenido: '| Idea | Impacto | Facilidad inicial | Nota |\n|---|---|---|---|\n| App movil | Alto | Baja | Costosa para empezar |\n| Canal WhatsApp | Medio | Alta | Rapido para validar |\n| Creditos universitarios | Alto | Media | Requiere acuerdo institucional |\n\n**Recomendacion:** Empieza con WhatsApp o Telegram como prototipo minimo. No necesitas una app para validar si la gente usa el servicio y paga. Esta logica se llama Mago de Oz: operas manualmente mientras validas la demanda real.\n\nSi funciona, construyes la plataforma con ingresos reales.' },
    ev('avanzar_etapa', { nueva_etapa: 4, justificacion: 'Idea seleccionada: prototipo de canal WhatsApp para validar demanda.' }),
  ])

  // ── Etapa 4: Prototipado ────────────────────────────────────────────────
  const e4 = await crearEntrada(id, 4, null, 24 * 30, 24 * 29)
  await msgs(e4, [
    { rol: 'usuario', contenido: 'Cree el canal, diseñe un formulario de Google para que los estudiantes pidan su tutoria, y arme una hoja de calculo para llevar el registro. Tambien diseñe un logo basico.' },
    { rol: 'asistente', contenido: 'Tienes un prototipo funcional de operacion manual.\n\n**Lo que tienes:**\n- Canal de coordinacion (WhatsApp)\n- Formulario de solicitud (Google Forms)\n- Sistema de registro (Sheets)\n- Identidad visual basica (logo)\n\n**Plan de lanzamiento del piloto:**\n1. Contacta personalmente a los estudiantes que dijeron que pagarian\n2. Ofrece las primeras 3 sesiones con 30% de descuento (14.000 COP)\n3. Pide retroalimentacion escrita despues de cada sesion\n\n**Meta:** 5 sesiones pagadas. Con eso pasamos a Validacion.' },
    ev('agregar_tarea', { descripcion: 'Conseguir 5 sesiones pagadas en las primeras 2 semanas del piloto', etapa: 4 }),
    ev('avanzar_etapa', { nueva_etapa: 5, justificacion: 'Prototipo funcional listo para pruebas con usuarios reales.' }),
  ])

  // ── Etapa 5: Validacion + bifurcacion ──────────────────────────────────
  const e5 = await crearEntrada(id, 5, null, 24 * 18, 24 * 17)
  await msgs(e5, [
    { rol: 'usuario', contenido: 'El piloto funciono muy bien. En 10 dias tuve 20 sesiones pagadas a 18.000 pesos cada una. Ingrese 360.000 COP. Los tutores estan contentos, los estudiantes tambien. Dos de ellos me pidieron repetir.' },
    { rol: 'asistente', contenido: 'Felicitaciones: validaste el modelo de negocio.\n\n**Resultados del piloto:**\n- 20 sesiones en 10 dias\n- Ingreso bruto: 360.000 COP\n- 2 clientes recurrentes\n- Satisfaccion alta en ambos lados\n\nAhora viene la decision mas importante del proyecto. Hay tres caminos posibles:\n\n**A. Emprendimiento** — construyes tu propio negocio, escalas a otras universidades, buscas inversion.\n**B. Intraemprendimiento** — lo desarrollas dentro de la universidad como iniciativa institucional con su respaldo.\n**C. Transferencia** — cedes el modelo a otra organizacion que lo opere y recibes royalties.\n\n¿Cual encaja con tu proyecto de vida?' },
    { rol: 'usuario', contenido: 'Quiero construir mi propio negocio. Ya estoy pensando en expandirlo a otras universidades de la ciudad.' },
    { rol: 'asistente', contenido: 'Ruta confirmada: Emprendimiento.\n\nTu proyecto entra a la fase de Estructuracion. Los pasos inmediatos son: formalizar la empresa, definir el modelo de expansion y construir el equipo fundador.\n\nBienvenido a la etapa 6.' },
    ev('completar_tarea', { tarea_id: 'mock-tutor-4' }),
    ev('registrar_ruta', { ruta: 'emprendimiento' }),
    ev('actualizar_resumen_proceso', { resumen: '20 sesiones en piloto, 360k COP. Modelo validado. Ruta de emprendimiento confirmada. En estructuracion.' }),
    ev('avanzar_etapa', { nueva_etapa: 6, justificacion: '20 sesiones pagadas, 2 clientes recurrentes. Modelo de negocio validado con ingresos reales.' }),
  ])

  // ── Etapa 6: Estructuracion (sesion activa) ─────────────────────────────
  const e6 = await crearEntrada(id, 6, 'emprendimiento', 1, 0)
  await msgs(e6, [
    { rol: 'usuario', contenido: 'Ya llevamos 120 sesiones totales en 2 meses, 2.1 millones de COP de ingresos. Estoy pensando en crear la app movil y expandir a 3 universidades mas antes de terminar el semestre.' },
    { rol: 'asistente', contenido: '2.1M en 2 meses con operacion manual es una senal clara de product-market fit. Es el momento correcto para estructurar.\n\n**Para la estructuracion necesitas definir tres cosas:**\n\n1. **Modelo legal:** ¿SAS unipersonal o con socios? ¿Ya tienes el NIT?\n2. **Modelo de expansion:** ¿Franquicia (cada universidad paga licencia) o modelo directo (tu operas todo centralmente)?\n3. **Equipo:** Necesitas al menos un cofundador tecnico para la app\n\n**Recomendacion de hoy:** Prioriza la formalizacion legal antes que la app. Una empresa formalizada te permite facturar, contratar y hacer alianzas universitarias formales.\n\n¿Quieres que te genere un resumen ejecutivo del modelo de negocio para presentar a inversionistas?' },
    { rol: 'usuario', contenido: 'Si, necesito ese documento para una reunion con un fondo de inversion la proxima semana.' },
    { rol: 'asistente', contenido: 'Generando el resumen ejecutivo de TutorUni.' },
    ev('generar_documento', { tipo: 'informe', titulo: 'Resumen Ejecutivo TutorUni - Modelo de Negocio', contenido: '' }),
    ev('agregar_tarea', { descripcion: 'Consultar con un abogado la constitucion de la empresa como SAS', etapa: 6 }),
    ev('agregar_tarea', { descripcion: 'Definir modelo de expansion: franquicia vs. operacion directa', etapa: 6 }),
  ])

  await tarea(id, 'Realizar 8 entrevistas con estudiantes de primeros semestres', 1, true)
  await tarea(id, 'Conseguir 5 sesiones pagadas en el piloto', 4, true)
  await tarea(id, 'Consultar con un abogado la constitucion de la empresa como SAS', 6, false)
  await tarea(id, 'Definir modelo de expansion: franquicia vs. operacion directa', 6, false)
  await tarea(id, 'Reclutar cofundador tecnico para desarrollo de app movil', 6, false)

  await subirDoc(id, 'informe', 'Resumen Ejecutivo TutorUni - Modelo de Negocio', `
## Descripcion del Negocio

TutorUni conecta estudiantes con dificultades academicas con companeros de cursos superiores que ya dominan esas materias. El modelo cobra 18.000 COP por sesion de 2 horas; el tutor recibe 13.000 COP y la plataforma retiene 5.000 COP.

## Problema

- 8 de cada 10 estudiantes de primeros semestres tienen dificultades en Calculo, Estadistica o Programacion.
- Los tutores privados cuestan 40.000-80.000 COP por hora, inaccesible para la mayoria.
- La barrera no es solo economica: hay verguenza academica de pedir ayuda al profesor.

## Traccion

| Metrica | Valor |
|---|---|
| Sesiones vendidas | 120 |
| Ingresos acumulados | 2.100.000 COP |
| Tiempo de operacion | 2 meses |
| Tasa de repeticion | 35% |

## Modelo de Negocio

- Comision del 28% por sesion (5.000 COP de 18.000 COP)
- Costo variable cero (tutores son independientes)
- Canal inicial: WhatsApp; expansion a app movil en desarrollo
- Escalado: licencia de operacion por campus universitario

## Proyeccion

Con 4 universidades activas (1.000 estudiantes), ingreso mensual proyectado: 15.000.000 COP con margen del 65%.

## Solicitud

Buscamos 80.000.000 COP de inversion semilla a cambio del 15% para: app movil (50M), expansion a 3 universidades (20M) y operaciones 12 meses (10M).
`, 6, { proyectoNombre: 'TutorUni', usuarioNombre: 'Usuario Germina', etapaNombre: 'Estructuracion' })
  return id
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK-UP 3: BioSensor UDES — Transferencia, etapa 6
// ═══════════════════════════════════════════════════════════════════════════════
async function crearBioSensor(userId) {
  const id = await proyecto(userId, {
    nombre: 'BioSensor UDES - Deteccion de patogenos',
    objetivo: 'Transferir tecnologia de biosensor universitario para deteccion rapida de patogenos en alimentos a empresas del sector.',
    icono: 'Microscope', ruta: 'transferencia', etapa: 6, nivel: 'prototipo',
    resumen: 'Biosensor con 94% de precision validado en planta ALIMEX S.A. Ruta de transferencia tecnologica. Tramite de patente en proceso. En negociacion de contrato de licencia con royalties del 5%.',
  })

  // ── Etapa 0: Creacion ───────────────────────────────────────────────────
  const e0 = await crearEntrada(id, 0, null, 24 * 70, 24 * 69)
  await msgs(e0, [
    { rol: 'usuario', contenido: 'Hola, soy parte del grupo de investigacion de microbiologia de la universidad. Desarrollamos un biosensor que detecta patogenos en alimentos en 15 minutos. No sabemos que hacer con la tecnologia.' },
    { rol: 'asistente', contenido: 'Interesante punto de partida: tienen la solucion y necesitan encontrar el mercado correcto.\n\nAlgunas preguntas importantes:\n1. ¿La tecnologia tiene patente o hay articulos publicados?\n2. ¿Quien la desarrollo: la universidad, un grupo de investigacion, un investigador individual?\n3. ¿Tienen ya contacto con alguna empresa que pudiera usarla?' },
    { rol: 'usuario', contenido: 'Hay 2 articulos publicados pero sin patente todavia. La desarrollo el profesor Martinez con su equipo en 3 anos de investigacion. No hemos contactado empresas todavia.' },
    { rol: 'asistente', contenido: 'Entendido. La tecnologia existe y tiene respaldo cientifico publicado.\n\n**Siguiente paso:** Salir a explorar el mercado. Antes de pensar en que hacer con la tecnologia, necesitan entender si hay un problema real que resuelve y quien sufre ese problema hoy.\n\n**Tarea:** Hablen con al menos 6 empresas del sector alimentos sobre como hacen el control de calidad microbiologico hoy, cuanto tiempo toma y que pasa cuando falla.' },
    ev('agregar_tarea', { descripcion: 'Realizar 6 entrevistas con empresas del sector alimentos sobre su proceso de control microbiologico', etapa: 1 }),
    ev('avanzar_etapa', { nueva_etapa: 1, justificacion: 'Tecnologia existente con publicaciones. Listo para exploracion de mercado.' }),
  ])

  // ── Etapa 1: Exploracion ────────────────────────────────────────────────
  const e1 = await crearEntrada(id, 1, null, 24 * 60, 24 * 59)
  await msgs(e1, [
    { rol: 'usuario', contenido: 'Hicimos 8 entrevistas con empresas del sector alimentos. 6 de 8 dijeron que el tiempo de deteccion actual es un problema critico: los metodos actuales toman 24 a 48 horas. Una empresa tuvo que retirar un lote completo porque la alerta llego demasiado tarde. El retiro costo 80 millones de pesos.' },
    { rol: 'asistente', contenido: 'El mercado esta ahi. 15 minutos vs 24-48 horas es una ventaja competitiva enorme.\n\n**Hallazgos clave:**\n- Problema confirmado: deteccion tardiva tiene consecuencias economicas graves\n- 6 de 8 empresas lo viven como problema critico\n- Caso concreto: retiro de lote = 80 millones de perdida\n- Tu tecnologia resuelve exactamente este problema\n\n**Pregunta clave:** ¿El metodo es suficientemente simple para usarlo en planta sin laboratorio especializado, o requiere condiciones de laboratorio?' },
    { rol: 'usuario', contenido: 'Actualmente requiere condiciones de laboratorio, pero el profesor dice que en 6 meses podria tener una version portatil que funcione en planta.' },
    { rol: 'asistente', contenido: 'Ese es exactamente el desafio de diseno que necesitan resolver. Pasamos a Definicion para establecer los requisitos del producto desde la perspectiva del usuario industrial.' },
    ev('completar_tarea', { tarea_id: 'mock-bio-1' }),
    ev('avanzar_etapa', { nueva_etapa: 2, justificacion: 'Mercado validado con 8 entrevistas. Problema con consecuencias economicas claras.' }),
  ])

  // ── Etapa 2: Definicion ─────────────────────────────────────────────────
  const e2 = await crearEntrada(id, 2, null, 24 * 48, 24 * 47)
  await msgs(e2, [
    { rol: 'usuario', contenido: 'El usuario es el jefe de calidad de una planta de alimentos. Necesita resultados en menos de 30 minutos, que el equipo sea operable por personal sin formacion de laboratorio, y que cueste menos que los metodos actuales.' },
    { rol: 'asistente', contenido: 'Perfecto. Los tres requisitos del usuario son claros y medibles.\n\n**Enunciado del desafio:**\n\n> ¿Como llevar la tecnologia de biosensor a plantas de produccion de alimentos en Colombia, de forma que sea operable sin laboratorio especializado, entregue resultados en menos de 30 minutos y sea economicamente competitiva?\n\nEste enunciado define los requisitos minimos del prototipo de planta. ¿Lo apruebas?' },
    { rol: 'usuario', contenido: 'Si, ese es exactamente el desafio.' },
    ev('avanzar_etapa', { nueva_etapa: 3, justificacion: 'Desafio definido con requisitos claros y medibles del usuario industrial.' }),
  ])

  // ── Etapa 3: Ideacion ───────────────────────────────────────────────────
  const e3 = await crearEntrada(id, 3, null, 24 * 38, 24 * 37)
  await msgs(e3, [
    { rol: 'usuario', contenido: 'Evaluamos tres modelos: 1) Vender el dispositivo directamente a las empresas, 2) Licenciar la tecnologia a un fabricante, 3) Crear una empresa spin-off.' },
    { rol: 'asistente', contenido: '| Modelo | Ingresos potenciales | Riesgo | Complejidad |\n|---|---|---|---|\n| Venta directa | Alto | Alto | Alta (fabricar) |\n| Licencia a fabricante | Medio | Bajo | Baja |\n| Spin-off universitaria | Alto | Alto | Muy alta |\n\nDada la preferencia del profesor por seguir investigando, el modelo de licencia parece el mas alineado. Pero hay que validarlo con un prototipo funcional en planta primero.' },
    ev('avanzar_etapa', { nueva_etapa: 4, justificacion: 'Modelos de comercializacion evaluados. Avanzar a prototipo de planta.' }),
  ])

  // ── Etapa 4: Prototipado ────────────────────────────────────────────────
  const e4 = await crearEntrada(id, 4, null, 24 * 28, 24 * 27)
  await msgs(e4, [
    { rol: 'usuario', contenido: 'El profesor desarrollo una version portatil del biosensor. Tiene bateria, pantalla de resultados y un proceso simplificado de 3 pasos. ALIMEX acepto hacer una prueba en su planta de Bogota.' },
    { rol: 'asistente', contenido: 'Excelente avance. El prototipo portatil resuelve la restriccion de laboratorio que identificaron en la definicion.\n\nPara la prueba en planta de ALIMEX necesitan:\n1. Protocolo de prueba claro (cuantas muestras, en cuales condiciones)\n2. Alguien que capacite al personal en los 3 pasos\n3. Un formulario para registrar los resultados vs. el metodo actual\n\n¿Tienen todo esto listo?' },
    { rol: 'usuario', contenido: 'Si, el profesor va a estar presente en la prueba y tenemos el protocolo definido.' },
    ev('avanzar_etapa', { nueva_etapa: 5, justificacion: 'Prototipo portatil listo. Prueba en planta de ALIMEX programada.' }),
  ])

  // ── Etapa 5: Validacion + bifurcacion ──────────────────────────────────
  const e5 = await crearEntrada(id, 5, null, 24 * 18, 24 * 17)
  await msgs(e5, [
    { rol: 'usuario', contenido: 'La prueba en planta fue exitosa. El biosensor detecto los 3 patogenos de prueba con 94% de precision en 12 minutos promedio. El jefe de calidad quedo muy impresionado. ALIMEX esta interesada en adquirir la tecnologia.' },
    { rol: 'asistente', contenido: 'Validacion tecnica solida en condiciones reales de produccion.\n\nAhora la decision mas importante. Tres caminos:\n\n**A. Transferencia tecnologica** — licencian la tecnologia a ALIMEX. La universidad recibe regalias o pago unico. El grupo no opera el negocio.\n**B. Emprendimiento** — crean una empresa spin-off que fabrica y vende el dispositivo. Mas riesgo, mas retorno potencial.\n**C. Intraemprendimiento** — la universidad crea una unidad interna de comercializacion.\n\n¿El profesor Martinez quiere operar un negocio o prefiere seguir investigando?' },
    { rol: 'usuario', contenido: 'El profesor definitivamente quiere seguir investigando. La universidad quiere recibir regalias sin tener que operar un negocio. ALIMEX ya hizo una oferta formal de licencia.' },
    { rol: 'asistente', contenido: 'Ruta clara: Transferencia tecnologica.\n\nEs la opcion correcta dado el perfil del equipo y los objetivos de la universidad. Los pasos inmediatos:\n1. Patentar la tecnologia antes de firmar cualquier contrato\n2. Negociar los terminos de la licencia con asesoria juridica\n3. Definir contrato con apoyo de la oficina de transferencia tecnologica de la universidad' },
    ev('registrar_ruta', { ruta: 'transferencia' }),
    ev('actualizar_resumen_proceso', { resumen: 'Prototipo validado en planta ALIMEX (94% precision, 12 min). Ruta de transferencia tecnologica confirmada. Oferta formal de licencia recibida.' }),
    ev('avanzar_etapa', { nueva_etapa: 6, justificacion: 'Tecnologia validada en condiciones reales. Oferta de licencia formal de empresa interesada.' }),
  ])

  // ── Etapa 6: Estructuracion ─────────────────────────────────────────────
  const e6 = await crearEntrada(id, 6, 'transferencia', 3, 2)
  await msgs(e6, [
    { rol: 'usuario', contenido: 'La oficina de propiedad intelectual de la universidad inicio el tramite de la patente. ALIMEX ofrece exclusividad en Colombia por 5 anos y el 3% de regalias sobre ventas brutas.' },
    { rol: 'asistente', contenido: 'Los terminos son razonables pero hay margen de negociacion.\n\n**Analisis de la oferta:**\n- 3% de royalty: rango bajo-medio para tecnologia de proceso industrial (estandar 3-8%)\n- Exclusividad 5 anos Colombia: limita licenciar a otros actores en el pais durante ese periodo\n\n**Recomendaciones:**\n1. Negociar el royalty al 5% si la exclusividad es total en Colombia\n2. Agregar clausula de minimo garantizado anual (ej. 12M COP/ano independiente de ventas)\n3. Reservar derechos de licencia para mercados fuera de Colombia\n4. Incluir clausula de revision a los 2 anos con opcion de renegociar\n\n¿Tienen abogado especializado en propiedad intelectual o lo gestiona la oficina de transferencia?' },
    ev('agregar_tarea', { descripcion: 'Revisar contrato de licencia con abogado de PI antes de firmar', etapa: 6 }),
    ev('generar_documento', { tipo: 'informe', titulo: 'Analisis de Terminos de Licencia BioSensor UDES', contenido: '' }),
  ])

  await tarea(id, 'Realizar 6 entrevistas con empresas del sector alimentos', 1, true)
  await tarea(id, 'Coordinar y ejecutar prueba piloto en planta ALIMEX', 5, true)
  await tarea(id, 'Revisar contrato de licencia con abogado de PI antes de firmar', 6, false)
  await tarea(id, 'Solicitar clausula de minimo garantizado en la negociacion con ALIMEX', 6, false)

  await subirDoc(id, 'informe', 'Analisis de Terminos de Licencia BioSensor UDES', `
## Contexto

El biosensor del grupo de investigacion de la UDES fue validado en la planta de ALIMEX S.A. con 94% de precision en 12 minutos. ALIMEX presentó una oferta de licencia exclusiva para Colombia por 5 anos con royalties del 3% sobre ventas brutas.

## Analisis de la Oferta

| Termino | Oferta ALIMEX | Rango estandar | Evaluacion |
|---|---|---|---|
| Royalty | 3% ventas brutas | 3-8% tecnologia industrial | Bajo-medio |
| Exclusividad | Colombia, 5 anos | Negociable | Limita a otros actores |
| Minimo garantizado | No incluido | Recomendado | Riesgo para universidad |
| Territorios | Solo Colombia | - | Derechos externos libres |

## Riesgos

- Sin minimo garantizado: si ALIMEX no vende, la universidad no recibe regalias.
- Exclusividad amplia en Colombia por 5 anos es restrictiva.
- Sin clausula de revision ante cambios de mercado.

## Recomendaciones

1. Negociar royalty al 5% si la exclusividad es total en Colombia.
2. Incluir minimo garantizado anual de 12.000.000 COP.
3. Reservar derechos de licencia fuera de Colombia.
4. Agregar clausula de revision a los 2 anos.
5. Establecer obligacion de ALIMEX de comercializar activamente.
`, 6, { proyectoNombre: 'BioSensor UDES', usuarioNombre: 'Usuario Germina', etapaNombre: 'Estructuracion - Transferencia' })
  return id
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK-UP 4: GovAssist — Intraemprendimiento, etapa 6
// ═══════════════════════════════════════════════════════════════════════════════
async function crearGovAssist(userId) {
  const id = await proyecto(userId, {
    nombre: 'GovAssist - Asistente de tramites ciudadanos',
    objetivo: 'Asistente de IA para orientar a ciudadanos en tramites ante la alcaldia, reduciendo filas y tiempo de espera.',
    icono: 'Building2', ruta: 'intraemprendimiento', etapa: 6, nivel: 'prototipo',
    resumen: 'Piloto con 200 ciudadanos redujo tiempo de orientacion de 45 a 8 minutos (82% de mejora). Ruta: intraemprendimiento. Respaldo del alcalde. En proceso de presentacion al Concejo para aprobacion de presupuesto.',
  })

  // ── Etapa 0: Creacion ───────────────────────────────────────────────────
  const e0 = await crearEntrada(id, 0, null, 24 * 65, 24 * 64)
  await msgs(e0, [
    { rol: 'usuario', contenido: 'Hola, trabajo en la alcaldia municipal y quiero crear un asistente de IA para ayudar a los ciudadanos a saber que tramites necesitan y como hacerlos. Hay mucha confusion y la gente pierde horas antes de que alguien les oriente bien.' },
    { rol: 'asistente', contenido: 'Bienvenido. Es una iniciativa con impacto ciudadano claro y un problema bien delimitado.\n\nAntes de arrancar:\n1. ¿Tienes autorizacion de tu jefe o de la alcaldia para explorar esto?\n2. ¿Hay presupuesto formal disponible o lo hariais de manera informal?\n3. ¿Han intentado antes algo similar en la alcaldia?' },
    { rol: 'usuario', contenido: 'Mi jefe directo sabe y apoya informalmente. No hay presupuesto formal todavia pero me dieron libertad de explorar. Antes habia un chatbot basico en la pagina web pero era muy limitado y lo quitaron.' },
    { rol: 'asistente', contenido: 'El apoyo informal es un buen punto de partida. Lo primero es validar el problema con datos reales y construir el caso de negocio interno que justifique el presupuesto formal.\n\n**Primera tarea:** Habla con los ciudadanos que van a la alcaldia esta semana. Preguntales por que van, que tuvieron que averiguar antes de ir y si han tenido que volver porque les faltaba algo.' },
    ev('agregar_tarea', { descripcion: 'Observar y entrevistar 10 ciudadanos en la alcaldia sobre su experiencia de orientacion de tramites', etapa: 1 }),
    ev('avanzar_etapa', { nueva_etapa: 1, justificacion: 'Iniciativa interna con apoyo institucional. Listo para exploracion.' }),
  ])

  // ── Etapa 1: Exploracion ────────────────────────────────────────────────
  const e1 = await crearEntrada(id, 1, null, 24 * 56, 24 * 55)
  await msgs(e1, [
    { rol: 'usuario', contenido: 'Observe y entreviste a 15 ciudadanos durante 3 dias. El 70% llego sin saber exactamente que documentos necesitaba. El tiempo promedio desde que llegan hasta que los orientan correctamente es 45 minutos. El 40% ha tenido que volver porque les faltaba un documento.' },
    { rol: 'asistente', contenido: 'Datos solidos. El problema es claro y cuantificable.\n\n**Hallazgos clave:**\n- 7 de cada 10 ciudadanos llegan mal preparados\n- 45 minutos promedio de orientacion (tiempo de funcionarios que podria liberarse)\n- 40% tiene que volver: doble costo para el ciudadano y para la alcaldia\n- El problema es de informacion, no de voluntad de los funcionarios\n\nEsto tambien tiene un argumento economico para la alcaldia: si reduces el 50% de consultas presenciales, liberas tiempo de funcionarios que pueden hacer tareas de mayor valor.\n\nPasamos a Definicion.' },
    ev('completar_tarea', { tarea_id: 'mock-gov-1' }),
    ev('avanzar_etapa', { nueva_etapa: 2, justificacion: 'Exploracion con datos cuantitativos sobre el problema validada.' }),
  ])

  // ── Etapa 2: Definicion ─────────────────────────────────────────────────
  const e2 = await crearEntrada(id, 2, null, 24 * 46, 24 * 45)
  await msgs(e2, [
    { rol: 'usuario', contenido: 'El usuario mas comun: persona de 45 anos, poca experiencia digital, necesita hacer un tramite que no ha hecho antes y no sabe por donde empezar. Va a la alcaldia porque no entiende la pagina web.' },
    { rol: 'asistente', contenido: 'Ese perfil define los requisitos de diseno mas importantes: la solucion debe ser accesible para personas con poca experiencia digital.\n\n**Enunciado del desafio:**\n\n> ¿Como podriamos ayudar a ciudadanos sin experiencia digital a prepararse correctamente para sus tramites ante la alcaldia, reduciendo las visitas innecesarias y el tiempo de orientacion?\n\n**Implicacion de diseno clave:** La interfaz no puede ser compleja. Debe funcionar incluso por WhatsApp o con voz si es necesario. ¿Apruebas el enunciado?' },
    { rol: 'usuario', contenido: 'Si, perfecto. WhatsApp es una idea excelente porque casi todos lo usan.' },
    ev('avanzar_etapa', { nueva_etapa: 3, justificacion: 'Desafio definido con requisito clave de accesibilidad digital.' }),
  ])

  // ── Etapa 3: Ideacion ───────────────────────────────────────────────────
  const e3 = await crearEntrada(id, 3, null, 24 * 36, 24 * 35)
  await msgs(e3, [
    { rol: 'usuario', contenido: 'Tres ideas principales: 1) Asistente en la pagina web de la alcaldia, 2) Bot de WhatsApp que guia paso a paso, 3) Pantalla tactil en la entrada de la alcaldia con la IA.' },
    { rol: 'asistente', contenido: '| Idea | Alcance | Costo inicial | Accesibilidad |\n|---|---|---|---|\n| Web chat | Medio | Bajo | Requiere computador |\n| Bot WhatsApp | Alto | Bajo | Maxima (todos tienen WhatsApp) |\n| Pantalla tactil | Medio | Alto | Buena para mayores |\n\n**Recomendacion:** Empieza con WhatsApp. Es el canal con mayor penetracion en todos los segmentos, incluyendo mayores de 45 anos. El costo de implementacion es bajo y puedes tenerlo funcionando en semanas.\n\nSi funciona bien, la pantalla tactil puede ser una extension para quienes van fisicamente.' },
    ev('avanzar_etapa', { nueva_etapa: 4, justificacion: 'Canal seleccionado: bot de WhatsApp. Prototipado en curso.' }),
  ])

  // ── Etapa 4: Prototipado ────────────────────────────────────────────────
  const e4 = await crearEntrada(id, 4, null, 24 * 26, 24 * 25)
  await msgs(e4, [
    { rol: 'usuario', contenido: 'Construi el bot de WhatsApp con la API de WhatsApp Business y GPT para el procesamiento. Tiene los 15 tramites mas frecuentes de la alcaldia. El equipo de sistemas lo reviso y dio el visto bueno tecnico.' },
    { rol: 'asistente', contenido: 'Excelente. Tienes un prototipo funcional con los casos de uso mas relevantes.\n\nPara la prueba piloto necesitas:\n1. Seleccionar un grupo de 50-100 ciudadanos para la prueba (puedes invitarlos en la entrada de la alcaldia)\n2. Medir: ¿cuantos lograron prepararse correctamente sin ir presencialmente?\n3. Comparar el tiempo de orientacion del bot vs. el actual de 45 minutos\n\n¿Tienes autorizacion para hacer el piloto oficial?' },
    { rol: 'usuario', contenido: 'Si, mi jefe autorizo el piloto para el proximo mes.' },
    ev('avanzar_etapa', { nueva_etapa: 5, justificacion: 'Prototipo funcional con visto bueno tecnico. Piloto autorizado.' }),
  ])

  // ── Etapa 5: Validacion + bifurcacion ──────────────────────────────────
  const e5 = await crearEntrada(id, 5, null, 24 * 14, 24 * 13)
  await msgs(e5, [
    { rol: 'usuario', contenido: 'El piloto funciono muy bien. 200 ciudadanos en 3 semanas. El tiempo promedio de orientacion bajo de 45 a 8 minutos. El 87% no necesito hablar con un funcionario despues de usar el bot. El alcalde se entero y quiere escalar el proyecto.' },
    { rol: 'asistente', contenido: 'Resultados extraordinarios. Una reduccion del 82% en tiempo de orientacion con 87% de resolucion autonoma es un caso de exito muy solido.\n\nAhora la decision de bifurcacion. Tienes tres caminos:\n\n**A. Intraemprendimiento** — la alcaldia lo adopta como servicio propio con presupuesto institucional. Tu lo lideras desde adentro.\n**B. Emprendimiento** — renuncias y creas una empresa de GovTech que vende este servicio a multiples municipios.\n**C. Transferencia** — cedes el desarrollo a una empresa de software que lo opera y la alcaldia paga licencia.\n\n¿Cual encaja con tu proyecto de vida y tus objetivos?' },
    { rol: 'usuario', contenido: 'Quiero que sea de la alcaldia. No quiero crear empresa, quiero mejorar el servicio publico desde adentro. Eso es lo que me motiva.' },
    { rol: 'asistente', contenido: 'Ruta: Intraemprendimiento. La alcaldia desarrolla y opera el servicio con recursos propios.\n\nEs una decision de valor, priorizas el impacto ciudadano sobre el retorno economico personal. Es completamente legitima y consistente con el rol de servidor publico.\n\nLos pasos ahora son institucionales: presupuestacion formal, aprobacion politica del Concejo y escalado del equipo tecnico.' },
    ev('registrar_ruta', { ruta: 'intraemprendimiento' }),
    ev('actualizar_resumen_proceso', { resumen: 'Piloto exitoso: 200 ciudadanos, 45 a 8 minutos de orientacion, 87% autonomos. Alcalde apoya. Ruta intraemprendimiento confirmada.' }),
    ev('avanzar_etapa', { nueva_etapa: 6, justificacion: 'Piloto con resultados extraordinarios. Ruta de intraemprendimiento con apoyo del alcalde.' }),
  ])

  // ── Etapa 6: Estructuracion ─────────────────────────────────────────────
  const e6 = await crearEntrada(id, 6, 'intraemprendimiento', 2, 1)
  await msgs(e6, [
    { rol: 'usuario', contenido: 'El alcalde apoyo formalmente el proyecto. Ahora necesito presentarlo al Concejo Municipal para que aprueben el presupuesto del proximo ano. No se muy bien como estructurar esa presentacion.' },
    { rol: 'asistente', contenido: 'La presentacion al Concejo es una decision politica ademas de tecnica. Necesitas un documento que justifique el gasto publico con datos concretos.\n\n**Para la presentacion necesitas:**\n1. **Problema con datos:** ciudadanos por semana, tiempo promedio de espera, costo por atencion\n2. **Resultados del piloto:** 45 a 8 minutos, 87% resolucion sin funcionario\n3. **Proyeccion de ahorro:** si reduces el 50% de consultas, cuantos funcionarios-hora liberas y cuanto vale eso\n4. **Presupuesto:** costo anual de operacion vs. ahorro generado\n5. **Cronograma:** hitos del primer ano\n\n¿Quieres que genere la propuesta ejecutiva para el Concejo?' },
    { rol: 'usuario', contenido: 'Si, necesito ese documento para la sesion del Concejo la proxima semana.' },
    { rol: 'asistente', contenido: 'Generando la propuesta ejecutiva de GovAssist para el Concejo Municipal.' },
    ev('generar_documento', { tipo: 'propuesta', titulo: 'Propuesta GovAssist para el Concejo Municipal', contenido: '' }),
    ev('agregar_tarea', { descripcion: 'Presentar propuesta de presupuesto al Concejo Municipal en sesion de octubre', etapa: 6 }),
    ev('agregar_tarea', { descripcion: 'Calcular ahorro proyectado en horas-funcionario con adopcion completa', etapa: 6 }),
  ])

  await tarea(id, 'Observar y entrevistar 10 ciudadanos en la alcaldia', 1, true)
  await tarea(id, 'Lanzar piloto oficial con 200 ciudadanos', 5, true)
  await tarea(id, 'Presentar propuesta de presupuesto al Concejo Municipal', 6, false)
  await tarea(id, 'Calcular ahorro proyectado en horas-funcionario', 6, false)
  await tarea(id, 'Conseguir aval del area de tecnologia para infraestructura cloud', 6, false)

  await subirDoc(id, 'propuesta', 'Propuesta GovAssist para el Concejo Municipal', `
## Resumen Ejecutivo

GovAssist es un asistente de IA que orienta a ciudadanos sobre tramites municipales a traves de WhatsApp. Un piloto con 200 ciudadanos redujo el tiempo de orientacion de 45 a 8 minutos (82%) y el 87% resolvio su consulta sin hablar con un funcionario.

## El Problema

La Alcaldia atiende ~380 ciudadanos diarios en consultas de orientacion. El 70% llega sin los documentos correctos; el 40% debe volver en un segundo viaje. Costo estimado por atencion: 12.500 COP en tiempo de funcionario. Costo anual: >1.750 millones de pesos.

## Resultados del Piloto

| Indicador | Antes | Despues | Mejora |
|---|---|---|---|
| Tiempo de orientacion | 45 min | 8 min | 82% |
| Resolucion sin funcionario | 0% | 87% | - |
| Ciudadanos que regresan | 40% | 12% | 70% |
| Satisfaccion (NPS) | 3.2/5 | 4.6/5 | 44% |

## Proyeccion de Ahorro

Si GovAssist atiende el 60% de consultas: 228 ciudadanos/dia desviados del presencial.
- Ahorro diario: 2.850.000 COP
- Ahorro anual (250 dias): 712.500.000 COP

## Presupuesto Solicitado

| Concepto | Valor anual |
|---|---|
| Infraestructura cloud | 18.000.000 COP |
| API WhatsApp Business | 6.000.000 COP |
| API OpenAI | 12.000.000 COP |
| Mantenimiento | 24.000.000 COP |
| Total | 60.000.000 COP |

ROI: 712.500.000 de ahorro vs. 60.000.000 de inversion = 1.087%.

## Solicitud al Concejo

Se solicita aprobar la inclusion de GovAssist en el presupuesto municipal 2027 por 60.000.000 COP anuales, con cargo al rubro de modernizacion de la administracion publica.
`, 6, { proyectoNombre: 'GovAssist', usuarioNombre: 'Usuario Germina', etapaNombre: 'Estructuracion - Intraemprendimiento' })
  return id
}

// ─── Endpoint ─────────────────────────────────────────────────────────────────
router.post('/proyecto', requireAuth, async (req, res) => {
  const userId = req.user.id
  try {
    // Guard: si ya tiene proyectos, no crear duplicados
    const { rows: existing } = await query(
      `SELECT COUNT(*) as c FROM proyectos WHERE owner_id = $1`, [userId]
    )
    if (parseInt(existing[0].c) > 0) {
      return res.json({ ok: true, skipped: true, mensaje: 'El usuario ya tiene proyectos' })
    }

    const [innovacion, emprendimiento, transferencia, intrainnovacion] = await Promise.all([
      crearPolyCheck(userId),
      crearTutorUni(userId),
      crearBioSensor(userId),
      crearGovAssist(userId),
    ])

    const ids = { innovacion, emprendimiento, transferencia, intrainnovacion }
    res.json({ ok: true, proyectos: ids })
  } catch (err) {
    console.error('POST /api/demo/proyecto error:', err.message, err.stack)
    res.status(500).json({ error: err.message })
  }
})

export default router
