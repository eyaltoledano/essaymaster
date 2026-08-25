---
description: Fold work landed since the last sync into the paper(s)
---

Invoke the `essaymaster` skill in **sync** mode. Follow `references/maintenance.md`:
`node "${CLAUDE_PLUGIN_ROOT}/bin/essaymaster.mjs" drift --json` for the watched
commit list, classify each landed item (new contribution / changed number / new
evidence / narrative / retraction trigger / irrelevant), apply changes through the
data pipeline (measurements.json → consolidate → figures) before touching the tex,
rebuild with `build.sh`, gate with `essaymaster check`, advance the pointer with
`essaymaster sync-done`, and commit per theme with the `paper:` prefix. Retraction
triggers (landed work that invalidates a paper claim) are fixed first.

$ARGUMENTS
