#!/usr/bin/env bash
# Install (or refresh) the essaymaster capture hook into a repo's .git/hooks/post-commit.
# Idempotent: replaces its own marked block, preserves any pre-existing hook content.
# Usage: install-git-hook.sh [repo-root]   (default: current repo)
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="${1:-$(git rev-parse --show-toplevel)}"
HOOKS_DIR="$(git -C "$ROOT" rev-parse --git-path hooks)"
case "$HOOKS_DIR" in /*) ;; *) HOOKS_DIR="$ROOT/$HOOKS_DIR" ;; esac
HOOK="$HOOKS_DIR/post-commit"
BEGIN="# >>> essaymaster capture hook >>>"
END="# <<< essaymaster capture hook <<<"

mkdir -p "$HOOKS_DIR"
[ -f "$HOOK" ] || printf '#!/usr/bin/env bash\n' > "$HOOK"

# strip any previous marked block, then append the current payload inline
TMP="$(mktemp)"
awk -v b="$BEGIN" -v e="$END" '$0==b{skip=1} !skip{print} $0==e{skip=0}' "$HOOK" > "$TMP"
{
  cat "$TMP"
  echo "$BEGIN"
  echo "# Installed by essaymaster (self-contained; re-run install-git-hook.sh to refresh)."
  echo "("                                  # subshell: payload's exits/set -u stay contained
  tail -n +2 "$HERE/paper-post-commit.sh"   # payload minus its shebang
  echo ") || true"
  echo "$END"
} > "$HOOK"
rm -f "$TMP"
chmod +x "$HOOK"
echo "essaymaster: capture hook installed at $HOOK"
