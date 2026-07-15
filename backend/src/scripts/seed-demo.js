/**
 * seed-demo.js
 * Crea el proyecto de ejemplo "TutorUni" para todos los usuarios
 * que aún no lo tienen. Se ejecuta una sola vez.
 *
 * Uso: node src/scripts/seed-demo.js
 */
import 'dotenv/config'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const query = (sql, params) => pool.query(sql, params)

// ─── Datos del proyecto demo ───────────────────────────────────────────────
const DEMO = {
  nombre: 'TutorUni - Tutores entre pares',
  objetivo: 'Conectar estudiantes que necesitan apoyo academico con companeros de cursos superiores que puedan ayudarles, dentro de la misma universidad.',
  icono_forma: 'GraduationCap',
  ruta: 'emprendimiento',
  etapa_actual: 5,
  nivel_maduracion: 'ventas',
  resumen_proceso: 'Proyecto de plataforma de tutorias entre pares universitarios. Paso por exploracion (15 entrevistas), definicion del desafio, ideacion de la plataforma, prototipo validado con 8 usuarios, y primera venta de 20 sesiones en el piloto. Actualmente en validacion con ingresos reales.',
}

const ENTRADAS = [
  {
    etapa: 0, ruta: null, horas_atras: 24 * 14,
    mensajes: [
      { rol: 'usuario', contenido: 'Hola, tengo una idea que quiero desarrollar. Quiero crear algo que conecte a estudiantes de semestres superiores con los de semestres inferiores para que se ayuden academicamente.' },
      { rol: 'asistente', contenido: '**Bienvenido a Germina.** Me alegra que quieras desarrollar tu idea aqui.\n\nAntes de arrancar, necesito entender un poco mejor el contexto para ubicarte en el punto correcto del proceso.\n\n**Algunas preguntas rapidas:**\n\n1. Este proyecto, en este momento, es algo completamente nuevo o ya has hecho algo al respecto?\n2. Lo quieres convertir en un negocio, en una iniciativa dentro de la universidad, o tiene otro fin?\n3. Hay algun problema especifico que viste y que te llevo a pensar en esto?\n\nCuentame con tus propias palabras.' },
      { rol: 'usuario', contenido: 'Es algo nuevo, solo es la idea. Lo quiero convertir en un negocio, cobrar a los estudiantes por las sesiones. Vi que muchos de mis companeros repiten materias y no saben donde buscar ayuda, los tutores privados son muy caros.' },
      { rol: 'asistente', contenido: '**Perfecto, ya tengo suficiente para orientarte.**\n\nTu proyecto tiene dos caracteristicas claras:\n\n- **Ruta:** Emprendimiento (quieres que sea un negocio con ingresos)\n- **Nivel de maduracion:** Idea (no hay nada construido todavia)\n\nEso significa que vas a recorrer el proceso desde la etapa 1. Y es un buen punto de partida, porque si el problema que viste es real, hay una oportunidad concreta.\n\n**Tu primera tarea** es salir a verificar ese problema con datos reales. No con suposiciones, sino hablando directamente con estudiantes.\n\nPara la proxima sesion, quiero que definas cuantos estudiantes vas a entrevistar (minimo 8) y que preguntas les vas a hacer. Puedo ayudarte a construir la guia de entrevista cuando quieras.' },
    ]
  },
  {
    etapa: 1, ruta: 'emprendimiento', horas_atras: 24 * 11,
    mensajes: [
      { rol: 'usuario', contenido: 'Hice 15 entrevistas. Resulta que el 80% de los estudiantes de primer y segundo ano han reprobado o estado a punto de reprobar alguna materia. Los tutores externos cuestan entre 40.000 y 80.000 pesos la hora. Los estudiantes dicen que pagarian entre 15.000 y 25.000 por una sesion de un par de horas.' },
      { rol: 'asistente', contenido: '**Excelente trabajo de campo.** Tus hallazgos son solidos.\n\nResumen de lo que encontraste:\n\n- **Problema confirmado:** 8 de cada 10 estudiantes en primeros semestres han tenido dificultades academicas serias\n- **Barrera identificada:** El precio de los tutores externos es prohibitivo (40.000 a 80.000 COP/hora)\n- **Disposicion a pagar:** Entre 15.000 y 25.000 COP por sesion de 2 horas\n\nEsto es una brecha de mercado real. Un tutor par cobrando la mitad que uno externo sigue siendo rentable para el tutor y asequible para el estudiante.\n\n**Preguntas para cerrar esta etapa:**\n- De los 15 entrevistados, cuantos dijeron que actuarian como tutores si les pagaran?\n- Hay materias especificas donde la demanda es mayor?\n\nCon eso pasamos a definir el desafio.' },
      { rol: 'usuario', contenido: 'Si, 6 de los 15 dijeron que darian tutoria. Las materias mas mencionadas fueron Calculo, Estadistica y Programacion.' },
      { rol: 'asistente', contenido: '**Datos muy utiles.** Ya tienes lo necesario para cerrar la etapa de exploracion.\n\n**Resumen de hallazgos clave:**\n\n- Mercado: estudiantes de primeros semestres con dificultades academicas\n- Oferta potencial: 40% de los entrevistados dispuestos a ser tutores\n- Materias con mayor demanda: Calculo, Estadistica, Programacion\n- Precio justo segun los usuarios: 15.000 a 25.000 COP por sesion\n\nEsto es suficiente para pasar a la siguiente etapa. Vamos a convertir estos hallazgos en un desafio de diseno claro.\n\nPara la proxima sesion, necesito que redactes tu mapa de empatia del estudiante que mas se repitio en las entrevistas.' },
    ]
  },
  {
    etapa: 2, ruta: 'emprendimiento', horas_atras: 24 * 8,
    mensajes: [
      { rol: 'usuario', contenido: 'Trabaje el mapa de empatia. Mi usuario tipico es un estudiante de segundo semestre de Ingenieria, que reprobo Calculo el semestre pasado, que siente verguenza de pedir ayuda al profesor y no puede pagar un tutor externo. Quiere pasar la materia sin sentir que es "el unico que no entiende".' },
      { rol: 'asistente', contenido: '**Ese mapa de empatia es muy bueno.** Identificaste algo que va mas alla del precio: la barrera emocional.\n\nTu usuario no solo tiene un problema economico. Tiene un problema de **autoestima academica**: siente verguenza frente al profesor y se siente aislado. Un par de carrera que "paso por lo mismo" es mucho mas accesible emocionalmente que un tutor externo.\n\n**Propuesta de enunciado del desafio:**\n\n> Como podriamos ayudar a estudiantes de primeros semestres de Ingenieria a conseguir apoyo academico asequible y sin la barrera de la verguenza, conectandolos con companeros que ya pasaron por las mismas materias?\n\nEste enunciado:\n- Se enfoca en el usuario, no en la solucion\n- Incluye la dimension emocional (la verguenza)\n- Abre posibilidades de solucion sin cerrarlas prematuramente\n\nConfirmas este enunciado o quieres ajustar algo? Con tu aprobacion pasamos a idear.' },
      { rol: 'usuario', contenido: 'Me parece muy bien, vamos a idear.' },
    ]
  },
  {
    etapa: 3, ruta: 'emprendimiento', horas_atras: 24 * 6,
    mensajes: [
      { rol: 'usuario', contenido: 'Genere 25 ideas. Las mejores para mi son: 1) App movil donde el estudiante publica que necesita tutoria, 2) Canal de WhatsApp donde se publican tutores disponibles, 3) Sistema de creditos donde los tutores ganan puntos canjeables en beneficios universitarios.' },
      { rol: 'asistente', contenido: '**Buenas ideas.** Vamos a evaluarlas con dos criterios: impacto potencial y facilidad de implementacion inicial.\n\n| Idea | Impacto | Facilidad inicial | Nota |\n|---|---|---|---|\n| App movil | Alto | Baja | Costosa para empezar |\n| Canal WhatsApp | Medio | Alta | Rapido para validar |\n| Sistema de creditos | Alto | Media | Requiere acuerdo institucional |\n\n**Recomendacion:**\n\nEmpieza con WhatsApp o Telegram como prototipo minimo. No necesitas una app para validar si la gente usa el servicio y paga. Si funciona, construyes la plataforma digital con ingresos reales.\n\nEsta logica se llama "Mago de Oz": operas el servicio manualmente mientras validas que hay demanda real.\n\nCual de las tres quieres desarrollar como prototipo?' },
      { rol: 'usuario', contenido: 'Voy a empezar con WhatsApp para validar rapido y si funciona paso a la app.' },
      { rol: 'asistente', contenido: '**Excelente decision.** Es la mas inteligente para esta etapa.\n\n**Plan de prototipo minimo viable:**\n\n1. Crea un grupo de WhatsApp o canal de Telegram\n2. Invita a los 6 posibles tutores de tus entrevistas\n3. Define un precio fijo (puedes probar con 20.000 COP por sesion de 2 horas)\n4. Comparte el canal con 20 estudiantes de primer y segundo semestre\n5. Opera tu mismo la coordinacion al principio\n\n**Meta de validacion:** conseguir al menos 5 sesiones pagadas en las proximas 2 semanas.\n\nNos vemos en la siguiente sesion con el reporte.' },
    ]
  },
  {
    etapa: 4, ruta: 'emprendimiento', horas_atras: 24 * 3,
    mensajes: [
      { rol: 'usuario', contenido: 'Cree el canal, diseñe un formulario de Google para que los estudiantes pidan su tutoria, y arme una hoja de calculo para llevar el registro. Tambien diseñe un logo basico.' },
      { rol: 'asistente', contenido: '**Muy bien.** Tienes un prototipo funcional de operacion manual.\n\n**Lo que tienes hasta ahora:**\n\n- Canal de coordinacion (WhatsApp)\n- Formulario de solicitud (Google Forms)\n- Sistema de registro (Google Sheets)\n- Identidad visual basica (logo)\n\nEso es suficiente para salir a probar con usuarios reales.\n\n**Plan de lanzamiento del piloto:**\n\n1. Contacta personalmente a los estudiantes que entrevistaste y que dijeron que pagarian\n2. Ofrece las primeras 3 sesiones con 30% de descuento (14.000 COP) como precio de lanzamiento\n3. Pide retroalimentacion por escrito despues de cada sesion\n\nLa meta sigue siendo 5 sesiones pagadas. Con eso pasamos a validacion formal.' },
      { rol: 'usuario', contenido: 'Listo, voy a arrancar el piloto esta semana.' },
    ]
  },
  {
    etapa: 5, ruta: 'emprendimiento', horas_atras: 12,
    mensajes: [
      { rol: 'usuario', contenido: 'El piloto funciono muy bien. En 10 dias tuve 20 sesiones pagadas, 18.000 pesos cada una. Ingrese 360.000 pesos. Los tutores estan contentos, los estudiantes tambien. Dos de ellos me pidieron repetir la sesion.' },
      { rol: 'asistente', contenido: '**Validaste el modelo de negocio.**\n\n**Resultados del piloto:**\n\n- 20 sesiones vendidas en 10 dias\n- Ingreso bruto: 360.000 COP\n- 2 clientes recurrentes (senal de valor real percibido)\n- Satisfaccion alta de tutores y estudiantes\n\n**Donde estas ahora:**\n\nTu proyecto entra a la etapa de **Validacion avanzada**. Las preguntas que tienes que responder son:\n\n1. A que escala puedes llegar sin tecnologia? (cuantas sesiones por semana puedes coordinar manualmente)\n2. Cuanto le pagas a cada tutor por sesion?\n3. Cuales son tus costos actuales?\n\nCon esas respuestas construimos el modelo financiero basico y decidimos si el siguiente paso es crecer el canal manual o invertir en la plataforma digital.\n\n**Tu tarea:** calcula tu margen por sesion (precio menos lo que le pagas al tutor menos cualquier costo) y compartelo en la proxima sesion.' },
    ]
  },
]

async function seedUserDemo(userId) {
  // Verificar que el usuario no tenga ya el proyecto demo
  const { rows: existing } = await query(
    `SELECT id FROM proyectos WHERE owner_id = $1 AND nombre = $2`,
    [userId, DEMO.nombre]
  )
  if (existing.length > 0) {
    console.log(`  → Ya tiene el proyecto demo, se omite.`)
    return
  }

  // Crear el proyecto
  const { rows: [proyecto] } = await query(
    `INSERT INTO proyectos
       (owner_id, nombre, objetivo, icono_forma, ruta, etapa_actual, nivel_maduracion, resumen_proceso)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING id`,
    [userId, DEMO.nombre, DEMO.objetivo, DEMO.icono_forma, DEMO.ruta, DEMO.etapa_actual, DEMO.nivel_maduracion, DEMO.resumen_proceso]
  )

  for (const entrada of ENTRADAS) {
    const iniciada = new Date(Date.now() - entrada.horas_atras * 3600000).toISOString()
    const { rows: [eb] } = await query(
      `INSERT INTO entradas_bitacora
         (proyecto_id, etapa_en_ese_momento, ruta_en_ese_momento, iniciada_en, ultima_interaccion_en)
       VALUES ($1,$2,$3,$4,$4)
       RETURNING id`,
      [proyecto.id, entrada.etapa, entrada.ruta, iniciada]
    )
    for (const msg of entrada.mensajes) {
      await query(
        `INSERT INTO mensajes (entrada_id, rol, contenido) VALUES ($1,$2,$3)`,
        [eb.id, msg.rol, msg.contenido]
      )
    }
  }

  console.log(`  Proyecto creado: ${proyecto.id}`)
}

async function main() {
  try {
    const { rows: usuarios } = await query(`SELECT id, correo FROM usuarios ORDER BY created_at`)
    console.log(`\nUsuarios encontrados: ${usuarios.length}\n`)

    for (const u of usuarios) {
      console.log(`Procesando: ${u.correo}`)
      await seedUserDemo(u.id)
    }

    console.log('\nSeed completado.')
  } catch (err) {
    console.error('Error en seed:', err.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()
