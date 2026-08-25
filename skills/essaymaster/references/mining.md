# Mining a repo for papers

Goal: given a codebase, surface the papers hiding in it — ranked, evidenced, honest
about what's missing — so the team can pick one and go straight to `init`.

## Where papers hide

Sweep these sources (fan out subagents for large repos, one per source class):

1. **Git history** — `git log --oneline` end to end. Look for: sustained optimization
   campaigns (series of perf commits with numbers in messages), "first time X worked"
   commits, reverts that encode negative results, long-lived feature branches. A
   campaign with recorded before/after numbers is half an evaluation section already.
2. **Design docs / postmortems** (`docs/`, `rfcs/`, ADRs) — a doc that argues a
   non-obvious position ("X is dispatch-bound, not compute-bound") is a thesis.
3. **Benchmark corpora** — results.jsonl / CSV / bench output committed anywhere.
   Recorded measurements with dates and configs are the scarcest paper ingredient;
   inventory them first.
4. **The weird parts** — anything the team built because nothing off-the-shelf fit.
   "We had to hand-write X because Y breaks on Z" is the classic systems-paper seed.
5. **Negative results** — things tried and reverted with measurements. Publishable as
   findings inside a larger paper, occasionally alone.

## Candidate template

For each candidate produce:

```markdown
### <working title>
**Claim (one sentence).** The thing a reviewer would cite this paper for.
**Genre.** systems paper / measurement study / experience report / position essay — and
  the nearest published peer (find one via web search; note how thin or strong it is).
**Novelty check.** 3–6 closest prior works, web-verified. State the gap explicitly.
  A THIN prior-art field is a feature — "no direct precedent for X" is the contribution,
  but you must survey hard enough to say it credibly.
**Evidence inventory.** ✅ already measured (where recorded) / ⚠️ measured but needs a
  clean controlled re-run / 🆕 must be newly measured. Be blunt: the gap between
  "we saw 2x once" and "n≥5 with error bars on named hardware" is the main cost.
**Effort.** T-shirt size for: missing measurements, writing, figures.
**Risk.** What could kill it (a peer paper that already exists, a number that won't
  reproduce, a claim that's really configuration-dependent).
**Disclosure.** public / needs-clearance / internal-only. Rate by the most
  restrictive source the candidate draws on (private repos, unreleased products,
  proprietary methods, competitive data => internal-only). Internal-only candidates
  are still presented — as internal-whitepaper targets — but are never drafted for
  publication without the owner's explicit decision.
```

## Ranking

Score candidates on: (a) evidence already recorded, (b) size of the prior-art gap,
(c) breadth of interest, (d) cost of the missing measurements. Prefer the candidate
whose evaluation section already half-exists in the repo — papers stall on missing
measurements, not missing prose.

Present the ranked list, recommend one, and stop for the user's pick (this is a genuine
scope decision). On pick → `references/planning.md`.
