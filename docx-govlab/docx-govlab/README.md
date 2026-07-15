# docx-govlab — Skill de identidad de marca para documentos Word

Capa de identidad visual del GovLab (colores, tipografía, membrete, pie de página)
sobre la skill genérica `docx`. No genera documentos por sí sola — le dice a Claude
*cómo se ve* un documento del laboratorio cuando genera uno.

## Instalar

**Claude Code / Antigravity (filesystem-based):**
```bash
mkdir -p .claude/skills/docx-govlab
cp SKILL.md .claude/skills/docx-govlab/
cp -r assets .claude/skills/docx-govlab/
```

**Claude API (Skills API):**
```bash
ant beta:skills create --file docx-govlab.zip --beta skills-2025-10-02
```
Luego referenciarla junto con la skill `docx` en el mismo request (container.skills),
o si el proyecto ya tiene su propio runner de docx-js, simplemente incluir
`.claude/skills/docx-govlab/SKILL.md` como contexto del agente.

## Variables / assets pendientes

Esta skill referencia los mismos assets de marca que `govlab-appspec`
(`Govlab.png`, `Govlab_blanco.png`, `Universidad_de_la_Sabana.png`,
`Universidad_de_la_Sabana_blanco.png`). Cópialos a `assets/` de esta skill desde el
set oficial del laboratorio antes de generar el primer documento — este paquete no
incluye los binarios de imagen.

## Continuar el desarrollo con Antigravity

Abre esta carpeta en Antigravity (o pégala en el contexto del agente que arma
documentos) y pega este mensaje:

> "Tengo la skill `docx-govlab` en `.claude/skills/docx-govlab/`. Cuando generes un
> informe, propuesta o carta institucional en Word para el GovLab, aplica siempre
> el header con los dos logos, el footer azul institucional y la paleta de color de
> la sección 1 del SKILL.md — no inventes colores ni uses la fuente 'Publico Banner'
> literal en el .docx, usa el fallback serif indicado. Verifica el resultado
> renderizándolo a PDF antes de darlo por terminado."
