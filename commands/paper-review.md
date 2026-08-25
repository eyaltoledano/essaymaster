---
description: Adversarial review pass over the paper with numbered findings
---

Invoke the `essaymaster` skill in **review** mode per `references/writing.md` §Review.
Use the `paper-reviewer` agent (or fresh subagents — one per lens for a thorough pass:
overclaim hunt, number reconciliation, citation audit, limitations completeness, genre
check). Produce numbered findings (#E/#D/#C/#H), then — only if the user asked for
fixes — apply them in commits referencing the finding ids.

$ARGUMENTS
