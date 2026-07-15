import 'dotenv/config'
import fs from 'fs'
import { generarDocx } from '../lib/docgen.js'

const buffer = await generarDocx({
  tipo: 'plantilla',
  titulo: 'Plantilla de Margen por Sesión',
  contenido: `## Datos del Piloto

- Sesiones vendidas: 20
- Periodo: 10 días
- Ingreso bruto total: 360.000 COP
- Precio promedio por sesión: 18.000 COP

## Costos por Sesión

| Concepto | Valor (COP) |
|---|---|
| Pago al tutor por sesión | ___________ |
| Comisión plataforma de pago (si aplica) | ___________ |
| Otros costos directos | ___________ |
| **Total costos por sesión** | ___________ |

## Métricas Clave

| Métrica | Formula | Resultado |
|---|---|---|
| Margen por sesión | Precio - Costos | ___ COP |
| Margen % | (Margen / Precio) × 100 | ___ % |
| Punto de equilibrio | Costos fijos / Margen | ___ sesiones |

## Análisis

El piloto mostró que el precio promedio de **18.000 COP** cubre los costos directos si el tutor recibe máximo el 60% del valor de la sesión.

> Recomendación: mantener el precio por sesión entre 15.000 y 22.000 COP para el primer mes de operación real.

## Próximos pasos

1. Definir el porcentaje exacto de la comisión para la plataforma
2. Calcular los costos fijos mensuales (hosting, soporte)
3. Establecer el precio mínimo viable para alcanzar el punto de equilibrio
`,
  meta: {
    proyectoNombre: 'TutorUni',
    usuarioNombre: 'Juan Diego Sotelo Aguilar',
    etapaNombre: 'Validacion',
  },
})

fs.writeFileSync('test_output.docx', buffer)
console.log('OK: test_output.docx generado,', buffer.length, 'bytes')
