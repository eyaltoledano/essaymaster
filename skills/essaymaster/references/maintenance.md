# Maintenance: keeping the paper synced with the repo

The defining feature of essaymaster: the paper is a living artifact that absorbs
engineering work as it lands. The author should never have to remember to update it —
drift is detected mechanically and folded in on request (or on a schedule).

## SYNC.json

Each paper directory carries `SYNC.json`:

```json
{
  "lastSyncedCommit": "<full sha the paper last absorbed>",
  "watchedPaths": ["src/engine/", "bench/", "docs/design/", "scripts/engine/results.jsonl"],
  "watchedSignals": [
    "commits with perf numbers in the message",
    "new files under docs/design/",
    "changes to bench corpora"
  ],
  "pendingTodos": ["vocab-prune controlled sweep (n>=5)", "A5000 batching rerun"]
}
```

- `watchedPaths` = the parts of the repo whose changes could alter what the paper
  claims. Set at init; extend whenever a sync reveals a blind spot.
- `pendingTodos` mirrors the reviewer-readiness checklist so drift reports can say
  "and 3 known measurement gaps remain".

`scripts/paper-drift.sh` prints `<n> commits since last paper sync` by running
`git log --oneline <lastSyncedCommit>..HEAD -- <watchedPaths>`. It is silent when
there is no paper or no drift, so it is safe as a SessionStart hook.

## The sync protocol

1. **Collect** — `git log <lastSyncedCommit>..HEAD -- <watchedPaths>` plus a skim of
   new/changed design docs and bench corpora in the range.
2. **Classify** each item:
   - **New contribution** — big enough to change the contributions list (rare; be
     conservative — a contribution is a claim + mechanism + measurement, not a feature).
   - **Changed number** — a watched metric moved. Update `data/measurements.json`
     with new provenance; obey the equal-or-better-rigor replacement rule
     (`provenance.md`).
   - **New evidence for an existing claim** — an ablation ran, a TODO closed. Update
     the claims table, remove the `\todo{}`, check off the readiness checklist with
     date + log location.
   - **Narrative-relevant** — changes framing/limitations (a dependency swapped, a
     path deprecated, a claim now stale). Fix the prose.
   - **Retraction trigger** — landed work that *invalidates* a paper statement
     (a feature removed, a number that no longer reproduces). Fix immediately; a stale
     overclaim is worse than a gap. Say so in the commit message.
   - **Irrelevant** — most commits. Skip.
3. **Apply** — data first (`measurements.json` → run `consolidate.mjs` →
   `make-figures.mjs`), then tex. Numbers change through the pipeline, never inline.
4. **Rebuild** — `paper/build.sh`; open `figures/index.html` mentally (or actually)
   against the changed series; scan the PDF page count and any new overfull warnings.
5. **Record** — update `SYNC.json` (`lastSyncedCommit` → current HEAD, adjust
   `pendingTodos`), commit per `writing.md` conventions: one commit per coherent theme,
   `paper:` prefix, message = what landed → what the paper now says.

## Cadence patterns

- **On-demand**: user says "sync the paper" → run the protocol.
- **Ambient**: the SessionStart drift hook prints a one-liner; when it shows
  meaningful drift, offer (don't force) a sync.
- **Post-campaign**: after any optimization campaign / big merge, sync before the
  context evaporates — the commit messages and fresh logs are the provenance.
- **Periodic review**: every N syncs, run a full review pass (`writing.md` §Review) —
  incremental syncs accrete inconsistency (abstract vs body numbers, figure drift).

## Multi-paper repos

Use `papers/<slug>/` each with its own `SYNC.json` and disjoint-ish `watchedPaths`.
Drift script iterates over all of them. A repo-level `papers/README.md` lists papers +
status (draft / preprint vN / submitted / published) + one-line claim each.
