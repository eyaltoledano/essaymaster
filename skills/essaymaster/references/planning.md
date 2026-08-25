# The plan doc — write this before any LaTeX

The plan is a repo-committed markdown doc (convention: `docs/research-paper-plan.md`,
or `docs/<slug>-paper-plan.md` for multi-paper repos). It is the blueprint the paper is
written FROM, and it outlives the drafting phase as the citation ledger and claims
register. Four sections, in order:

## A) Related-work survey (verified)

Group prior work by theme (one table per theme). Every row:

| System | Cite-as | 1-line | Role |
|---|---|---|---|

- **Cite-as** is web-verified: arXiv id + venue + year confirmed by an actual search,
  or explicitly `repo only <url> (no paper)`. NEVER write an id you didn't verify —
  see `citations.md`.
- **Role** is one of: `BASELINE` (you compare numbers against it), `CONTRAST`
  (architectural counterpoint you position against), `BACKGROUND` (framing/lineage).
  Role determines what the evaluation section owes: every BASELINE needs a
  measured comparison or an explicit "pending" flag.
- Record **gap findings** as callouts: "no direct precedent for X; nearest neighbor is
  Y but differs in Z" — these become the novelty statements.
- Record **anti-citations**: names that sound like methods but have no canonical paper
  ("do NOT cite 'X' — not real; the actual ancestor is …"). These prevent future
  sessions from hallucinating references.

## B) Genre template

- Find the nearest published peer and characterize it honestly (pages, figures,
  baselines, ablations). It defines the *minimum recognizable genre*; the venue's
  conventions (MLSys/OSDI-style for systems work) define the *quality bar*.
- The rigorous-systems-paper skeleton: Abstract → Intro (with explicit bulleted
  contributions) → Background/Motivation (with a motivating measurement) → Design →
  Implementation → Evaluation → Related Work (dedicated section) → Limitations/Future
  Work → Conclusion → Artifact Appendix.
- Evaluation-section conventions to adopt: open with explicit questions (Q1…Qn);
  hardware/environment table up front (exact device, OS, versions, commit hash, run
  count, warm-up protocol); named baselines WITH versions; ablations isolating each
  optimization; medians/error bars over N runs, never single numbers.
- Pick the template: self-contained `arxiv.sty` single/two-column for the arXiv drop
  (lowest friction, shipped in `templates/paper/`); venue `.sty` as the dress-up
  variant later. Content is identical; only the class swaps.

## C) Outline + claims + figures

1. **Section-by-section outline**, each section annotated with which contribution it
   carries and where its evidence lives (file/log/doc).
2. **Claims → required-evidence table** — the single most important artifact:

   | # | Claim | Evidence needed | Have it? |
   |---|---|---|---|

   `Have it?` is ✅ (recorded, cite the source) / ⚠️ (partial — say exactly what a
   clean run needs) / ❌. Every ⚠️/❌ row becomes an entry in the ablation runbook
   (see `provenance.md`) and a `\todo{}` in the draft. The paper may only claim what
   this table backs.
3. **Figure/table list**, each item tagged ✅ data exists / ⚠️ needs a clean sweep /
   🆕 new asset, with the data source named.

## D) Toolchain plan

Usually just "use the shipped template" (see `toolchain.md`). Record deviations here:
venue class, pandoc-from-markdown pipeline if the source is MD, TeX Live pinning.

Only after the plan is committed do you scaffold `paper/` and start drafting
(`writing.md`).
