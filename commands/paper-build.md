---
description: Build the paper PDF (installing missing toolchain as needed)
---

Invoke the `essaymaster` skill in **build** mode: run
`${CLAUDE_PLUGIN_ROOT}/scripts/check-toolchain.sh`, install anything missing per
`references/toolchain.md`, then run the paper's `build.sh` and report page count,
new warnings, and any remaining `\todo{}` count (`grep TODO results/measurements.csv`).

$ARGUMENTS
