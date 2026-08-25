# Commands and CLI reference

## Slash commands (what you type in Claude Code)

| Command | What happens |
|---|---|
| `/paper-mine` | Explore the repo and propose ranked paper candidates with an honest evidence inventory. You pick; nothing is written yet. |
| `/paper-mine-sessions` | Mine your Claude session transcripts for what git can't show: measured dead ends, diagnosis arcs, cross-session patterns. Only session-exclusive finds survive. |
| `/paper-init` | Start the chosen paper: plan doc with verified citations first, then scaffold and draft. Installs the commit-time nudge hook. |
| `/paper-sync` | Fold landed work into the paper: classify the watched commits, update data then prose, rebuild, advance the pointer. |
| `/paper-build` | Check/install the toolchain, build the PDF, run the lint gate, report the verdict. |
| `/paper-review` | Adversarial review with numbered findings (evidence, drift, citations, honesty). Read-only; fixes are a separate step. |
| `/paper-publish` | Readiness gate + disclosure gate, then assemble and verify the arXiv upload bundle. |

## CLI verbs (what the agent and CI run)

The CLI lives inside the skill folder itself (`skills/essaymaster/bin/essaymaster.mjs`;
after a standard install that is `~/.claude/skills/essaymaster/bin/essaymaster.mjs`),
zero dependencies, so any install that delivers the skill delivers the CLI. You
rarely type these yourself, with two exceptions worth knowing: `check` (wire it
into CI) and `drift` (a quick status look).

| Verb | What it does |
|---|---|
| `essaymaster drift [--json]` | How far each paper lags HEAD, per paper. Silent-friendly for hooks. |
| `essaymaster init [--dir D]` | Scaffold a paper directory, set the sync pointer, install the git hook. |
| `essaymaster migrate <slug>` | Move a standalone `paper/` to `papers/<slug>/` with history, then print the follow-up steps. |
| `essaymaster check [--json]` | Lint the invariants: provenance coverage, citation keys, figure files, TODO surfacing, staleness. Exit 1 on failure, so it works as a CI gate. |
| `essaymaster sync-done [--commit sha]` | Advance the sync pointer. Refuses if the tex is newer than the built PDF. |
| `essaymaster bundle` | Build with a `.bbl`, assemble `arxiv-bundle/`, verify its contents, surface the disclosure gate. |
| `essaymaster hooks install` | (Re)install the git post-commit nudge hook. |

## The two hooks

| Hook | Plane | Fires when |
|---|---|---|
| Session-start drift report | Claude Code (`hooks/hooks.json`) | You start a session in a repo whose paper has fallen behind. Silent otherwise. |
| Capture nudge | git (`.git/hooks/post-commit`, installed by `init`) | A commit touches paths the paper watches without touching the paper. The note appears in the commit output, for agents and humans alike. |

## Build (per paper, no CLI needed)

Every paper builds standalone from a bare checkout:

```bash
cd paper && ./build.sh    # data -> figures -> paper.pdf; no GPU, no network
make -C paper             # same, plus data/figures/pdf/clean/arxiv targets
```
