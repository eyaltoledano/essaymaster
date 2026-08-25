---
description: Start a paper — plan doc first, then scaffold paper/ and draft
---

Invoke the `essaymaster` skill in **init** mode for: $ARGUMENTS

If the repo already has a standalone `paper/` and this is a second paper, FIRST run
`node "${CLAUDE_PLUGIN_ROOT}/skills/essaymaster/bin/essaymaster.mjs" migrate <slug>` and finish the
judgment steps it prints (`references/maintenance.md` §Multi-paper), commit — then
proceed.

Order is mandatory: (1) write the plan doc per `references/planning.md` (verified
related-work survey, genre template, outline, claims→evidence table with Disclosure
ratings, figure list) and commit it; (2) `node
"${CLAUDE_PLUGIN_ROOT}/skills/essaymaster/bin/essaymaster.mjs" init [--dir papers/<slug>]` (scaffolds,
sets the sync pointer, installs the capture hook); (3) fill `data/measurements.json`
from real recorded sources with provenance and set `watchedPaths` from the plan;
(4) draft per `references/writing.md`, build with `paper/build.sh`, and gate with
`essaymaster check` before committing.
