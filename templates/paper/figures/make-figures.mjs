#!/usr/bin/env node
/**
 * Generate the paper's figures as standalone SVG (vector, no node_modules, no GPU,
 * no network) from results/figures.json, plus an index.html dashboard embedding
 * them all for human review. build.sh converts SVG -> PDF for LaTeX.
 *
 * Keep this file ZERO-DEPENDENCY: hand-rolled SVG strings only.
 * Run: node figures/make-figures.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const fig = JSON.parse(readFileSync(join(here, "..", "results", "figures.json"), "utf8"));

// ── style baseline (see essaymaster references/figures.md) ──
const W = 760, H = 440;
const M = { l: 70, r: 28, t: 56, b: 72 };
const INK = "#1a1a2e", GRID = "#e8e8ef", AX = "#9a9aa8";
const ACCENT = "#3b5bdb", ACCENT2 = "#e8590c", ACCENT3 = "#2b8a3e";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const px = (n) => Math.round(n * 100) / 100;
const svgOpen = () =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="Helvetica,Arial,sans-serif">` +
  `<rect width="${W}" height="${H}" fill="white"/>`;
const title = (t) => `<text x="${M.l}" y="26" font-size="15" font-weight="bold" fill="${INK}">${esc(t)}</text>`;
const axisLabel = (x, y, t, rotate = false) =>
  `<text x="${x}" y="${y}" font-size="11" fill="${AX}" text-anchor="middle"${rotate ? ` transform="rotate(-90 ${x} ${y})"` : ""}>${esc(t)}</text>`;

// linear scale helper
const scale = (d0, d1, r0, r1) => (v) => r0 + ((v - d0) / (d1 - d0 || 1)) * (r1 - r0);

const written = [];
const write = (name, svg) => {
  writeFileSync(join(here, `${name}.svg`), svg + "</svg>\n");
  written.push(name);
  console.log(`  figures/${name}.svg`);
};

// ── figures: one block per entry in figures.json ──
// Example bar chart:
// if (fig.fig1_example) {
//   const { title: t, series } = fig.fig1_example;           // [{label, value}, ...]
//   const max = Math.max(...series.map((s) => s.value));
//   const x = scale(0, series.length, M.l, W - M.r), y = scale(0, max * 1.1, H - M.b, M.t);
//   let s = svgOpen() + title(t);
//   series.forEach((d, i) => {
//     const bx = x(i) + 8, bw = (W - M.l - M.r) / series.length - 16;
//     s += `<rect x="${px(bx)}" y="${px(y(d.value))}" width="${px(bw)}" height="${px(H - M.b - y(d.value))}" fill="${ACCENT}"/>`;
//     s += `<text x="${px(bx + bw / 2)}" y="${H - M.b + 16}" font-size="11" fill="${INK}" text-anchor="middle">${esc(d.label)}</text>`;
//     s += `<text x="${px(bx + bw / 2)}" y="${px(y(d.value) - 6)}" font-size="11" fill="${INK}" text-anchor="middle">${d.value}</text>`;
//   });
//   s += axisLabel((M.l + W - M.r) / 2, H - 12, "x-axis label (units)");
//   write("fig1_example", s);
// }

// ── review dashboard ──
const html = `<!doctype html><meta charset="utf-8"><title>Paper figures</title>
<body style="font-family:sans-serif;max-width:840px;margin:2rem auto">
<h1>Figure dashboard</h1>
${written.map((n) => `<h3>${n}</h3><img src="${n}.svg" style="max-width:100%;border:1px solid #ddd">`).join("\n")}
</body>`;
writeFileSync(join(here, "index.html"), html);
console.log(`make-figures: ${written.length} figure(s) + index.html`);
