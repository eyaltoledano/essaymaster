#!/usr/bin/env node
/**
 * Generate the essaymaster paper's figures as standalone SVG (vector, no
 * node_modules, no GPU, no network) from results/figures.json, plus an
 * index.html dashboard. build.sh converts SVG -> PDF for LaTeX.
 * Run: node figures/make-figures.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const fig = JSON.parse(readFileSync(join(here, "..", "results", "figures.json"), "utf8"));

const W = 760, H = 440;
const M = { l: 70, r: 28, t: 56, b: 72 };
const INK = "#1a1a2e", GRID = "#e8e8ef", AX = "#9a9aa8";
const ACCENT = "#3b5bdb", ACCENT2 = "#e8590c";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const px = (n) => Math.round(n * 100) / 100;
const day = (d) => Math.round(new Date(`${d}T00:00:00Z`).getTime() / 86400000);
const svgOpen = () =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="Helvetica,Arial,sans-serif">` +
  `<rect width="${W}" height="${H}" fill="white"/>`;
const title = (t) => `<text x="${M.l}" y="26" font-size="15" font-weight="bold" fill="${INK}">${esc(t)}</text>`;
const scale = (d0, d1, r0, r1) => (v) => r0 + ((v - d0) / (d1 - d0 || 1)) * (r1 - r0);

// shared x-axis (dates) + y-axis (count) frame with month ticks and y grid
function frame(x, y, dates, yMax, yLabel) {
  let s = "";
  const yTicks = 5;
  for (let i = 0; i <= yTicks; i++) {
    const v = (yMax / yTicks) * i;
    s += `<line x1="${M.l}" y1="${px(y(v))}" x2="${W - M.r}" y2="${px(y(v))}" stroke="${GRID}"/>`;
    s += `<text x="${M.l - 8}" y="${px(y(v) + 4)}" font-size="11" fill="${AX}" text-anchor="end">${Math.round(v)}</text>`;
  }
  const seen = new Set();
  for (const d of dates) {
    const mo = d.slice(0, 7);
    if (seen.has(mo)) continue;
    seen.add(mo);
    s += `<line x1="${px(x(day(d)))}" y1="${H - M.b}" x2="${px(x(day(d)))}" y2="${H - M.b + 5}" stroke="${AX}"/>`;
    s += `<text x="${px(x(day(d)))}" y="${H - M.b + 20}" font-size="11" fill="${AX}" text-anchor="middle">${mo}</text>`;
  }
  s += `<line x1="${M.l}" y1="${H - M.b}" x2="${W - M.r}" y2="${H - M.b}" stroke="${AX}"/>`;
  s += `<text x="${px((M.l + W - M.r) / 2)}" y="${H - 12}" font-size="11" fill="${AX}" text-anchor="middle">date (2026)</text>`;
  s += `<text x="18" y="${px((M.t + H - M.b) / 2)}" font-size="11" fill="${AX}" text-anchor="middle" transform="rotate(-90 18 ${px((M.t + H - M.b) / 2)})">${esc(yLabel)}</text>`;
  return s;
}

const stepPath = (pts, x, y, xk, yk) =>
  pts.map((p, i) => `${i ? "L" : "M"}${px(x(day(p[xk])))} ${px(y(p[yk]))}`).join(" ");

const written = [];
const write = (name, svg) => {
  writeFileSync(join(here, `${name}.svg`), svg + "</svg>\n");
  written.push(name);
  console.log(`  figures/${name}.svg`);
};

// ── Fig 1: cumulative paper-maintenance commits ──
if (fig.fig1_commit_cadence) {
  const pts = fig.fig1_commit_cadence.points;
  const d0 = day(pts[0].date), d1 = day(pts[pts.length - 1].date);
  const yMax = Math.ceil(pts[pts.length - 1].cumulative / 10) * 10;
  const x = scale(d0, d1, M.l, W - M.r), y = scale(0, yMax, H - M.b, M.t);
  let s = svgOpen() + title(fig.fig1_commit_cadence.title);
  s += frame(x, y, pts.map((p) => p.date), yMax, "cumulative paper commits");
  s += `<path d="${stepPath(pts, x, y, "date", "cumulative")}" fill="none" stroke="${ACCENT}" stroke-width="2.5"/>`;
  for (const p of pts) s += `<circle cx="${px(x(day(p.date)))}" cy="${px(y(p.cumulative))}" r="2.6" fill="${ACCENT}"/>`;
  const last = pts[pts.length - 1];
  s += `<text x="${px(x(day(last.date)) - 6)}" y="${px(y(last.cumulative) - 10)}" font-size="12" fill="${INK}" text-anchor="end" font-weight="bold">${last.cumulative} commits</text>`;
  write("fig1_commit_cadence", s);
}

// ── Fig 2: TODO burn-down (total rows, left axis; TODO rows, right axis) ──
if (fig.fig2_todo_burndown) {
  const pts = fig.fig2_todo_burndown.points;
  const d0 = day(pts[0].date), d1 = day(pts[pts.length - 1].date);
  const yMax = Math.ceil(Math.max(...pts.map((p) => p.total_rows)) / 100) * 100;
  const yMaxTodo = Math.ceil(Math.max(...pts.map((p) => p.todo_rows)) / 5) * 5;
  const x = scale(d0, d1, M.l, W - M.r - 44); // reserve room for the right axis
  const y = scale(0, yMax, H - M.b, M.t);
  const y2 = scale(0, yMaxTodo, H - M.b, M.t);
  let s = svgOpen() + title(fig.fig2_todo_burndown.title);
  s += frame(x, y, pts.map((p) => p.date), yMax, "total ledger rows (left)");
  // right axis for the TODO series
  const xR = W - M.r - 44 + 8;
  for (let i = 0; i <= 4; i++) {
    const v = (yMaxTodo / 4) * i;
    s += `<text x="${xR + 8}" y="${px(y2(v) + 4)}" font-size="11" fill="${ACCENT2}" text-anchor="start">${Math.round(v)}</text>`;
  }
  s += `<line x1="${xR}" y1="${M.t}" x2="${xR}" y2="${H - M.b}" stroke="${ACCENT2}" stroke-dasharray="3 3" opacity="0.5"/>`;
  s += `<text x="${W - 10}" y="${px((M.t + H - M.b) / 2)}" font-size="11" fill="${ACCENT2}" text-anchor="middle" transform="rotate(90 ${W - 10} ${px((M.t + H - M.b) / 2)})">TODO-flagged rows (right)</text>`;
  s += `<path d="${stepPath(pts, x, y, "date", "total_rows")}" fill="none" stroke="${ACCENT}" stroke-width="2.5"/>`;
  s += `<path d="${stepPath(pts, x, y2, "date", "todo_rows")}" fill="none" stroke="${ACCENT2}" stroke-width="2.5"/>`;
  for (const p of pts) {
    s += `<circle cx="${px(x(day(p.date)))}" cy="${px(y(p.total_rows))}" r="2.6" fill="${ACCENT}"/>`;
    s += `<circle cx="${px(x(day(p.date)))}" cy="${px(y2(p.todo_rows))}" r="2.6" fill="${ACCENT2}"/>`;
  }
  const last = pts[pts.length - 1];
  const first = pts[0];
  s += `<text x="${px(x(day(last.date)) - 6)}" y="${px(y(last.total_rows) - 10)}" font-size="12" fill="${ACCENT}" text-anchor="end" font-weight="bold">total: ${last.total_rows}</text>`;
  s += `<text x="${px(x(day(last.date)) - 6)}" y="${px(y2(last.todo_rows) - 10)}" font-size="12" fill="${ACCENT2}" text-anchor="end" font-weight="bold">TODO: ${last.todo_rows}</text>`;
  s += `<text x="${px(x(day(first.date)) + 6)}" y="${px(y2(first.todo_rows) - 10)}" font-size="12" fill="${ACCENT2}" text-anchor="start">TODO: ${first.todo_rows}</text>`;
  write("fig2_todo_burndown", s);
}

const html = `<!doctype html><meta charset="utf-8"><title>essaymaster paper figures</title>
<body style="font-family:sans-serif;max-width:840px;margin:2rem auto">
<h1>Figure dashboard</h1>
${written.map((n) => `<h3>${n}</h3><img src="${n}.svg" style="max-width:100%;border:1px solid #ddd">`).join("\n")}
</body>`;
writeFileSync(join(here, "index.html"), html);
console.log(`make-figures: ${written.length} figure(s) + index.html`);
