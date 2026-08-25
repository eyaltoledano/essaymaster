---
name: essaymaster
description: >
  Write and maintain repo-resident research papers (arXiv-grade systems/ML papers,
  technical essays, whitepapers) that grow alongside the codebase. Use when the user
  wants to: find potential papers hiding in a repo ("what papers could we write from
  this codebase?"), start a paper ("write a paper about X"), keep an existing paper
  current ("sync the paper", "update the paper with the batching work"), build/compile
  a paper, run a review pass, or prepare an arXiv submission. Triggers: "paper",
  "essay", "whitepaper", "arxiv", "publication", "write up our work", "essaymaster".
---

# Essaymaster

A complete lifecycle for **repo-resident research papers**: the paper lives inside the
project repo, every number it states traces to a recorded measurement, every citation is
verified, and the paper is re-synced as engineering work lands — without the author
having to remember anything.

## The model

A paper under essaymaster is a directory (conventionally `paper/`, or `papers/<slug>/`
for multi-paper repos) with this contract. **When a second paper is added to a repo
that has a standalone `paper/`, init MUST first migrate it to `papers/<slug>/`**
(protocol in `references/maintenance.md` §Multi-paper) — the tooling follows
`SYNC.json` locations either way, but the layout stays uniform.

```
paper/
  paper.tex            # the paper (LaTeX, arxiv.sty or venue class)
  refs.bib             # verified bibliography — every entry checked, never invented
  build.sh + Makefile  # one-command: data -> figures -> PDF (no GPU, no network)
  arxiv.sty            # self-contained preprint class
  data/measurements.json   # THE single curated, provenance-tagged number source
  results/consolidate.mjs  # regenerates flat CSVs + figures.json from data/ + repo corpora
  figures/make-figures.mjs # zero-dependency SVG figure generator + index.html dashboard
  SYNC.json            # maintenance state: last-synced commit, watched paths, todo list
  README.md            # layout, provenance statement, reviewer-readiness checklist
```

Two invariants make the whole system work — enforce them in every mode:

1. **Provenance or TODO.** Every number in the paper maps to a row in
   `data/measurements.json` with a `provenance` string (file/log/date it came from), or
   it is flagged `TODO` in the data and rendered as `\todo{}` in the tex. There is no
   third state. Never fill a number that wasn't actually measured.
2. **Honesty is structural.** Unmeasured claims are declared unmeasured *in the paper
   itself* (abstract, evaluation, limitations), and pending measurements get a precise
   runbook doc so a future session can close them. See `references/provenance.md`.

## Modes

Detect the mode from what the user asked; when ambiguous, `sync` is the default for a
repo that already has a paper, `mine` for one that doesn't.

| Mode | When | Reference |
|---|---|---|
| **mine** | "what papers could come out of this repo?" — explore, extract candidates, score, propose | `references/mining.md` |
| **init** | a candidate is agreed — write the plan doc, then scaffold `paper/` from `templates/paper/` and draft | `references/planning.md`, `references/writing.md` |
| **sync** | maintenance: fold landed work into the paper (the recurring mode) | `references/maintenance.md` |
| **build** | compile: check/install toolchain, run `paper/build.sh` | `references/toolchain.md` |
| **review** | adversarial review pass with numbered findings, then fix commits | `references/writing.md` §Review |
| **publish** | assemble + verify the arXiv bundle | `references/toolchain.md` §arXiv |

Read the mode's reference file BEFORE acting — each contains the distilled discipline
(from the Gerbil paper practice, ~40 maintenance commits over 2 months) that makes the
output review-grade instead of blog-grade.

## Mode: sync (the heart of maintenance)

This is what makes papers maintain themselves. Full protocol in
`references/maintenance.md`; the shape:

1. Read `paper/SYNC.json` → `lastSyncedCommit`, `watchedPaths`.
2. `git log <lastSyncedCommit>..HEAD -- <watchedPaths>` → classify landed work:
   new contribution / changed number / new ablation / narrative-relevant / irrelevant.
3. For each relevant item: update `data/measurements.json` (with provenance), the
   affected sections, and the contributions list if warranted. New peak numbers replace
   old ones ONLY with equal-or-better measurement rigor; otherwise both are kept and the
   difference explained.
4. Rebuild (`paper/build.sh`), eyeball the figure dashboard, update `SYNC.json`.
5. Commit per landed theme with the `paper:` / `docs(paper):` prefix — one commit per
   coherent change, message states what landed and what the paper now claims.

`scripts/paper-drift.sh` (also wired as a SessionStart hook when installed as a plugin)
prints how far the paper has drifted; when it reports drift, offer to sync.

## Mode: mine (one-shot extraction from a repo)

Explore the repo (git history, design docs, benchmark corpora, README, tests) and
produce a ranked candidate list — each with: the claim, the genre/venue shape, an
evidence inventory (what's already measured vs. what a reviewer would demand), a
novelty check against real prior work (web-verify; gaps in prior art are themselves
contributions), and an effort estimate. Present candidates and let the user pick;
then flow into `init`. Full protocol in `references/mining.md`. For a large repo,
fan out Explore/general-purpose agents per subsystem (or the bundled
`paper-miner` agent) and synthesize.

## Mode: init (plan first, then scaffold, then draft)

Never start in LaTeX. First produce the **plan doc** (`docs/research-paper-plan.md`
convention): verified related-work survey with cite-as + role per entry, genre template
choice, section outline, the **claims → required-evidence table**, and the figure/table
list with per-item data status (✅ have / ⚠️ needs sweep / 🆕 new asset). Then scaffold
`paper/` by copying `templates/paper/` from this skill's plugin root (see
`references/toolchain.md` for locating it), fill `data/measurements.json` from real
recorded sources, and draft section-by-section per `references/writing.md`.

## Rules that always apply

- **Citations**: verify every id by web search before writing it into `refs.bib`; many
  major systems (llama.cpp, MLX, transformers.js…) have NO paper — cite the repo, never
  invent an arXiv id. Full hygiene list in `references/citations.md`.
- **Figures are generated, never hand-drawn**: data flows
  `measurements.json → consolidate.mjs → figures.json → make-figures.mjs → SVG → PDF`.
  Zero npm dependencies in the generators. See `references/figures.md`.
- **The build must be deterministic and offline**: anyone (and CI) can regenerate
  data + figures + PDF from a checkout with no GPU and no network.
- **Voice**: measured, specific, honest. Negative results are reported as findings, not
  hidden. Superlatives only when the table backing them is in the paper.
- Install missing tools (tectonic, rsvg-convert…) via the checks in
  `scripts/check-toolchain.sh` rather than failing — see `references/toolchain.md`.
