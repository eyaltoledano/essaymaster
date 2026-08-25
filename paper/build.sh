#!/usr/bin/env bash
# Build the paper. No GPU, no network (tectonic's first-run package fetch excepted).
#
# Pipeline:
#   1. regenerate consolidated results + figures (deterministic, from recorded data)
#   2. convert figure SVG -> PDF (preferred) or PNG (fallback) for \includegraphics
#   3. compile paper.tex -> paper.pdf (tectonic, else latexmk, else pdflatex+bibtex)
#
# The .tex compiles against whichever figure format exists (graphicx picks .pdf
# then .png). If no LaTeX engine is installed the script stops after producing the
# figures and prints exactly what is missing.
set -euo pipefail
cd "$(dirname "$0")"

echo "==> [1/3] consolidate results + figures"
node results/consolidate.mjs
node figures/make-figures.mjs

echo "==> [2/3] convert figure SVG -> PDF/PNG"
have() { command -v "$1" >/dev/null 2>&1; }
for svg in figures/*.svg; do
  [ -e "$svg" ] || continue
  base="${svg%.svg}"
  if have rsvg-convert; then
    rsvg-convert -f pdf -o "$base.pdf" "$svg"
  elif have inkscape; then
    inkscape "$svg" --export-type=pdf --export-filename="$base.pdf" >/dev/null 2>&1
  elif have cairosvg; then
    cairosvg "$svg" -o "$base.pdf"
  elif have qlmanage; then
    # macOS native: SVG -> PNG (LaTeX includes the PNG; graphicx falls back to it)
    qlmanage -t -s 1100 -o figures "$svg" >/dev/null 2>&1 || true
    [ -f "$svg.png" ] && mv -f "$svg.png" "$base.png"
  else
    echo "    (no SVG converter; expecting pre-rendered $base.png)"
  fi
done
if ls figures/*.svg >/dev/null 2>&1; then
  ls figures/*.pdf >/dev/null 2>&1 && echo "    figures: PDF" || echo "    figures: PNG (install rsvg-convert for vector PDF)"
else
  echo "    figures: none yet"
fi

echo "==> [3/3] compile paper.tex"
if have tectonic; then
  tectonic paper.tex 2>&1 | tail -3
  echo "==> OK: paper.pdf (tectonic)"
elif have latexmk; then
  latexmk -pdf -bibtex -interaction=nonstopmode paper.tex
  echo "==> OK: paper.pdf"
elif have pdflatex; then
  pdflatex -interaction=nonstopmode paper.tex
  if have bibtex; then bibtex paper || true; fi
  pdflatex -interaction=nonstopmode paper.tex
  pdflatex -interaction=nonstopmode paper.tex
  echo "==> OK: paper.pdf"
else
  echo "==> NO LaTeX ENGINE FOUND."
  echo "    Figures + consolidated data are built. To produce the PDF:"
  echo "      brew install tectonic          # recommended, self-contained"
  echo "    then re-run: ./build.sh"
  exit 0
fi
