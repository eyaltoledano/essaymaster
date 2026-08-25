#!/usr/bin/env node
/**
 * Consolidate every measured number for the essaymaster paper into flat,
 * provenance-tagged datasets under results/. The corpus here is the git history
 * of the case-study repo (gerbil) as mined on 2026-08-25; the mined series are
 * curated into data/measurements.json, so this script needs no access to the
 * case-study repo itself.
 *
 * Outputs:
 *   - results/measurements.csv   flat key,value,is_todo,provenance
 *   - results/figures.json       per-figure data series the charts consume
 *
 * No GPU, no network. Run: node results/consolidate.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const paperRoot = join(here, "..");
const out = (name) => join(here, name);

const csvCell = (v) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const toCsv = (rows, cols) =>
  [cols.join(","), ...rows.map((r) => cols.map((c) => csvCell(r[c])).join(","))].join("\n") + "\n";

// ── 1. Flatten curated measurements.json into key/value/is_todo/provenance rows ──
const m = JSON.parse(readFileSync(join(paperRoot, "data", "measurements.json"), "utf8"));
const rows = [];
const walk = (obj, prefix, provenance) => {
  const prov = obj?.provenance ?? provenance ?? "";
  for (const [k, v] of Object.entries(obj)) {
    if (k === "provenance" || k.startsWith("_")) continue;
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) walk(v, key, prov);
    else if (Array.isArray(v)) v.forEach((item, i) =>
      item && typeof item === "object" ? walk(item, `${key}[${i}]`, prov)
        : rows.push({ key: `${key}[${i}]`, value: item, is_todo: item === "TODO" ? 1 : 0, provenance: prov }));
    else rows.push({ key, value: v, is_todo: v === "TODO" ? 1 : 0, provenance: prov });
  }
};
walk(m, "", "");
writeFileSync(out("measurements.csv"), toCsv(rows, ["key", "value", "is_todo", "provenance"]));

// ── 2. Figure series (straight from the curated mined series) ──
const figures = {};
if (m.commit_timeline?.rows) {
  figures.fig1_commit_cadence = {
    title: "Paper-maintenance commits over the case-study window",
    provenance: m.commit_timeline.provenance,
    // rows: [{date: "YYYY-MM-DD", n: commits-that-day}] -> cumulative series
    points: (() => {
      let cum = 0;
      return m.commit_timeline.rows.map((r) => ({ date: r.date, cumulative: (cum += r.n) }));
    })(),
  };
}
if (m.todo_history?.rows) {
  figures.fig2_todo_burndown = {
    title: "Unsourced (TODO-flagged) numbers in the provenance ledger over time",
    provenance: m.todo_history.provenance,
    // rows: [{date, todo_rows, total_rows}]
    points: m.todo_history.rows,
  };
}
writeFileSync(out("figures.json"), JSON.stringify(figures, null, 2) + "\n");

const todos = rows.filter((r) => r.is_todo).length;
console.log(`consolidate: ${rows.length} curated rows (${todos} TODO), ${Object.keys(figures).length} figure series`);
