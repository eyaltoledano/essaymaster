# Essaymaster: Keeping a Research Paper Inside the Repository It Describes

Experience-report / methodology paper about essaymaster itself, authored by Eyal
Toledano. Built per `docs/research-paper-plan.md`. The case study is five months of
the Gerbil WebGPU paper practice, mined read-only from that repository's git history
on 2026-08-25. This paper is the first end-to-end run of the essaymaster pipeline
(mine -> plan -> scaffold -> data -> figures -> draft -> review -> build).

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
refs.bib             verified bibliography (7 web-verified works + repo/site-only entries)
build.sh / Makefile  data -> figures -> PDF pipeline
data/measurements.json   curated, provenance-tagged number set (single editable source)
results/consolidate.mjs  regenerates measurements.csv + figures.json (no deps)
figures/make-figures.mjs generates the 2 SVG figures + index.html dashboard (no deps)
SYNC.json            essaymaster maintenance state (watches the tool itself)
```

## Provenance and honesty

Every number in the paper traces to a row in `results/measurements.csv`; the
provenance field of each case-study row records the exact git/file command it was
mined with, dated 2026-08-25. Zero rows are TODO-flagged. Numbers measured once
(the 4.7 s build timing) are labelled single-run in the paper. The corpus caveat
(the earliest 4 commits are engineering-reference feat commits) and the
upper-bound caveat on the drift measure are stated where the numbers are used.

## Reviewer-readiness checklist

- [x] Adversarial review pass with numbered findings (2026-08-25, this pipeline run)
- [ ] Controlled comparison against ad-hoc paper maintenance (explicitly NOT claimed;
      future work per plan claims-table row 6)
- [ ] Second case study once the packaged tool accrues its own maintenance history
