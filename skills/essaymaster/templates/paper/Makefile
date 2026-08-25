# Paper — one-command build. No GPU, no network.
#   make            -> data + figures + paper.pdf (if a LaTeX engine is installed)
#   make data       -> regenerate results/*
#   make figures    -> regenerate figures/*.svg (+ PDF/PNG)
#   make pdf        -> compile paper.tex
#   make clean      -> remove LaTeX aux + generated raster/pdf figures
#   make arxiv      -> assemble the arXiv upload bundle in arxiv-bundle/

TECTONIC := $(shell command -v tectonic 2>/dev/null)
LATEXMK := $(shell command -v latexmk 2>/dev/null)
PDFLATEX := $(shell command -v pdflatex 2>/dev/null)
NODE := node

.PHONY: all data figures pdf clean arxiv

all: data figures pdf

data:
	$(NODE) results/consolidate.mjs

figures: data
	$(NODE) figures/make-figures.mjs
	@bash -c 'for s in figures/*.svg; do [ -e $$s ] || continue; b=$${s%.svg}; \
	  if command -v rsvg-convert >/dev/null; then rsvg-convert -f pdf -o $$b.pdf $$s; \
	  elif command -v qlmanage >/dev/null; then qlmanage -t -s 1100 -o figures $$s >/dev/null 2>&1 || true; [ -f $$s.png ] && mv -f $$s.png $$b.png; fi; \
	done'

pdf: figures
ifneq ($(TECTONIC),)
	$(TECTONIC) paper.tex
else ifneq ($(LATEXMK),)
	$(LATEXMK) -pdf -bibtex -interaction=nonstopmode paper.tex
else ifneq ($(PDFLATEX),)
	$(PDFLATEX) -interaction=nonstopmode paper.tex
	-bibtex paper
	$(PDFLATEX) -interaction=nonstopmode paper.tex
	$(PDFLATEX) -interaction=nonstopmode paper.tex
else
	@echo "No LaTeX engine (tectonic/latexmk/pdflatex). Figures + data are built."
	@echo "Install tectonic (brew install tectonic) and re-run 'make pdf'."
endif

arxiv: pdf
	@mkdir -p arxiv-bundle/figures
	cp paper.tex arxiv.sty refs.bib arxiv-bundle/
	-cp paper.bbl arxiv-bundle/ 2>/dev/null || true
	-cp figures/*.pdf arxiv-bundle/figures/ 2>/dev/null || true
	-cp figures/*.png arxiv-bundle/figures/ 2>/dev/null || true
	@echo "arXiv bundle assembled in arxiv-bundle/ (ship paper.bbl with it)."

clean:
	rm -f paper.aux paper.log paper.out paper.bbl paper.blg paper.fls paper.fdb_latexmk
	rm -f figures/*.png figures/*.pdf
	rm -rf arxiv-bundle
