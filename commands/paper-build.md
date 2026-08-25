---
description: Build the paper PDF (installing missing toolchain as needed)
---

Invoke the `essaymaster` skill in **build** mode: run
`${CLAUDE_PLUGIN_ROOT}/skills/essaymaster/scripts/check-toolchain.sh`, install anything missing per
`references/toolchain.md`, run the paper's `build.sh`, then `node
"${CLAUDE_PLUGIN_ROOT}/skills/essaymaster/bin/essaymaster.mjs" check` — report page count, new
warnings, and the check verdict (including its TODO counts).

$ARGUMENTS
