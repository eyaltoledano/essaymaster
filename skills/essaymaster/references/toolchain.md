# Toolchain: install, build, arXiv

## Locating the templates

When installed as a plugin, templates live at `${CLAUDE_PLUGIN_ROOT}/templates/paper/`.
When used from a checkout, they're at `<essaymaster>/templates/paper/`. Scaffold by
copying the whole directory into the target repo (as `paper/` or `papers/<slug>/`),
then filling the stubs. Never leave template placeholder text in a committed paper.

## Required tools and how to get them (macOS/Linux)

Run `scripts/check-toolchain.sh` first — it reports what's present and prints exact
install commands. Install what's missing (with the user's normal package manager)
rather than degrading, unless the user is mid-flow and only needs figures.

| Tool | Role | Install | Fallback |
|---|---|---|---|
| **tectonic** | TeX engine (self-contained, fetches packages on first run) | `brew install tectonic` / `cargo install tectonic` | `latexmk`, then raw `pdflatex`+`bibtex` (needs TeX Live: `brew install --cask mactex-no-gui`) |
| **node** ≥18 | data consolidation + figure generation (zero npm deps) | already present in dev shells | none — required |
| **rsvg-convert** | SVG → vector PDF figures | `brew install librsvg` / `apt install librsvg2-bin` | `inkscape`, `cairosvg`; last resort macOS `qlmanage` → PNG raster |
| **pandoc** + `pandoc-crossref` | only if authoring in Markdown → LaTeX | `brew install pandoc pandoc-crossref` | author LaTeX directly (default) |

## The build contract

`paper/build.sh` (shipped in templates) runs, in order, and must stay: **no GPU, no
network** (tectonic's first-run package fetch excepted), deterministic:

1. `node results/consolidate.mjs` — regenerate CSVs + `figures.json` from
   `data/measurements.json` + repo corpora.
2. `node figures/make-figures.mjs` — regenerate SVGs + `index.html` dashboard.
3. SVG → PDF via rsvg-convert (or fallbacks; PNG raster as last resort — the tex
   compiles either way because `\includegraphics` omits the extension).
4. tex → PDF via tectonic → latexmk → pdflatex autodetect. If no engine: stop after
   figures with the install hint, exit 0.

`make -C paper` mirrors the same steps with `data / figures / pdf / clean / arxiv`
targets.

The CLI wraps verification around this vendored build (it never replaces it):
`essaymaster check` is the pre-commit and CI gate (wire `node
<pkg>/bin/essaymaster.mjs check` into CI so the paper has tests), and
`essaymaster bundle` builds with a `.bbl`-producing engine, assembles
`arxiv-bundle/`, and verifies its contents — prefer it over raw `make arxiv`.

## Markdown-source variant

If the team prefers Markdown as the editable source: pandoc with `--natbib` (NOT the
default citeproc — citeproc inline-expands citations and you lose `\cite`/`.bbl`
machinery, which arXiv needs), `--filter pandoc-crossref` for `@fig:`/`@tbl:` refs,
then the same latexmk/tectonic backend. Keep `refs.bib` + natbib either way.

## arXiv bundle (`make arxiv`)

Assemble `arxiv-bundle/` containing:

```
paper.tex
paper.bbl          # REQUIRED — ship the generated one; arXiv won't re-run BibTeX reliably
arxiv.sty          # (or the venue class)
refs.bib           # harmless to include
figures/*.pdf      # pre-converted — arXiv does NO figure conversion; no EPS
```

Do NOT include `.aux/.log/.out`. arXiv compiles server-side on current TeX Live —
pin/pretest locally if using exotic packages. Submit TeX source, not PDF-only (allowed
but discouraged for TeX-authored papers). Always review arXiv's rebuilt PDF in the
preview step before announcing.

Pre-submission gate: `grep TODO paper/results/measurements.csv` is empty or every
remaining row is explicitly framed as future work in the paper; reviewer-readiness
checklist items either checked or represented in Limitations.
