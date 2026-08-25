#!/usr/bin/env bash
# essaymaster: SessionStart drift report — thin wrapper over the CLI (the single
# source of truth for drift logic). Silent when: not a git repo, no node, no
# initialized paper, or no drift. Safe to run as a SessionStart hook in any repo.
# Usage: paper-drift.sh [repo-root]
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="${1:-$(git rev-parse --show-toplevel 2>/dev/null || true)}"
[ -n "$ROOT" ] && [ -e "$ROOT/.git" ] || exit 0
command -v node >/dev/null 2>&1 || exit 0
cd "$ROOT" && node "$HERE/../bin/essaymaster.mjs" drift --quiet 2>/dev/null
exit 0
