#!/usr/bin/env bash
# essaymaster capture hook (git post-commit payload).
# After each commit: if the commit touches any paper's watchedPaths but not the
# paper itself, print a one-line nudge. The message appears in the committer's
# output (including an agent's Bash tool result), so the paper question is raised
# at the exact moment work lands. Silent otherwise. Never fails the commit.
set -uo pipefail
ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
command -v node >/dev/null 2>&1 || exit 0

CHANGED="$(git diff-tree --no-commit-id --name-only -r HEAD 2>/dev/null)"
[ -n "$CHANGED" ] || exit 0

SYNCS=$(find "$ROOT" -maxdepth 3 -name SYNC.json -not -path "*/node_modules/*" 2>/dev/null)
[ -n "$SYNCS" ] || exit 0

while IFS= read -r sync; do
  dir=$(dirname "$sync"); rel=${dir#"$ROOT"/}
  last=$(node -e "try{process.stdout.write(String(JSON.parse(require('fs').readFileSync('$sync','utf8')).lastSyncedCommit||''))}catch(e){}")
  [ -n "$last" ] && [ "$last" != "FILL-AT-INIT" ] || continue
  paths=$(node -e "try{const s=JSON.parse(require('fs').readFileSync('$sync','utf8'));process.stdout.write((s.watchedPaths||[]).join('\n'))}catch(e){}")
  [ -n "$paths" ] || continue
  hits=0; paper_touched=0
  while IFS= read -r f; do
    case "$f" in "$rel"/*) paper_touched=1; continue;; esac
    while IFS= read -r w; do
      case "$f" in "$w"*) hits=$((hits+1)); break;; esac
    done <<< "$paths"
  done <<< "$CHANGED"
  if [ "$hits" -gt 0 ] && [ "$paper_touched" -eq 0 ]; then
    echo "essaymaster: this commit touches $hits path(s) watched by '$rel' — if it changes a number, claim, or narrative there, run /paper-sync (or note it for the next sync)."
  fi
done <<< "$SYNCS"
exit 0
