---
description: Mine Claude session transcripts for paper material git can't show
---

Invoke the `essaymaster` skill in **mine-sessions** mode. Follow
`references/session-mining.md` end to end: inventory the current project's
transcripts under `~/.claude/projects/<project-slug>/` (scope `all` sweeps every
project), grep-prefilter for measurement/reversal/insight/methodology tokens, fan
out `session-miner` subagents over the top hit-density transcripts with hit-line
maps, dedupe every find against git history and existing docs (only
session-exclusive material survives), cluster recurring shapes across sessions,
and present ranked candidates in the standard mining format — flagging which
evidence is transcript-only and needs a clean re-run before it can enter a ledger.

$ARGUMENTS
