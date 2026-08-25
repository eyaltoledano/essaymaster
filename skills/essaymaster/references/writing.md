# Writing, LaTeX conventions, and review passes

## Drafting order

Write in evidence-first order, not page order:

1. **Evaluation skeleton first** — testbed table, protocol, the claims table's ✅ rows
   turned into tables/figures. If the evaluation can't be written, the paper isn't
   ready; find out now.
2. **Contributions list** (bulleted, in the intro) — one sentence per contribution,
   each ending with its headline evidence. This list is the paper's API; everything
   else serves it.
3. **The distinctive middle sections** — the anatomy/characterization section that
   frames the problem your way (write it as cohesive original prose, not assembled
   notes), then one section per contribution: mechanism → why the obvious alternative
   fails → measured result.
4. **Background/motivation** — anchored on a *motivating measurement*, not opinion.
5. **Related work** — transcribe the plan doc's survey into positioned prose.
6. **Abstract and intro last**, once the numbers are frozen.

## LaTeX conventions (matching `templates/paper/paper.tex`)

- `\documentclass[twocolumn]{article}` + `\usepackage{arxiv}` (the shipped
  self-contained `arxiv.sty`); single-column is fine for a first drop. Two-column
  densification kit: `fontsize` ≈9.4pt, tight `geometry` margins, `\columnsep`≈0.24in.
- `\newcommand{\todo}[1]{\textcolor{red}{[\textbf{TODO:} #1]}}` — loud, greppable,
  and honest. Every TODO row in the data has one of these at its point of use.
- `\graphicspath{{figures/}}` and `\includegraphics{figN_name}` with NO extension —
  graphicx picks `.pdf` then `.png`, so the build works with or without an SVG
  converter.
- booktabs tables (`\toprule/\midrule/\bottomrule`), math mode for all comparative
  numbers (`\(2.1\times\)`), `natbib` cites.
- Keep one sentence per source line where practical — LaTeX diffs stay reviewable and
  sync commits stay small.

## Voice

- Declarative and specific. Every superlative is backed by a table in the same paper.
- Name the negative space: what you did NOT do, what is Metal-only, what n was.
- Qualifiers live in the claiming sentence itself ("aggregate, not per-stream").
- Prefer mechanism over adjective: "every batched kernel is string-derived from its
  single-sequence source, so accumulation order is identical by construction" beats
  "highly reliable".

## Review passes

Run reviews as an adversarial pass producing **numbered findings** (`#E1, #E2…` for
evidence issues, `#D1…` for drift/consistency, `#C1…` for citation problems, `#H1…`
for honesty/overclaim). Use the bundled `paper-reviewer` agent or a fresh subagent
with review-only instructions. Checklist:

- **Overclaim hunt**: every causal claim ("X because Y") — is Y actually isolated by
  an ablation, or is it correlation across a whole-stack change? Qualify or cut.
- **Number reconciliation**: every number in the tex ↔ its `measurements.csv` row.
  Any figure whose visual contradicts a table. Abstract numbers ↔ body numbers.
- **Citation audit** per `citations.md` (ids real? venues right? repo-only respected?).
- **Limitations completeness**: device variance, thermal, version drift, n, author
  bias — is each named?
- **Genre check**: does the evaluation open with questions, name baseline versions,
  report run counts?

Fix findings in commits referencing the finding ids (`paper: qualify causal claim in
abstract (review #E1/#E3)`), so the review trail is reconstructible from git log.

## Commit conventions

- Prefix `paper:` or `docs(paper):`.
- One coherent change per commit; message says what landed in the repo and what the
  paper now claims ("paper: add continuous-batching contribution + ablations").
- Never commit a build-broken tex; run `paper/build.sh` before committing.
