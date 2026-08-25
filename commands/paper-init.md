---
description: Start a paper — plan doc first, then scaffold paper/ and draft
---

Invoke the `essaymaster` skill in **init** mode for: $ARGUMENTS

If the repo already has a standalone `paper/` and this is a second paper, FIRST run
the migration protocol (`references/maintenance.md` §Multi-paper): `git mv paper
papers/<slug>`, fix path references, verify the migrated build, commit — then proceed.

Order is mandatory: (1) write the plan doc per `references/planning.md` (verified
related-work survey, genre template, outline, claims→evidence table, figure list) and
commit it; (2) scaffold the paper directory from `${CLAUDE_PLUGIN_ROOT}/templates/paper/`;
(3) fill `data/measurements.json` from real recorded sources with provenance;
(4) set `SYNC.json` (lastSyncedCommit = current HEAD, watchedPaths from the plan)
and install the capture hook (`${CLAUDE_PLUGIN_ROOT}/scripts/install-git-hook.sh`);
(5) draft per `references/writing.md` and build with `paper/build.sh`.
