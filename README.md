# essaymaster

Write and maintain repo-resident research papers that grow with your codebase.

Extracted from the practice that produced the Gerbil WebGPU paper: a ~27-page
arXiv-grade systems paper living in `paper/` of the engine repo, kept current across
two months and ~40 maintenance commits as optimization campaigns landed — every number
provenance-tagged, every citation verified, rebuilt with one command.

## What it does

- **Mine** — point it at a repo and it surfaces the papers hiding in it: sustained
  optimization campaigns with recorded numbers, non-obvious theses in design docs,
  things you hand-built because nothing off-the-shelf fit. Ranked candidates with an
  honest evidence inventory; you pick.
- **Init** — plan doc first (verified related-work survey, claims → required-evidence
  table, figure list), then a scaffolded `paper/` with a one-command
  data → figures → PDF build (tectonic/latexmk autodetect, zero-dependency figure
  generators).
- **Sync** — the maintenance loop. `SYNC.json` tracks the last commit the paper
  absorbed and which paths it watches; a SessionStart hook prints drift ("paper is 14
  watched commits behind"); `/paper-sync` classifies landed work and folds it in
  through the provenance pipeline. Nobody has to remember the paper exists.
- **Review / Publish** — adversarial review with numbered findings (overclaim hunt,
  number reconciliation, citation audit), then a verified arXiv bundle.

## Install (Claude Code plugin)

From a marketplace that includes this repo, or locally:

```bash
# marketplace entry pointing at this directory, then:
/plugin install essaymaster
```

Or use it without installing: mention "essaymaster" / point Claude at
`skills/essaymaster/SKILL.md` in this checkout.

Commands: `/paper-mine` `/paper-init` `/paper-sync` `/paper-build` `/paper-review`
`/paper-publish`.

## The two invariants

1. **Provenance or TODO.** Every number in a paper traces to a row in
   `results/measurements.csv` with a source string, or is flagged `TODO` in the data
   and rendered as a loud red `\todo{}` in the PDF. No third state.
2. **Honesty is structural.** Unrun measurements are declared in the paper itself and
   get a runbook doc so anyone can close them later. Negative results are findings.

## Layout

```
skills/essaymaster/      SKILL.md + references/ (mining, planning, provenance,
                         citations, writing, maintenance, toolchain, figures)
commands/                /paper-* slash commands
agents/                  paper-miner (parallel repo scout), paper-reviewer (adversarial)
hooks/hooks.json         SessionStart drift report (silent when no paper / no drift)
scripts/                 check-toolchain.sh, paper-drift.sh
templates/paper/         the scaffold: build.sh, Makefile, arxiv.sty, paper.tex
                         skeleton, refs.bib, data/results/figures pipeline, SYNC.json
```
