---
description: Assemble and verify the arXiv submission bundle
---

Invoke the `essaymaster` skill in **publish** mode per `references/toolchain.md` §arXiv:
run the pre-submission gate (TODO grep empty or framed as future work; reviewer-readiness
checklist reconciled), `make arxiv`, verify the bundle contains paper.tex + paper.bbl +
the style file + pre-converted PDF figures and NO aux files, and remind the user to
review arXiv's rebuilt PDF in the preview step before finalizing.

$ARGUMENTS
