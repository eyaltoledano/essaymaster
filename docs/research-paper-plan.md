# Research-Paper Plan — Essaymaster: Repo-Resident Papers Maintained Alongside the Code

**Purpose.** Blueprint for an experience-report / methodology paper about essaymaster:
the discipline of keeping a research paper *inside* the repository it describes,
maintained by an agent as engineering work lands, with structural (not aspirational)
honesty guarantees. The paper's evaluation is a five-month case study: the Gerbil
WebGPU paper practice this tool was extracted from.

**Grounding.** All case-study numbers were mined 2026-08-25 from
`/Users/shenron/Code/gerbil` git history (HEAD = `docs/paper-two-column`) with exact
commands recorded per number in `paper/data/measurements.json`. All external citations
below were verified via web search on 2026-08-25 (id + venue + year confirmed, or
explicitly flagged repo/site-only).

**Meta note (disclosed in the paper).** This paper is itself the first end-to-end run
of the essaymaster pipeline (mine → plan → scaffold → data → figures → draft → build),
executed by a Claude Code agent. That is a demonstration, not an evaluation; the
evaluation is the retrospective case study.

---

## A) Related-Work Survey (verified 2026-08-25)

| Work | Cite-as | 1-line | Role |
|---|---|---|---|
| **Literate Programming** (Knuth) | The Computer Journal 27(2), 1984, pp. 97–111 (no arXiv) | Program and its explanation as one interleaved artifact. | BACKGROUND (lineage: doc and code as one artifact; we invert — the *paper* lives with the code) |
| **Research Debt** (Olah & Carter) | Distill 2(3), 2017, DOI 10.23915/distill.00005 | Un-distilled research accumulates debt like code does. | BACKGROUND (the problem statement: exposition rots) |
| **Jupyter Notebooks** (Kluyver et al.) | ELPUB 2016, pp. 87–90 | Executable documents for reproducible workflows. | CONTRAST (executable *document*; essaymaster is an executable *pipeline around* a static PDF genre) |
| **How Software Engineers Use Documentation** (Lethbridge et al.) | IEEE Software 20(6), 2003, pp. 35–39 | Docs are routinely not updated after code changes (44% "usually outdated"). | BACKGROUND (documentation-rot evidence; papers are the extreme case) |
| **SWE-bench** (Jimenez et al.) | arXiv:2310.06770; ICLR 2024 | LMs resolving real GitHub issues in real repos. | BACKGROUND (agents operating inside real repositories) |
| **SWE-agent** (Yang et al.) | arXiv:2405.15793; NeurIPS 2024 | Agent–computer interfaces make LM agents effective in repos. | CONTRAST (we design an agent-facing *authoring* interface: skill + references + SYNC contract ≈ an ACI for paper maintenance) |
| **The AI Scientist** (Lu et al.) | arXiv:2408.06292 (preprint) | Fully automated idea→experiment→paper generation. | **CONTRAST (the key one)**: generates papers *from scratch, unmoored*; essaymaster maintains papers *grounded in a repo's recorded measurements*, with humans owning claims |
| **Claude Code** | product docs only, claude.com/claude-code (no paper) | The agent harness the plugin targets (skills/commands/agents/hooks). | BACKGROUND (substrate) |
| **Gerbil** | repo only, github.com/tryhamster/gerbil (companion preprint in-repo) | The case-study repo and its paper practice. | **BASELINE (the case study)** |
| **essaymaster** | repo only, github.com/eyaltoledano/essaymaster | The artifact this paper describes. | (the system itself) |
| **tectonic** | repo only, tectonic-typesetting/tectonic (no paper) | Self-contained TeX engine enabling the one-command offline build. | BACKGROUND (toolchain) |
| **arxiv-style** (Kour) | repo only, kourgeorge/arxiv-style (no paper; MIT) | The self-contained preprint class the templates ship. | BACKGROUND (toolchain) |

**Gap finding (load-bearing).** The agentic-paper line (AI Scientist and descendants)
automates paper *generation*; the reproducibility line (notebooks, artifact badging)
makes *finished* papers re-runnable. We found no published treatment of the middle:
keeping a *long-lived* paper continuously consistent with a *moving* codebase, with
machine-checkable provenance discipline. That maintenance problem — the paper as a
living artifact with drift detection — is the niche. (Thin prior art stated as such;
survey breadth is a limitation, see paper §Limitations.)

**Anti-citations.** "Docs-as-code" is a practice/community term (Write the Docs), not
a citable paper — describe it, don't cite a phantom. ACM artifact badging is a policy
page, cite by URL only if needed.

## B) Genre Template

- **Genre:** experience report + system description (tooling/methodology paper), the
  kind that appears at venues like ICSE-SEIP / onward-style tracks; arXiv cs.SE first.
- **Nearest peer genre-wise:** AI Scientist (system description + case studies) — but
  our evaluation is retrospective mining of a real practice, not generated samples.
- **Quality bar adopted from the systems-paper conventions:** explicit contribution
  list; a measured motivating observation; a case-study section with a corpus table,
  exact extraction commands, and stated caveats per metric; limitations that include
  the n=1 and self-evaluation problems.
- **Template:** shipped `arxiv.sty`, single-column (experience report, not a dense
  systems eval). Target 8–11 pages.

## C) Outline + Claims + Figures

### C.1 Outline

1. **Abstract** — papers about systems rot; essaymaster = repo-resident papers + two
   structural invariants + agent-run maintenance loop; 5-month case study numbers.
2. **Introduction** — the maintenance problem; contributions list (the 4 below).
3. **The Problem: Papers Rot Faster Than Docs** — documentation-rot evidence
   (Lethbridge), research debt (Olah), why a numbers-bearing paper is the worst case
   (every landed optimization invalidates a claim); motivating observation from the
   case study: 117 non-paper commits accumulated in one 16-day gap.
4. **Design: The Paper as a Repo Contract** — the paper directory contract; invariant
   1 (provenance-or-TODO, the number pipeline); invariant 2 (structural honesty:
   \todo{} macro, ablation runbooks, reviewer-readiness checklist); the SYNC.json
   drift contract; the build contract (deterministic, offline, one command).
5. **The Agent Harness** — skill + 8 references as the procedural memory; commands;
   miner/reviewer subagents; the SessionStart drift hook; why the discipline is
   encoded as prose-for-agents rather than code (the ACI framing, cf. SWE-agent).
6. **Case Study: Five Months of the Gerbil Paper** — corpus (41 commits, dates,
   caveat that the earliest 4 are engineering-reference commits); cadence figure;
   TODO burn-down figure (16→8 while ledger grew 258→498); review-pass evidence
   (numbered findings in commit messages); sync-lag table (drift between syncs,
   stated as upper bound); provenance snapshot (498 rows, 51 verified bib entries,
   17-page PDF, 4.7 s offline rebuild).
7. **The Meta-Circular Demonstration** — this paper as pipeline run #1; what it
   exercised (mine agent, citation verification, scaffold, figure pipeline) — framed
   as demonstration, not evidence.
8. **Related Work** — per §A groups.
9. **Limitations** — n=1 case study; tool author = case-study author = paper author;
   retrospective mining (practice predates the tool — the tool encodes it, so the
   case study validates the *discipline*, not the *packaged tool*); drift measure is
   an upper bound; no controlled comparison against ad-hoc paper maintenance; survey
   breadth.
10. **Conclusion.**
11. **Artifact Appendix** — repo, exact mining commands, build instructions.

### C.2 Claims → required evidence

| # | Claim | Evidence | Have it? |
|---|---|---|---|
| 1 | A repo-resident paper was actually maintained alongside a moving codebase for 5 months | 41 paper-maintenance commits 2026-03-11→2026-08-10 (HEAD-only corpus; earliest 4 are eng-reference feat commits — disclosed) | ✅ mined, provenance in measurements.json |
| 2 | The provenance ledger enforces sourced-or-TODO and the gap list shrank while the ledger grew | 8 historical versions of measurements.csv: 258 rows/16 TODO → 498/8; flag semantics verified by CSV parse | ✅ mined |
| 3 | Review passes with numbered findings are reconstructible from git history | 4 review commits; ids #E1–E7, #D1–D2, #A1 (no #C/#H ever used — disclosed as negative finding) | ✅ mined |
| 4 | The build is one-command, offline, fast enough to run per-sync | measured 4.699 s wall (n=1, warm tectonic cache — disclosed), 498-row consolidation + 9 figures + 17-page PDF | ✅ measured (n=1) |
| 5 | Drift between syncs is real and bursty | consecutive-pair table: 0–117 non-paper commits between paper commits (upper-bound method disclosed) | ✅ mined |
| 6 | Essaymaster (the packaged tool) improves maintenance outcomes vs ad-hoc | would need a controlled/multi-team study | ❌ NOT claimed — stated as future work |

### C.3 Figures/tables

- **Fig 1 — cumulative paper-maintenance commits over time** (steps at campaign
  moments). ✅ data mined.
- **Fig 2 — TODO burn-down vs ledger growth** (two series, 8 points). ✅ data mined.
- **Corpus snapshot** (rows, TODO, bib entries, pages, build time, figures) —
  demoted from a table to closing prose in §5.4 during drafting (review #D1);
  all values ledgered. ✅.
- **Table 1 — sync-lag (five largest of the last 15 gaps)** (condensed). ✅ mined,
  upper-bound caveat stated in caption and prose.

## D) Toolchain

Shipped template as-is: arxiv.sty single-column, tectonic build, zero-dep
consolidate/figures. `SYNC.json` watchedPaths: `skills/`, `templates/`, `scripts/`,
`commands/`, `agents/`, `hooks/`, `README.md` (the paper describes the tool, so tool
changes are paper drift).
