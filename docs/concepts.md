# Concepts

Five ideas explain everything essaymaster does.

## 1. The paper lives in the repo

A paper managed by essaymaster is a directory inside the repository it describes
(`paper/`, or `papers/<slug>/` when a repo has several). It has the same standing as
the code: versioned with it, reviewed in its pull requests, rebuilt by anyone from a
bare checkout with one command and no network. When the repo moves, the paper is
expected to move with it, and the tooling measures whether it has.

Why it matters: a paper kept anywhere else (a Google Doc, an Overleaf project, a
laptop) silently drifts into fiction the first week nobody looks at it.

## 2. Every number is sourced or loudly missing

All measured values live in one data file, `data/measurements.json`. Every entry
carries a provenance note: the file, log, or command it came from, and when. A
script flattens this into an audit CSV and into the figure data, and the paper's
tables and charts are generated from there. Numbers are never typed straight into
the text.

A number you don't have yet is entered as the literal value `TODO`. It flows through
the pipeline as a flagged row and renders in the PDF as a red marker you cannot
miss. So every number is in exactly one of two states: sourced, or visibly missing.

Why it matters: "where does this number come from?" is answered by one grep, for
every number, forever. That is the difference between a paper and a blog post.

## 3. Honesty is built in, not hoped for

Good intentions decay under deadline pressure, so the discipline makes honesty
structural:

- Measurements you haven't run yet are declared unrun in the paper itself, and each
  gets a written runbook precise enough that anyone can execute it later.
- Negative results are reported with their numbers.
- A headline number can only be replaced by one measured at least as carefully.
- A readiness checklist maps every remaining gap to its flagged rows, so
  "submittable" is a checkable fact rather than a feeling.

## 4. Drift is measured, not remembered

Each paper carries a small state file, `SYNC.json`, recording the last repo commit
it absorbed and which paths could affect its claims. From that, "how stale is the
paper?" becomes a number. Two hooks surface it automatically: a session-start note
when the paper has fallen behind, and a nudge in the commit output the moment landed
work touches watched paths. A sync is then a bounded chore: look at the landed
commits, decide which ones change a number, a claim, or the story, apply those
through the data pipeline, rebuild, advance the pointer.

Why it matters: repos move in bursts. A paper synced on a schedule is wrong during
the burst and needlessly touched during the quiet. A paper synced on measured drift
is touched exactly when it matters.

## 5. Writing and publishing are different decisions

Not all work should become a paper, and not every paper should become public. Mined
candidates carry a disclosure rating: `public`, `needs-clearance`, or
`internal-only`. Internal-only material never enters a publishable paper without the
owner's explicit decision. An internal whitepaper in a private repo is a first-class
outcome, not a lesser one. Publishing (the arXiv bundle) is a separate step with its
own gate, where you confirm everything in the paper is cleared for release.

## Where the agent fits

Claude does the judgment work: mining candidates, classifying landed commits,
wording claims, reviewing adversarially. The bundled CLI does the mechanical work:
scaffolding, drift counting, state transitions, and a `check` verb that lints the
rules above (it also runs in CI, which means the paper has tests). The split is
deliberate: an agent should never be trusted to compute what a script can compute,
and a script should never be trusted to decide what a claim means.
