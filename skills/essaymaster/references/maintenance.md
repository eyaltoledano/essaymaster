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
4. **Rebuild and gate** — `paper/build.sh`, then `essaymaster check` (must pass);
   eyeball `figures/index.html` against the changed series; scan the PDF page count
   and any new overfull warnings.
5. **Record** — `essaymaster sync-done` (advances `lastSyncedCommit`; refuses if the
   tex outran the PDF), adjust `pendingTodos`, commit per `writing.md` conventions:
   one commit per coherent theme, `paper:` prefix, message = what landed → what the
   paper now says.

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

### Migrating a standalone `paper/` when the second paper arrives

Init performs this automatically (do not ask — it is mechanical and history-preserving):

1. Pick a slug for the existing paper from its title (short-kebab).
2. `essaymaster migrate <slug>` — does the tracked `git mv` and prints the remaining
   judgment steps; history follows.
3. Fix path references to the old location: repo docs/READMEs, CI workflows,
   scripts that call `paper/build.sh` or `make -C paper`, and any `../..`-relative
   paths inside the paper's own `consolidate.mjs`/`make-figures.mjs` that reach into
   repo corpora (the extra directory level changes them — check every
   `join(paperRoot, "..")`-style path). Grep the repo for `paper/` and `-C paper`.
4. Run the migrated paper's `build.sh` — the migration isn't done until it builds.
5. Create `papers/README.md` listing both papers (status + one-line claim each).
6. Commit the migration alone (`paper: migrate paper/ -> papers/<slug>/ for
   multi-paper layout`), THEN scaffold the new paper in `papers/<new-slug>/` as a
   separate commit.

`watchedPaths` in the migrated `SYNC.json` need no change (they point at repo paths,
not the paper's own location), but `lastSyncedCommit` stays as-is — the migration
commit itself is not paper-content drift.
