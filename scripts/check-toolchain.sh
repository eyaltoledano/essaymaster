#!/usr/bin/env bash
# essaymaster: report the paper-build toolchain status with exact install hints.
# Exit 0 always (informational). Usage: check-toolchain.sh [--quiet]
set -uo pipefail
QUIET="${1:-}"
ok=0; missing=0
have() { command -v "$1" >/dev/null 2>&1; }
row() { # name, purpose, install
  if have "$1"; then
    ok=$((ok+1)); [ "$QUIET" = "--quiet" ] || printf "  ✅ %-14s %s\n" "$1" "$2"
  else
    missing=$((missing+1)); printf "  ❌ %-14s %s\n       install: %s\n" "$1" "$2" "$3"
  fi
}

[ "$QUIET" = "--quiet" ] || echo "essaymaster toolchain:"
row node "data consolidation + figure generation (required)" "https://nodejs.org or brew install node"

# TeX engine: any one of tectonic / latexmk / pdflatex suffices
if have tectonic || have latexmk || have pdflatex; then
  eng=$(have tectonic && echo tectonic || (have latexmk && echo latexmk || echo pdflatex))
  ok=$((ok+1)); [ "$QUIET" = "--quiet" ] || printf "  ✅ %-14s TeX engine (auto-detected by build.sh)\n" "$eng"
else
  missing=$((missing+1))
  printf "  ❌ %-14s no TeX engine found\n       install: brew install tectonic   (recommended; self-contained)\n       or:      brew install --cask mactex-no-gui\n" "tex"
fi

# SVG -> vector PDF: any one of rsvg-convert / inkscape / cairosvg; qlmanage = raster fallback
if have rsvg-convert || have inkscape || have cairosvg; then
  conv=$(have rsvg-convert && echo rsvg-convert || (have inkscape && echo inkscape || echo cairosvg))
  ok=$((ok+1)); [ "$QUIET" = "--quiet" ] || printf "  ✅ %-14s SVG -> vector-PDF figures\n" "$conv"
elif have qlmanage; then
  printf "  ⚠️  %-14s only raster fallback (qlmanage PNG); for vector figures:\n       install: brew install librsvg\n" "svg-convert"
else
  missing=$((missing+1))
  printf "  ❌ %-14s no SVG converter\n       install: brew install librsvg   (or: apt install librsvg2-bin)\n" "svg-convert"
fi

if [ "$missing" -eq 0 ]; then
  [ "$QUIET" = "--quiet" ] || echo "All set."
else
  echo "$missing tool(s) missing — install the above, then re-run paper/build.sh."
fi
exit 0
