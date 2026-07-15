/**
 * Germina — Generador de documentos Word profesional
 * Estándar docx-govlab: header azul oscuro con logos, footer azul con título,
 * portada limpia, parser de markdown completo (incluyendo tablas).
 *
 * Dimensiones reales de los logos:
 *   logo_azul.png / logo_blanco.png : 639 × 639 px (cuadrado)
 *   GovLab_blanco.png               : 3483 × 1242 px (ratio 2.80:1)
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

// ── Paleta institucional ────────────────────────────────────────────────────
const C = {
  blueDark:  '00135B',
  blueLight: '00387D',
  blueSoft:  '93AAC9',
  blueTint:  'D9E1EF',
  yellow:    'F8A719',
  textBody:  '374151',
  textMuted: '64748B',
  white:     'FFFFFF',
}

// ── Tamaños (half-points) ───────────────────────────────────────────────────
const S = {
  display: 80,   // 40pt — portada
  h1:      52,   // 26pt
  h2:      40,   // 20pt
  h3:      32,   // 16pt
  body:    22,   // 11pt
  small:   18,   // 9pt
  footer:  16,   // 8pt
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

const logoAzul    = loadLogo('logo_azul.png')
const logoBlanco  = loadLogo('logo_blanco.png')
const govlabBlanco = loadLogo('GovLab_blanco.png')

// TTF de Publico Banner (convertido desde el woff2 institucional)
// Se incrusta en el .docx para que Word lo renderice en cualquier maquina
const FONT_TTF_PATH = path.join(__dirname, '../assets/PublicoBanner.ttf')
const publicoBannerTtf = fs.existsSync(FONT_TTF_PATH) ? fs.readFileSync(FONT_TTF_PATH) : null
if (!publicoBannerTtf) console.warn('[docgen] No se encontro PublicoBanner.ttf — titulos usaran fuente de sistema')

// Ratios reales
// logo_azul / logo_blanco : 639x639 → ratio 1.0
// GovLab_blanco           : 3483x1242 → ratio 2.804

/** Escala un logo a altura objetivo (px) manteniendo ratio real */
function imgRun(buffer, heightPx, ratioWH) {
  return new ImageRun({
    type: 'png',
    data: buffer,
    transformation: { width: Math.round(heightPx * ratioWH), height: heightPx },
  })
}

// ── Helpers de párrafos ─────────────────────────────────────────────────────
const noBorder = { style: BorderStyle.NONE }
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
      ? [imgRun(logoBlanco, 44, 1.0)]   // 44×44 px (cuadrado)
      : [new TextRun({ text: 'Germina', bold: true, color: C.white, size: S.body, font: 'Calibri' })],
    spacing: { before: 200, after: 200 },
    alignment: AlignmentType.LEFT,
  })

  const rightPara = new Paragraph({
    children: govlabBlanco
      ? [imgRun(govlabBlanco, 38, 2.804)] // 38px alto → 106px ancho
      : [new TextRun({ text: 'GovLab', bold: true, color: C.white, size: S.body, font: 'Calibri' })],
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
              shading: { type: ShadingType.CLEAR, fill: C.blueDark },
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: noAllBorders,
              children: [leftPara],
            }),
            new TableCell({
              shading: { type: ShadingType.CLEAR, fill: C.blueDark },
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
      new TextRun({ text: label, color: C.blueSoft, size: S.small, font: 'Calibri' }),
    ],
    spacing: { before: 220, after: 220 },
  })

  const rightPara = new Paragraph({
    children: [
      new TextRun({ text: 'Pag. ', color: C.blueSoft, size: S.small, font: 'Calibri' }),
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
              shading: { type: ShadingType.CLEAR, fill: C.blueDark },
              width: { size: 70, type: WidthType.PERCENTAGE },
              borders: noAllBorders,
              children: [leftPara],
            }),
            new TableCell({
              shading: { type: ShadingType.CLEAR, fill: C.blueDark },
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

  // Logo de la institución en portada (logo_azul, cuadrado, 60px)
  if (logoAzul) {
    elems.push(new Paragraph({
      children: [imgRun(logoAzul, 56, 1.0)],
      spacing: { before: convertInchesToTwip(0.8), after: 480 },
    }))
  } else {
    elems.push(spacer(convertInchesToTwip(0.8), 480))
  }

  // Título principal
  elems.push(new Paragraph({
    children: [new TextRun({
      text: titulo,
      size: S.display,
      color: C.blueDark,
      font: 'Publico Banner',
      bold: false,
    })],
    spacing: { before: 0, after: 120 },
  }))

  // Franja amarilla
  elems.push(hr(C.yellow, 10))

  // Metadatos
  const meta = [
    ['Proyecto', proyectoNombre],
    etapaNombre ? ['Etapa', etapaNombre] : null,
    usuarioNombre ? ['Elaborado por', usuarioNombre] : null,
    ['Fecha', fecha],
  ].filter(Boolean)

  for (const [label, value] of meta) {
    elems.push(new Paragraph({
      children: [
        new TextRun({ text: `${label}: `, bold: true, size: S.body, color: C.textMuted, font: 'Calibri' }),
        new TextRun({ text: value, size: S.body, color: C.textMuted, font: 'Calibri' }),
      ],
      spacing: { before: 0, after: 60 },
    }))
  }

  // Salto de página (debe ir dentro de Paragraph — gotcha docx-js)
  elems.push(new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }))

  return elems
}

// ── Parser de inline markdown ────────────────────────────────────────────────
function inlineRuns(text, color = C.textBody, size = S.body) {
  const runs = []
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g
  let last = 0, m
  while ((m = re.exec(text)) !== null) {
    if (m.index > last)
      runs.push(new TextRun({ text: text.slice(last, m.index), size, color, font: 'Libre Franklin' }))
    if (m[1] != null)
      runs.push(new TextRun({ text: m[1], bold: true, size, color, font: 'Libre Franklin' }))
    else if (m[2] != null)
      runs.push(new TextRun({ text: m[2], italics: true, size, color, font: 'Libre Franklin' }))
    else
      runs.push(new TextRun({ text: m[3], size, color: C.blueLight, font: 'Courier New' }))
    last = m.index + m[0].length
  }
  if (last < text.length)
    runs.push(new TextRun({ text: text.slice(last), size, color, font: 'Libre Franklin' }))
  return runs.length ? runs : [new TextRun({ text, size, color, font: 'Libre Franklin' })]
}

// ── Parser de tablas markdown ────────────────────────────────────────────────
function isTableRow(line) { return line.trim().startsWith('|') && line.trim().endsWith('|') }
function isSeparatorRow(line) { return /^\s*\|[\s\-|:]+\|\s*$/.test(line) }

function parseCells(line) {
  return line.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim())
}

function buildTable(rows) {
  // rows[0] = header, rows[1] = separator, rows[2..] = data
  const headerCells = parseCells(rows[0])
  const dataRows = rows.slice(2).filter(r => !isSeparatorRow(r) && r.trim())
  const colCount = headerCells.length
  const colWidth = Math.floor(9072 / colCount)

  const tableRows = []

  // Fila de encabezado
  tableRows.push(new TableRow({
    tableHeader: true,
    children: headerCells.map(cell => new TableCell({
      shading: { type: ShadingType.CLEAR, fill: C.blueTint },
      width: { size: colWidth, type: WidthType.DXA },
      children: [new Paragraph({
        children: [new TextRun({ text: cell, bold: true, size: S.table, color: C.blueDark, font: 'Cabinet Grotesk' })],
        spacing: { before: 60, after: 60 },
      })],
    })),
  }))

  // Filas de datos
  for (const row of dataRows) {
    const cells = parseCells(row)
    tableRows.push(new TableRow({
      children: cells.map((cell, i) => new TableCell({
        width: { size: colWidth, type: WidthType.DXA },
        children: [new Paragraph({
          children: inlineRuns(cell, C.textBody, S.table),
          spacing: { before: 50, after: 50 },
        })],
      })),
    }))
  }

  return new Table({
    width: { size: 9072, type: WidthType.DXA },
    rows: tableRows,
  })
}

// ── Parser principal de markdown ─────────────────────────────────────────────
function mdToDocx(md) {
  const lines = (md ?? '').split('\n')
  const elems = []
  let i = 0

  while (i < lines.length) {
    const raw = lines[i]
    const t = raw.trim()
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
        elems.push(spacer(120, 120))
      }
      continue
    }

    // Encabezados
    if (t.startsWith('#### '))
      return void elems.push(new Paragraph({
        children: [new TextRun({ text: t.slice(5), bold: true, size: S.h3, color: C.blueLight, font: 'Cabinet Grotesk' })],
        spacing: { before: 200, after: 80 },
      })) || elems && undefined || (i = i)

    if (t.startsWith('#### ')) {
      elems.push(new Paragraph({
        children: [new TextRun({ text: t.slice(5), bold: true, size: S.h3, color: C.blueLight, font: 'Cabinet Grotesk' })],
        spacing: { before: 200, after: 80 },
      })); continue
    }
    if (t.startsWith('### ')) {
      elems.push(new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun({ text: t.slice(4), bold: true, size: S.h3, color: C.blueLight, font: 'Cabinet Grotesk' })],
        spacing: { before: 300, after: 100 },
      })); continue
    }
    if (t.startsWith('## ')) {
      elems.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: t.slice(3), bold: true, size: S.h2, color: C.blueDark, font: 'Publico Banner' })],
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C.blueTint, space: 4 } },
        spacing: { before: 400, after: 80 },
      })); continue
    }
    if (t.startsWith('# ')) {
      elems.push(new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: t.slice(2), bold: true, size: S.h1, color: C.blueDark, font: 'Publico Banner' })],
        spacing: { before: 480, after: 160 },
      })); continue
    }

    // Citas
    if (t.startsWith('> ')) {
      elems.push(new Paragraph({
        children: inlineRuns(t.slice(2), C.blueLight),
        indent: { left: 720 },
        border: { left: { style: BorderStyle.THICK, size: 12, color: C.blueSoft, space: 8 } },
        spacing: { before: 120, after: 120 },
      })); continue
    }

    // Listas no ordenadas
    if (t.match(/^[-*] /)) {
      elems.push(new Paragraph({
        children: inlineRuns(t.slice(2)),
        bullet: { level: 0 },
        spacing: { before: 60, after: 60 },
      })); continue
    }

    // Listas ordenadas
    if (t.match(/^\d+\. /)) {
      elems.push(new Paragraph({
        children: inlineRuns(t.replace(/^\d+\. /, '')),
        numbering: { reference: 'ordered', level: 0 },
        spacing: { before: 60, after: 60 },
      })); continue
    }

    // Separador
    if (t === '---' || t === '***') {
      elems.push(hr(C.blueTint, 4)); continue
    }

    // Párrafo normal
    elems.push(new Paragraph({
      children: inlineRuns(t),
      spacing: { before: 60, after: 100 },
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
    etapaNombre:    meta.etapaNombre ?? '',
    usuarioNombre:  meta.usuarioNombre ?? '',
    fecha,
  })

  const cuerpo = mdToDocx(contenido)

  const doc = new Document({
    creator:     'Germina · Laboratorio de Gobierno',
    title:       titulo,
    description: `${tipo} — ${meta.proyectoNombre}`,
    // Incrustar Publico Banner en el docx para que Word la muestre
    // en cualquier equipo sin necesidad de tenerla instalada
    ...(publicoBannerTtf ? {
      fonts: [{
        name: 'Publico Banner',
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
          text: '%1.',
          alignment: AlignmentType.LEFT,
          style: {
            paragraph: { indent: { left: 720, hanging: 360 } },
            run: { size: S.body, color: C.textBody, font: 'Libre Franklin' },
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
