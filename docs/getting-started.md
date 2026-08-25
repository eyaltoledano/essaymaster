# Getting started

Essaymaster turns your repo's real work into a research paper that stays true as the
code evolves. You talk to Claude; the tooling handles the bookkeeping.

## Install

```bash
npx skills add eyaltoledano/essaymaster
```

That's it. The skill, commands, agents, and CLI all arrive together.

## Find your first paper

You rarely start from a blank page. Your repo already contains paper material:
optimization campaigns with recorded numbers, design decisions nothing off-the-shelf
could satisfy, benchmark logs. Ask Claude to surface it:

```
/paper-mine
```

You get a ranked list of candidate papers, each with an honest inventory of what is
already measured and what a reviewer would still demand. Pick one.

There is a second mine worth running:

```
/paper-mine-sessions
```

This sweeps your Claude session transcripts for the material git history cannot
show: approaches that were tried, measured, and abandoned without ever being
committed, debugging sagas that ended in a root-cause insight, patterns that repeat
across sessions. Often the most interesting findings live there.

## Write it

```
/paper-init
```

Claude writes a plan first (verified citations, an outline, and a table mapping every
claim to the evidence it needs), then scaffolds a `paper/` directory and drafts the
paper section by section. Everything builds with one command and no network:

```bash
cd paper && ./build.sh     # data -> figures -> paper.pdf
```

## Keep it current

This is the part you never have to remember. Each paper tracks the last commit it
absorbed and which paths it watches. Two signals keep it honest:

- When you start a Claude session, you see a one-line note if the paper has fallen
  behind ("'paper' is 14 watched commits behind").
- When a commit lands that touches watched paths, a note appears right in the commit
  output suggesting a sync.

When either fires, run:

```
/paper-sync
```

Claude reads what landed, decides what (if anything) changes the paper, updates the
numbers through the data pipeline, rebuilds, and commits. Most commits turn out to be
irrelevant to the paper; the point is that the question gets asked every time, by
machinery instead of memory.

## Review and publish

```
/paper-review      # adversarial pass: numbered findings, nothing edited
/paper-publish     # verify readiness, assemble the arXiv upload bundle
```

Publishing is always a separate, deliberate step. Papers about private work can stay
private forever; an internal whitepaper in a private repo is a perfectly good end
state. Before anything is packaged for public release, Claude confirms with you that
every claim in it is cleared to be public.

## The one rule worth knowing on day one

Every number in the paper either traces to a recorded measurement (with a note
saying exactly where it came from), or it appears in the PDF as a loud red TODO.
There is no third state. That single rule is what makes an essaymaster paper worth
trusting six months later.
