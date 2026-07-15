---
name: docx-govlab
description: "Usar esta skill cuando una app o agente del Laboratorio de Gobierno (GovLab, Universidad de La Sabana) necesite crear, editar o exportar documentos Word (.docx) con la identidad de marca institucional: informes, propuestas técnicas, cartas, actas, fichas de proyecto o cualquier entregable que deba llevar los logos de GovLab / Universidad de La Sabana, la paleta de color y la tipografía del laboratorio. Se activa junto con (no en reemplazo de) la skill genérica `docx` — esta skill aporta la capa de identidad visual; la skill `docx` aporta la mecánica de docx-js. Disparadores: 'genera un informe/propuesta/carta con el membrete del GovLab', 'exporta esto a Word con nuestra marca', 'documento institucional', 'ficha de proyecto para [entidad pública]'."
license: Proprietary
---

# Generación de documentos Word con identidad GovLab

Esta skill es una capa de marca sobre la skill `docx` (docx-js + pandoc + LibreOffice).
No reemplaza sus gotchas técnicos — los hereda todos — sino que fija cómo se ve un
documento GovLab: colores, tipografías, membrete (header) y pie de página (footer),
y estructura de portada. Úsala junto con `docx` en el mismo request.

> Si la tarea es solo *leer* o hacer *find-and-replace* en un .docx existente sin
> tocar la identidad visual, usa la skill `docx` genérica directamente.

---

## 1. Paleta de color institucional (hex, sin `#`, para `docx-js`)

Misma paleta que el design system web del GovLab (`govlab-appspec`). En `docx-js` los
colores van en `run.color` o `shading.fill` como hex de 6 dígitos, **sin** el `#`:

| Token | Hex | Uso en el documento |
|---|---|---|
| `blue-dark` | `00135B` | Título principal, texto de encabezados H1/H2, fondo de pie de página |
| `blue-hover` | `000E42` | Solo si se necesita un tono más oscuro (raro en documentos) |
| `blue-light` | `00387D` | Subtítulos, texto de encabezados H3 |
| `blue-soft` | `93AAC9` | Líneas divisorias, texto secundario sobre fondo oscuro |
| `blue-tint` | `D9E1EF` | Shading de tablas (encabezados de tabla), franja bajo el título de portada |
| `cream` | `F7EFD9` | Acento puntual (franja de portada, nunca como fondo de párrafo de cuerpo) |
| `text-secondary` | `374151` | Cuerpo de texto |
| `text-muted` | `64748B` | Pie de página, notas al margen, numeración de página |
| `yellow` | `F8A719` | Alertas / destacados puntuales (usar con moderación) |
| `red` | `D51437` | Solo para marcar riesgos o alertas críticas en informes de análisis |

**Nunca** usar `ShadingType.SOLID` para rellenar celdas o bloques — renderiza negro.
Usar siempre `ShadingType.CLEAR` con el `fill` de la tabla de arriba (ver gotcha
heredado de la skill `docx`).

---

## 2. Tipografía

| Rol | Fuente web (referencia) | Fuente para Word |
|---|---|---|
| Títulos / display | `Publico Banner` (`.woff2`, solo funciona en HTML) | `Playfair Display` si está instalada en el entorno de render; si no, `Cambria` |
| Cuerpo y UI | `Libre Franklin` | `Libre Franklin` si está instalada; si no, `Calibri` |
| Etiquetas / metadata | `Cabinet Grotesk` | `Calibri` (negrita, tamaño reducido) |

**Gotcha:** `Publico Banner` es un `.woff2` pensado para navegador — `docx-js` no
puede incrustar `.woff2` en un `.docx`. Si el nombre de fuente no está instalado en
la máquina que abre el documento, Word sustituye automáticamente por una fuente por
defecto sin avisar. Por eso el título de portada usa `Playfair Display`/`Cambria`
como equivalente serif, no el nombre `Publico Banner` literal. Verificar siempre con
el paso de renderizado (sección 6) que el título no cayó a Times New Roman.

---

## 3. Assets de marca

Copiar siempre desde `assets/` de este paquete (mismos archivos que usa
`govlab-appspec` para las apps web — mantener un solo set de logos en el laboratorio):

| Archivo | Uso en el .docx |
|---|---|
| `Govlab.png` | Header, esquina superior izquierda, sobre fondo blanco |
| `Universidad_de_la_Sabana.png` | Header, junto al logo de GovLab, separados por una línea vertical delgada (`blue-tint`) |
| `Govlab_blanco.png` | Footer, si el footer lleva fondo `blue-dark` |
| `Universidad_de_la_Sabana_blanco.png` | Footer, junto al anterior |
| `favicon.png` | No aplica a Word — solo referencia, ignorar en `.docx` |

**Importante:** `ImageRun` requiere `type:` explícito (`"png"`) y las dimensiones en
EMU/DXA — nunca dejar que docx-js infiera el tamaño del PNG original, los logos
vienen a alta resolución y se ven gigantes si no se fija `transformation.width/height`.
Altura recomendada del logo en el header: **360 DXA (~0.25")**, ancho proporcional.

---

## 4. Estructura de membrete (header)

Header de dos logos separados por una línea vertical, replicando el navbar web.
Usar una tabla de 1 fila invisible (sin bordes) para alinear: logo GovLab | separador | logo Universidad.

```javascript
const { Header, Table, TableRow, TableCell, ImageRun, Paragraph, BorderStyle, WidthType } = require("docx");

const header = new Header({
  children: [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: { top: {style: BorderStyle.NONE}, bottom: {style: BorderStyle.NONE},
                 left: {style: BorderStyle.NONE}, right: {style: BorderStyle.NONE},
                 insideHorizontal: {style: BorderStyle.NONE}, insideVertical: {style: BorderStyle.NONE} },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 100, type: WidthType.PERCENTAGE },
              children: [ new Paragraph({
                children: [
                  new ImageRun({ type: "png", data: govlabLogoBuffer,
                    transformation: { width: 130, height: 40 } }),
                  new ImageRun({ type: "png", data: sabanaLogoBuffer,
                    transformation: { width: 110, height: 32 } }),
                ]
              }) ]
            }),
          ]
        }),
      ]
    }),
  ],
});
```

`docx-js` no soporta bordes verticales decorativos entre imágenes dentro del mismo
run con facilidad — si se necesita el separador visual exacto del navbar web, es más
confiable insertar un tercer `ImageRun` de una línea vertical de 1px generada como
PNG (`assets/`), en vez de pelear con `border` a nivel de `TextRun`.

---

## 5. Pie de página (footer) institucional

Fondo `blue-dark` (`00135B`) con logos en blanco y numeración de página, igual patrón
que el footer web:

```javascript
const { Footer, Table, TableRow, TableCell, Paragraph, TextRun, PageNumber,
        ShadingType, WidthType, AlignmentType } = require("docx");

const footer = new Footer({
  children: [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { type: ShadingType.CLEAR, fill: "00135B" },
              width: { size: 70, type: WidthType.PERCENTAGE },
              children: [ new Paragraph({
                children: [ new ImageRun({ type: "png", data: govlabBlancoBuffer,
                  transformation: { width: 100, height: 28 } }) ]
              }) ],
            }),
            new TableCell({
              shading: { type: ShadingType.CLEAR, fill: "00135B" },
              width: { size: 30, type: WidthType.PERCENTAGE },
              children: [ new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: "Página ", color: "D9E1EF", size: 16 }),
                  new TextRun({ children: [PageNumber.CURRENT], color: "D9E1EF", size: 16 }),
                ],
              }) ],
            }),
          ],
        }),
      ],
    }),
  ],
});
```

Texto de crédito estándar (usarlo literal, no parafrasear): `Laboratorio de Gobierno · Universidad de La Sabana`
— va en el footer o en la portada, nunca en ambos para no saturar.

---

## 6. Portada

En lugar de fondo de página completo (poco confiable entre Word/LibreOffice/Google Docs),
usar una franja de color bajo el título — mismo patrón que el borde de párrafo que ya
usa la skill `docx` genérica para reemplazar tablas como regla horizontal:

1. Título en `Playfair Display`/`Cambria`, tamaño 44-52pt, color `00135B`.
2. Subtítulo/tipo de documento en `Libre Franklin`, tamaño 14pt, color `374151`.
3. Franja horizontal: párrafo vacío con `border.bottom` de 4pt color `F8A719` (yellow) o `D9E1EF` (blue-tint) según el tipo de documento (yellow para propuestas activas, blue-tint para informes de cierre).
4. Metadata (entidad receptora, fecha, autor) en `Calibri` 10pt, color `64748B`, alineada abajo de la portada.
5. `PageBreak` (dentro de un `Paragraph`, gotcha heredado) después de la portada.

---

## 7. Verificación (idéntica a la skill `docx` genérica)

```bash
python scripts/office/soffice.py --headless --convert-to pdf output.docx
pdftoppm -jpeg -r 100 output.pdf page
ls page-*.jpg   # revisar visualmente: título no cayó a Times New Roman,
                # logos no se ven gigantes, footer azul se ve azul y no negro
```

Si el footer aparece negro en vez de `00135B`, es el gotcha de `ShadingType.SOLID`
heredado — revisar que se usó `ShadingType.CLEAR`.

---

## 8. Checklist antes de entregar un .docx de GovLab

- [ ] Header con los dos logos, tamaño ≤ 360 DXA de alto
- [ ] Footer azul (`00135B`) con logos en blanco + numeración
- [ ] Título de portada en fuente serif (nunca "Publico Banner" literal)
- [ ] Colores en hex de la tabla de la sección 1, ningún color inventado
- [ ] `ShadingType.CLEAR` en toda tabla con fondo de color
- [ ] Texto de crédito institucional exacto: "Laboratorio de Gobierno · Universidad de La Sabana"
- [ ] Renderizado y revisado visualmente (sección 7) antes de entregar

---

## Dependencias

Las mismas de la skill `docx`: `docx` (npm, preinstalado) · `pandoc` · LibreOffice (`soffice`) · `pdftoppm` (Poppler).
