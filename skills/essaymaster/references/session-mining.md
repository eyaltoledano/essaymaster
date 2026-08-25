# Mining agent-session transcripts for paper material

Git history records what won. Session transcripts record how, what lost, and what it
cost — the material a strong paper is actually made of. This mode mines the Claude
Code session logs for the current project and returns candidates in the same format
as repo mining (`mining.md`), tagged by which signal class they carry.

## What counts as a signal (the taxonomy)

Rank finds by class; classes 1–2 are the unique value of this mode:

1. **Dead ends with measurements.** Approaches tried, measured, and abandoned
   in-session that never reached a commit. Git only records winners; the transcript
   holds the losers, and measured negative results are publishable findings. A
   revert-with-numbers in a transcript is a finding; a silent absence in git is
   nothing.
2. **Diagnosis arcs.** Multi-step debugging sagas ending in a root-cause insight.
   The commit says "fix loader"; the transcript contains the methodology section:
   hypotheses, ruled-out causes, the discriminating experiment.
3. **In-session breakthroughs.** Before/after numbers where the narrative of how the
   number moved (what was tried in what order, what the pivotal observation was)
   exists only in the transcript.
4. **Cross-session patterns.** The same problem shape recurring across many sessions
   is a thesis, not an anecdote ("we keep hitting X" -> a characterization paper).
   Look for repeated error signatures, repeated workarounds, repeated ceilings.
5. **Surprise moments.** Expectation violations: "that shouldn't have worked",
   predictions falsified by a measurement, a fix that worked for the wrong reason.
   Surprises mark where the field's default assumption is wrong — prime paper
   territory.
6. **Emergent methodology.** Process innovations in how the work was done
   (verification harnesses, parity-by-construction kernel derivation, autonomous
   optimization loops) that were never documented because they weren't "features".

## Where sessions live

Claude Code project transcripts: `~/.claude/projects/<project-slug>/*.jsonl`, where
the slug is the project path with `/` replaced by `-` (e.g.
`-Users-alice-Code-myrepo`). Default scope is the **current project**; pass `all` to
sweep every project directory (cross-project sweeps mainly serve signal class 4).

## Protocol

1. **Inventory, don't read.** List transcripts with size and mtime. Transcripts are
   huge (often 10-100+ MB); NO agent reads one end-to-end.
2. **Prefilter with grep.** Cheap signal probes per file, e.g.: measurement tokens
   (`tok/s`, `ms`, `x faster`, `regression`, `baseline`), reversal tokens (`revert`,
   `abandon`, `didn't work`, `worse`, `ruled out`), insight tokens (`root cause`,
   `turns out`, `surprising`, `unexpected`, `the real problem`), and
   methodology tokens (`harness`, `parity`, `by construction`, `autonomous`).
   Rank files by hit density; take the top slice.
3. **Fan out session-miner subagents** (the `session-miner` agent), one per
   transcript or per small batch, each given the grep hit-lines + line numbers as a
   map so it samples around hits instead of paging blindly. Each returns finds in
   the taxonomy above with: what happened, the numbers involved, the session file +
   approximate location, and which signal class.
4. **Dedupe against git.** For each find, check whether the insight already surfaced
   in a commit message, design doc, or the existing paper. Only session-exclusive
   material (or material whose narrative is far richer than its commit) survives.
   This is the load-bearing filter: the mode's output must be what git CANNOT show.
5. **Cluster for class 4.** After per-session finds return, group recurring shapes
   across sessions; a cluster of 3+ independent occurrences is promoted to its own
   candidate.
6. **Rank and present** using the candidate template of `mining.md` (claim, genre,
   novelty check, evidence inventory, effort, risk), noting per candidate which
   evidence is transcript-only and would need a clean re-run to be citable.

## Evidence-quality rule

A transcript is a lab notebook, not a measurement of record. Transcript numbers may
seed a candidate and appear in a plan doc as leads, but before any enters a paper's
ledger it must be either (a) re-run cleanly, or (b) ledgered with explicit
transcript provenance AND flagged in the paper as an uncontrolled observation.
Invariant 1 applies with no session-mining exception.

## Privacy rule

Transcripts can contain secrets, tokens, personal data, and unrelated work. Miners
quote sparingly (numbers and one-line paraphrases, not raw transcript dumps), never
copy environment values or credentials into findings, and candidate reports name
sessions by file + date, not by pasted content.
