/**
 * Germina — Generador de documentos Word profesional
 * Estándar docx-govlab: header azul oscuro con logos, footer azul con título,
 * portada limpia, parser de markdown completo (incluyendo tablas).
 *
 * Paleta: único azul institucional #00135B (igual que la web)
 * Fuentes: Publico Banner (display/títulos) · Libre Franklin (cuerpo)
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, Header, Footer,
  Table, TableRow, TableCell, WidthType, ShadingType,
  ImageRun, PageNumber, LevelFormat, convertInchesToTwip,
  PageBreak, CharacterSet,
} from 'docx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '../../../')

// ── Paleta institucional completa (espeja los tokens CSS de la web) ──────────
const C = {
  // Azules
  blueDark:  '00135B',   // --c-blue-dark   · navbar, botones primarios
  blueHover: '000E42',   // --c-blue-hover  · hover de botones
  blueLight: '00387D',   // --c-blue-light  · focus, interacciones
  blueSoft:  '93AAC9',   // --c-blue-soft   · botones secundarios
  blueTint:  'D9E1EF',   // --c-blue-tint   · bordes, hover backgrounds
  // Acentos
  cream:     'F7EFD9',   // --c-cream       · acento cálido
  yellow:    'F8A719',   // --c-yellow      · acento dorado
  red:       '96272D',   // --c-red         · rojo institucional
  // Semánticos
  bgMain:    'EEF2F8',   // --bg-main
  bgCard:    'FFFFFF',   // --bg-card
  textPrimary:   '00135B',  // --text-primary
  textSecondary: '374151',  // --text-secondary
  textMuted:     '64748B',  // --text-muted
  border:        'D9E1EF',  // --border-color
  // Aliases cortos usados internamente
  blue:      '00135B',   // = blueDark (color principal del documento)
  blueRow:   'EEF2F8',   // fondo alterno de filas de tabla
  textBody:  '374151',
  white:     'FFFFFF',
}

// ── Fuentes ─────────────────────────────────────────────────────────────────
const F = {
  display: 'Publico Banner',   // títulos portada y H1/H2
  heading: 'Libre Franklin',   // H3/H4 — siempre disponible
  body:    'Libre Franklin',   // cuerpo, listas, tablas
  mono:    'Courier New',      // código inline
}

// ── Tamaños (half-points) ───────────────────────────────────────────────────
const S = {
  display: 80,   // 40pt — portada
  h1:      52,   // 26pt
  h2:      40,   // 20pt
  h3:      32,   // 16pt
  h4:      28,   // 14pt
  body:    22,   // 11pt
  small:   18,   // 9pt
  table:   20,   // 10pt
}

// ── Logos ───────────────────────────────────────────────────────────────────
function loadLogo(name) {
  for (const base of [ROOT, path.join(ROOT, '..'), path.join(__dirname, '../../..')]) {
    const p = path.join(base, name)
    if (fs.existsSync(p)) return fs.readFileSync(p)
  }
  return null
}

const logoBlanco   = loadLogo('logo_blanco.png')
const govlabBlanco = loadLogo('GovLab_blanco.png')

// TTF de Publico Banner — se incrusta en el .docx para que Word lo renderice
const FONT_TTF_PATH = path.join(__dirname, '../assets/PublicoBanner.ttf')
const publicoBannerTtf = fs.existsSync(FONT_TTF_PATH) ? fs.readFileSync(FONT_TTF_PATH) : null
if (!publicoBannerTtf) console.warn('[docgen] PublicoBanner.ttf no encontrado — se usará Libre Franklin en su lugar')

// Si no hay TTF disponible, usar Libre Franklin como fallback de display
const FONT_DISPLAY = publicoBannerTtf ? F.display : F.body

/** Escala un logo a altura objetivo (px) manteniendo ratio real */
function imgRun(buffer, heightPx, ratioWH) {
  return new ImageRun({
    type: 'png',
    data: buffer,
    transformation: { width: Math.round(heightPx * ratioWH), height: heightPx },
  })
}

// ── Helpers ─────────────────────────────────────────────────────────────────
const noBorder     = { style: BorderStyle.NONE }
const noAllBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder }

function spacer(before = 120, after = 120) {
  return new Paragraph({ children: [], spacing: { before, after } })
}

function hr(color = C.blueTint, size = 4) {
  return new Paragraph({
    children: [],
    border: { bottom: { style: BorderStyle.SINGLE, size, color, space: 4 } },
    spacing: { before: 0, after: 200 },
  })
}

// ── Header: barra azul con logos ────────────────────────────────────────────
function buildHeader() {
  const leftPara = new Paragraph({
    children: logoBlanco
      ? [imgRun(logoBlanco, 44, 1.0)]
      : [new TextRun({ text: 'Germina', bold: true, color: C.white, size: S.body, font: F.body })],
    spacing: { before: 200, after: 200 },
    alignment: AlignmentType.LEFT,
  })

  const rightPara = new Paragraph({
    children: govlabBlanco
      ? [imgRun(govlabBlanco, 38, 2.804)]
      : [new TextRun({ text: 'GovLab', bold: true, color: C.white, size: S.body, font: F.body })],
    spacing: { before: 200, after: 200 },
    alignment: AlignmentType.RIGHT,
  })

  return new Header({
    children: [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: noBorder, bottom: noBorder, left: noBorder, right: noBorder,
          insideHorizontal: noBorder, insideVertical: noBorder,
        },
        rows: [new TableRow({
          children: [
            new TableCell({
              shading: { type: ShadingType.CLEAR, fill: C.blue },
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: noAllBorders,
              children: [leftPara],
            }),
            new TableCell({
              shading: { type: ShadingType.CLEAR, fill: C.blue },
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: noAllBorders,
              children: [rightPara],
            }),
          ],
        })],
      }),
    ],
  })
}

// ── Footer: barra azul con título y número de página ───────────────────────
function buildFooter(titulo) {
  const label = titulo?.length > 60 ? titulo.slice(0, 57) + '...' : (titulo ?? 'Germina')

  const leftPara = new Paragraph({
    children: [
      new TextRun({ text: label, color: C.blueSoft, size: S.small, font: F.body }),
    ],
    spacing: { before: 220, after: 220 },
  })

  const rightPara = new Paragraph({
    children: [
      new TextRun({ text: 'Pág. ', color: C.blueSoft, size: S.small, font: F.body }),
      new TextRun({ children: [PageNumber.CURRENT], color: C.blueSoft, size: S.small }),
      new TextRun({ text: ' / ', color: C.blueSoft, size: S.small }),
      new TextRun({ children: [PageNumber.TOTAL_PAGES], color: C.blueSoft, size: S.small }),
    ],
    alignment: AlignmentType.RIGHT,
    spacing: { before: 220, after: 220 },
  })

  return new Footer({
    children: [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: noBorder, bottom: noBorder, left: noBorder, right: noBorder,
          insideHorizontal: noBorder, insideVertical: noBorder,
        },
        rows: [new TableRow({
          children: [
            new TableCell({
              shading: { type: ShadingType.CLEAR, fill: C.blue },
              width: { size: 70, type: WidthType.PERCENTAGE },
              borders: noAllBorders,
              children: [leftPara],
            }),
            new TableCell({
              shading: { type: ShadingType.CLEAR, fill: C.blue },
              width: { size: 30, type: WidthType.PERCENTAGE },
              borders: noAllBorders,
              children: [rightPara],
            }),
          ],
        })],
      }),
    ],
  })
}

// ── Portada ─────────────────────────────────────────────────────────────────
function buildPortada({ titulo, proyectoNombre, etapaNombre, usuarioNombre, fecha }) {
  const elems = []

  // Espacio superior
  elems.push(spacer(convertInchesToTwip(0.8), 480))

  // Título principal en Publico Banner (o fallback)
  elems.push(new Paragraph({
    children: [new TextRun({
      text: titulo,
      size: S.display,
      color: C.blue,
      font: FONT_DISPLAY,
      bold: false,
      italics: true,
    })],
    spacing: { before: 0, after: 120 },
  }))

  // Franja amarilla
  elems.push(hr(C.yellow, 10))

  // Metadatos
  const meta = [
    ['Proyecto', proyectoNombre],
    etapaNombre   ? ['Etapa', etapaNombre]         : null,
    usuarioNombre ? ['Elaborado por', usuarioNombre]: null,
    ['Fecha', fecha],
  ].filter(Boolean)

  for (const [label, value] of meta) {
    elems.push(new Paragraph({
      children: [
        new TextRun({ text: `${label}: `, bold: true, size: S.body, color: C.textMuted, font: F.body }),
        new TextRun({ text: value,         size: S.body, color: C.textMuted, font: F.body }),
      ],
      spacing: { before: 0, after: 60 },
    }))
  }

  // Salto de página
  elems.push(new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }))

  return elems
}

// ── Sanitización de texto antes del parser ──────────────────────────────────
// Limpia artefactos que GPT a veces genera: em-dashes, asteriscos huérfanos
function sanitize(text) {
  return text
    .replace(/\u2014/g, '-')          // — em dash → guion simple
    .replace(/\u2013/g, '-')          // – en dash → guion simple
    .replace(/\u2012/g, '-')          // figure dash → guion simple
    .replace(/---?/g, '-')            // triple/doble guion literal → guion simple
    .replace(/\*{3,}/g, '')           // *** o **** sin cerrar → eliminado
    .replace(/\*\*\s*\*\*/g, '')      // **** (negrilla vacía) → eliminado
    .replace(/(?<!\*)(\*{1,2})(?!\w)/g, '') // asterisco(s) sueltos al final → eliminado
}

// ── Parser de inline markdown ────────────────────────────────────────────────
function inlineRuns(text, color = C.textBody, size = S.body) {
  const clean = sanitize(text)
  const runs = []
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g
  let last = 0, m
  while ((m = re.exec(clean)) !== null) {
    if (m.index > last)
      runs.push(new TextRun({ text: clean.slice(last, m.index), size, color, font: F.body }))
    if (m[1] != null)
      runs.push(new TextRun({ text: m[1], bold: true,    size, color, font: F.body }))
    else if (m[2] != null)
      runs.push(new TextRun({ text: m[2], italics: true, size, color, font: F.body }))
    else
      runs.push(new TextRun({ text: m[3], size, color: C.blue, font: F.mono }))
    last = m.index + m[0].length
  }
  if (last < clean.length)
    runs.push(new TextRun({ text: clean.slice(last), size, color, font: F.body }))
  return runs.length ? runs : [new TextRun({ text: clean, size, color, font: F.body })]
}

// ── Parser de tablas markdown ────────────────────────────────────────────────
function isTableRow(line)    { return line.trim().startsWith('|') && line.trim().endsWith('|') }
function isSeparatorRow(line){ return /^\s*\|[\s\-|:]+\|\s*$/.test(line) }

function parseCells(line) {
  return line.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim())
}

function buildTable(rows) {
  const headerCells = parseCells(rows[0])
  const dataRows    = rows.slice(2).filter(r => !isSeparatorRow(r) && r.trim())
  const colCount    = headerCells.length
  const colWidth    = Math.floor(9072 / colCount)

  const thinBorder  = { style: BorderStyle.SINGLE, size: 4,  color: C.blueTint }
  const cellBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }

  const tableRows = []

  // ── Fila de encabezado ──────────────────────────────────────────────────
  tableRows.push(new TableRow({
    tableHeader: true,
    children: headerCells.map(cell => new TableCell({
      shading: { type: ShadingType.CLEAR, fill: C.blue },
      width:   { size: colWidth, type: WidthType.DXA },
      borders: cellBorders,
      children: [new Paragraph({
        children: [new TextRun({
          text: cell, bold: true, italics: true,
          size: S.table, color: C.white, font: F.body,
        })],
        spacing: { before: 80, after: 80 },
        alignment: AlignmentType.LEFT,
      })],
    })),
  }))

  // ── Filas de datos (filas alternas) ─────────────────────────────────────
  dataRows.forEach((row, rowIdx) => {
    const cells = parseCells(row)
    const fill  = rowIdx % 2 === 0 ? C.white : C.blueRow

    tableRows.push(new TableRow({
      children: cells.map(cell => new TableCell({
        shading: { type: ShadingType.CLEAR, fill },
        width:   { size: colWidth, type: WidthType.DXA },
        borders: cellBorders,
        children: [new Paragraph({
          children: inlineRuns(cell, C.textBody, S.table),
          spacing: { before: 60, after: 60 },
        })],
      })),
    }))
  })

  return new Table({
    width: { size: 9072, type: WidthType.DXA },
    rows:  tableRows,
  })
}

// ── Parser principal de markdown ─────────────────────────────────────────────
function mdToDocx(md) {
  const lines = (md ?? '').split('\n')
  const elems = []
  let i = 0

  while (i < lines.length) {
    const raw = lines[i]
    const t   = raw.trim()
    i++

    // Línea vacía
    if (!t) { elems.push(spacer(60, 60)); continue }

    // Tablas markdown
    if (isTableRow(t)) {
      const tableLines = [t]
      while (i < lines.length && (isTableRow(lines[i]) || isSeparatorRow(lines[i]))) {
        tableLines.push(lines[i].trim())
        i++
      }
      if (tableLines.length >= 2) {
        elems.push(buildTable(tableLines))
        elems.push(spacer(160, 160))
      }
      continue
    }

    // #### H4
    if (t.startsWith('#### ')) {
      elems.push(new Paragraph({
        children: [new TextRun({
          text: t.slice(5), italics: true,
          size: S.h4, color: C.blue, font: F.body,
        })],
        spacing: { before: 200, after: 60 },
      })); continue
    }

    // ### H3
    if (t.startsWith('### ')) {
      elems.push(new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun({
          text: t.slice(4),
          size: S.h3, color: C.blue, font: F.body,
        })],
        spacing: { before: 300, after: 80 },
      })); continue
    }

    // ## H2
    if (t.startsWith('## ')) {
      elems.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({
          text: t.slice(3),
          size: S.h2, color: C.blue, font: FONT_DISPLAY,
        })],
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.blueTint, space: 4 } },
        spacing: { before: 400, after: 80 },
      })); continue
    }

    // # H1
    if (t.startsWith('# ')) {
      elems.push(new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({
          text: t.slice(2),
          size: S.h1, color: C.blue, font: FONT_DISPLAY,
        })],
        spacing: { before: 480, after: 160 },
      })); continue
    }

    // Citas
    if (t.startsWith('> ')) {
      elems.push(new Paragraph({
        children: inlineRuns(t.slice(2), C.blue),
        indent:   { left: 720 },
        border:   { left: { style: BorderStyle.THICK, size: 12, color: C.blueSoft, space: 8 } },
        spacing:  { before: 120, after: 120 },
      })); continue
    }

    // Listas no ordenadas
    if (t.match(/^[-*] /)) {
      elems.push(new Paragraph({
        children: inlineRuns(t.slice(2)),
        bullet:   { level: 0 },
        spacing:  { before: 60, after: 60 },
      })); continue
    }

    // Listas ordenadas
    if (t.match(/^\d+\. /)) {
      elems.push(new Paragraph({
        children:  inlineRuns(t.replace(/^\d+\. /, '')),
        numbering: { reference: 'ordered', level: 0 },
        spacing:   { before: 60, after: 60 },
      })); continue
    }

    // Separador horizontal
    if (t === '---' || t === '***') {
      elems.push(hr(C.blueTint, 4)); continue
    }

    // Párrafo normal
    elems.push(new Paragraph({
      children: inlineRuns(t),
      spacing:  { before: 60, after: 100 },
    }))
  }

  return elems
}

// ── Función pública ──────────────────────────────────────────────────────────
/**
 * @param {object} opts
 * @param {string} opts.tipo
 * @param {string} opts.titulo
 * @param {string} opts.contenido  — markdown
 * @param {object} opts.meta       — { proyectoNombre, usuarioNombre, etapaNombre }
 * @returns {Promise<Buffer>}
 */
export async function generarDocx({ tipo, titulo, contenido, meta = {} }) {
  const fecha = new Date().toLocaleDateString('es-CO', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  const portada = buildPortada({
    titulo,
    proyectoNombre: meta.proyectoNombre ?? 'Proyecto',
    etapaNombre:    meta.etapaNombre    ?? '',
    usuarioNombre:  meta.usuarioNombre  ?? '',
    fecha,
  })

  const cuerpo = mdToDocx(contenido)

  const doc = new Document({
    creator:     'Germina · Laboratorio de Gobierno',
    title:       titulo,
    description: `${tipo} — ${meta.proyectoNombre}`,
    ...(publicoBannerTtf ? {
      fonts: [{
        name: F.display,
        data: publicoBannerTtf,
        characterSet: CharacterSet.ANSI,
      }],
    } : {}),
    numbering: {
      config: [{
        reference: 'ordered',
        levels: [{
          level: 0,
          format: LevelFormat.DECIMAL,
          text:   '%1.',
          alignment: AlignmentType.LEFT,
          style: {
            paragraph: { indent: { left: 720, hanging: 360 } },
            run:       { size: S.body, color: C.textBody, font: F.body },
          },
        }],
      }],
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top:    convertInchesToTwip(1),
            bottom: convertInchesToTwip(0.9),
            left:   convertInchesToTwip(1.1),
            right:  convertInchesToTwip(1.1),
            header: convertInchesToTwip(0.3),
            footer: convertInchesToTwip(0.3),
          },
        },
      },
      headers: { default: buildHeader() },
      footers: { default: buildFooter(titulo) },
      children: [...portada, ...cuerpo],
    }],
  })

  return Packer.toBuffer(doc)
}
