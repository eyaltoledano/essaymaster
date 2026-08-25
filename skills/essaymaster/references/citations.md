# Citation hygiene

Invented or sloppy citations are the fastest way to torch a paper's credibility.
These rules are absolute.

## Verify before you write

- Every citation is **web-verified in the session that adds it**: search, confirm the
  arXiv id, author, year, and venue. Then record it in the plan doc's survey table so
  it never needs re-verifying.
- Many load-bearing systems have **no paper at all** (historically: llama.cpp, MLX,
  MLC-LLM, transformers.js, ONNX Runtime, candle, ncnn, Bark…). Cite the repository
  URL with a note `(no paper)`. **Never invent an arXiv id** and never "anchor" a
  repo-only system to a vaguely related paper without saying so explicitly.
- Distinguish venue tiers precisely: main conference ≠ Findings ≠ workshop ≠ preprint.
  "arXiv:XXXX (preprint, no venue)" is a legitimate cite-as; misstating a preprint as
  an ICML paper is not.
- Some classics have **no arXiv version** (pre-2007 papers, some OSDI/AISTATS work):
  cite the proceedings/anthology id.
- Keep an **anti-citation list** in the plan doc: plausible-sounding method names that
  do not correspond to a real canonical paper, with the pointer to what actually
  exists. This stops future sessions from re-hallucinating them.

## BibTeX mechanics

- One `refs.bib`, `natbib` + `\bibliographystyle{plainnat}` (or `unsrtnat`). Avoid
  biblatex/Biber — keeps the arXiv BibTeX path simple.
- Consistent keys: `firstauthorYYYYshortname` (e.g. `kwon2023vllm`).
- arXiv entries: `@article` with `journal = {arXiv preprint arXiv:XXXX.XXXXX}`; add
  the venue once it has one.
- Repo-only entries: `@misc` with `howpublished = {\url{https://github.com/...}}` and
  `note = {no paper}`.
- **Ship the generated `.bbl` in the arXiv bundle** — arXiv won't reliably re-run
  BibTeX (see `toolchain.md`).

## In-text conventions

- `\citep{}` for parenthetical, `\citet{}` for textual subjects.
- Cite at the claim, not the paragraph: each comparative statement carries its own
  citation.
- When positioning against a BASELINE/CONTRAST work, state its versioned identity
  ("WebLLM 0.2.x via MLC q4f16_1") in the evaluation, not just its name.
