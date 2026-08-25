# Figures: generated, versioned, zero-dependency

Figures are code, not artwork. The chain:

```
data/measurements.json → consolidate.mjs → figures.json → make-figures.mjs → figN_*.svg
                                                        → index.html (review dashboard)
build.sh: figN_*.svg → rsvg-convert → figN_*.pdf (vector)  [fallback: PNG raster]
```

## Rules

- **`make-figures.mjs` has zero npm dependencies** — hand-rolled SVG strings with a
  small helper set (escape, scale, axis ticks). This keeps the paper buildable from a
  bare checkout forever; no chart-library bitrot.
- Figures consume **only `results/figures.json`** — never reach into raw corpora from
  the figure script; consolidation is where cleaning/filtering lives (and is where
  dropped data gets logged, e.g. "29 adversarial probes dropped").
- **One `index.html` dashboard** embedding every figure, regenerated with the SVGs —
  the human review surface after every sync ("did the progression chart just get a
  weird kink?").
- Naming: `figN_snake_slug.svg` matching `\includegraphics{figN_snake_slug}` (no
  extension in tex).
- Vector first: SVG → PDF via rsvg-convert. PNG (`qlmanage -t -s 1100` on macOS) only
  as a fallback; the tex compiles with either present.

## Style baseline (encoded in the template generator)

- ~760×440 viewBox, generous margins (l≈70 b≈72) for axis labels; 9–12px sans labels.
- Restrained palette: near-black ink `#1a1a2e`, light grid `#e8e8ef`, muted axes
  `#9a9aa8`, 2–3 accent colors max (`#3b5bdb`, `#e8590c`, `#2b8a3e`).
- Every chart: title + unit-bearing axis labels inside the SVG (it must survive alone
  in the PDF), error bars/whiskers when n>1 (label n), annotation callouts for the
  one number the caption will cite.
- Captions in the tex carry the claim + protocol ("whisker = min–max of n=3 runs"),
  not a restatement of the axes.
- Progression/waterfall charts (metric over a campaign) are the workhorse genre for
  "we optimized X over time" papers — keep per-step labels (what change, what delta).
