# <Paper title>

<One paragraph: what the paper claims, where it came from (plan doc link), author.>

## One-command build

```bash
./build.sh          # data -> figures -> paper.pdf
# or:
make                # same, via Makefile (targets: data figures pdf arxiv clean)
```

No GPU and no network are needed to regenerate the data and figures. The PDF needs a
TeX engine; the build auto-detects **tectonic** (recommended, `brew install tectonic`),
`latexmk`, or `pdflatex`, and stops after the figures with an install hint if none is
present.

## Layout

```
paper.tex            arXiv-style source (the paper)
arxiv.sty            self-contained preprint class
refs.bib             verified bibliography (every entry web-verified or repo-only)
build.sh / Makefile  data -> figures -> PDF pipeline
data/measurements.json   curated, provenance-tagged figure set (single editable source)
results/consolidate.mjs  regenerates measurements.csv + figures.json (no deps)
figures/make-figures.mjs generates the SVG figures + index.html dashboard (no deps)
SYNC.json            essaymaster maintenance state (last-synced commit, watched paths)
```

## Provenance and honesty

Every number in the paper traces to a row in `results/measurements.csv` with a source
string. `TODO`-marked rows are unsourced numbers surfaced in the paper as `\todo{}`.
Run `grep TODO results/measurements.csv` for the live gap list.

## Reviewer-readiness checklist

- [ ] <clean sweeps a reviewer would expect, each mapped to its TODO rows>
