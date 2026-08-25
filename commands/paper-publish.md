---
description: Assemble and verify the arXiv submission bundle
---

Invoke the `essaymaster` skill in **publish** mode per `references/toolchain.md` §arXiv.
Two gates BEFORE assembling anything: (1) pre-submission — `essaymaster check` passes,
remaining TODOs are framed as future work, reviewer-readiness checklist reconciled;
(2) disclosure — confirm with the owner that every claim and number in the paper is
cleared for public release (nothing internal-only or needs-clearance; see the
Disclosure rule in SKILL.md). Then `node
"${CLAUDE_PLUGIN_ROOT}/skills/essaymaster/bin/essaymaster.mjs" bundle` (builds with a .bbl, assembles,
verifies), and remind the user to review arXiv's rebuilt PDF before finalizing.

$ARGUMENTS
