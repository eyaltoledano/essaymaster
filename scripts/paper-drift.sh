#!/usr/bin/env bash
# essaymaster: report how far each repo-resident paper has drifted from HEAD.
# Silent (exit 0, no output) when: not a git repo, no SYNC.json anywhere, or no drift.
# Safe to run as a SessionStart hook in any repo.
# Usage: paper-drift.sh [repo-root]
set -uo pipefail
ROOT="${1:-$(git rev-parse --show-toplevel 2>/dev/null || true)}"
[ -n "$ROOT" ] && [ -d "$ROOT/.git" ] || exit 0
command -v node >/dev/null 2>&1 || exit 0

# Find paper dirs: paper/SYNC.json or papers/*/SYNC.json (max depth 3, skip node_modules)
SYNCS=$(find "$ROOT" -maxdepth 3 -name SYNC.json -not -path "*/node_modules/*" 2>/dev/null)
[ -n "$SYNCS" ] || exit 0

while IFS= read -r sync; do
  dir=$(dirname "$sync")
  rel=${dir#"$ROOT"/}
  last=$(node -e "try{process.stdout.write(String(JSON.parse(require('fs').readFileSync('$sync','utf8')).lastSyncedCommit||''))}catch(e){}")
  # un-initialized template or empty -> silent (init hasn't run yet)
  [ -n "$last" ] && [ "$last" != "FILL-AT-INIT" ] || continue
  git -C "$ROOT" cat-file -e "$last^{commit}" 2>/dev/null || { echo "essaymaster: $rel last-synced commit $last not found (rebase?)"; continue; }
  # watched paths (may be empty -> watch everything)
  paths=$(node -e "try{const s=JSON.parse(require('fs').readFileSync('$sync','utf8'));process.stdout.write((s.watchedPaths||[]).join('\n'))}catch(e){}")
  if [ -n "$paths" ]; then
    # shellcheck disable=SC2086
    n=$(git -C "$ROOT" log --oneline "$last..HEAD" -- $paths 2>/dev/null | wc -l | tr -d ' ')
  else
    n=$(git -C "$ROOT" log --oneline "$last..HEAD" 2>/dev/null | wc -l | tr -d ' ')
  fi
  if [ "${n:-0}" -gt 0 ]; then
    echo "essaymaster: '$rel' is $n watched commit(s) behind HEAD — consider a paper sync (/paper-sync)."
  fi
done <<< "$SYNCS"
exit 0
