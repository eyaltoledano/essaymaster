---
description: Start a paper — plan doc first, then scaffold paper/ and draft
---

Invoke the `essaymaster` skill in **init** mode for: $ARGUMENTS

Order is mandatory: (1) write the plan doc per `references/planning.md` (verified
related-work survey, genre template, outline, claims→evidence table, figure list) and
commit it; (2) scaffold the paper directory from `${CLAUDE_PLUGIN_ROOT}/templates/paper/`;
(3) fill `data/measurements.json` from real recorded sources with provenance;
(4) set `SYNC.json` (lastSyncedCommit = current HEAD, watchedPaths from the plan);
(5) draft per `references/writing.md` and build with `paper/build.sh`.
