# Provenance and honesty discipline

The credibility of a repo-resident paper rests entirely on this file's rules. They are
what separates "review-grade" from "marketing with citations".

## The number pipeline

Every measured number flows through exactly one path:

```
data/measurements.json  →  results/consolidate.mjs  →  results/measurements.csv
      (curated,                (deterministic,            (flat key,value,is_todo,
   provenance-tagged,           no GPU/network)             provenance audit trail)
   single editable source)                             →  results/figures.json
                                                       →  figures/*.svg (make-figures.mjs)
```

Rules:

- **Every block in `measurements.json` carries a `provenance` string**: the file, log,
  doc section, or command it came from, with a date. "docs/engine.md §19 (measured
  2026-06-12)" is provenance; "known" is not.
- **`TODO` is a first-class value.** A number you don't have yet is entered as `TODO`,
  flows to `is_todo=1` in the CSV, and appears in the tex as `\todo{...}` (a loud red
  macro). `grep TODO results/measurements.csv` is the live gap list. There is no state
  between "sourced" and "flagged TODO".
- **Never transcribe a number straight into the tex.** If it's not in
  `measurements.json`, it doesn't go in the paper.
- **Distrust contaminated measurements.** Numbers recorded under abnormal conditions
  (GPU contention, thermal throttle, debug builds) are tagged `needs-recheck` and never
  presented as headline results. Deterministic gates (bit-exactness, exact-match
  counts, parity checks) are condition-independent and stay valid.
- **Replacing a number requires equal-or-better rigor.** A new peak replaces an old one
  only if measured at least as carefully (same-or-more runs, same protocol). Otherwise
  keep both and explain the difference.

## The honesty rules (structural, not aspirational)

1. **The paper declares its own gaps.** Unrun measurements are stated as not-run in the
   abstract/evaluation/limitations — not buried. ("Metal-measured; the A5000 rerun is
   the pending official gate.")
2. **Pending measurements get a runbook**, committed as `docs/paper-ablation-plan.md`
   (or similar): for each pending item — why it matters, the exact protocol (options
   with trade-offs if the setup is hard), what hardware/harness it needs, and the
   instruction "do not fill any paper number from this document until the run has
   actually been executed and logged." This is what lets a future session (or teammate)
   close a gap without re-deriving the design.
3. **Negative results are findings.** Measured regressions and ruled-out levers are
   reported with their numbers — they are often the most credible part of the paper.
4. **Scope claims precisely.** "4.31× aggregate at B=32, token-exact; per-stream
   latency unchanged — claim aggregate only." Write the qualifier into the sentence
   that makes the claim, not into a footnote.
5. **Whole-stack vs. component effects.** When a comparison spans different formats/
   configs (e.g., different quantization schemes per engine), say the ratio is a
   whole-stack effect and name the matched-variable experiment that would decompose
   it — even (especially) if that experiment is future work.

## The reviewer-readiness checklist

Maintain in `paper/results/README.md` (or `paper/README.md`): a checkbox list of the
remaining clean sweeps a reviewer would expect, each mapped to its `\todo{}`/TODO rows.
Check items off with the date + where the run was logged. This list plus the claims
table is the definition of "submittable".
