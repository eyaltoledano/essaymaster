#!/usr/bin/env node
/**
 * Consolidate every measured number for the paper into flat, provenance-tagged
 * datasets under results/. Adapt the CORPORA section to this repo's recorded
 * measurement sources (bench logs, results.jsonl, CSVs) — cleaning/filtering
 * lives HERE (and logs what it drops), never in the figure script.
 *
 * Outputs:
 *   - results/measurements.csv   flat key,value,is_todo,provenance for every curated number
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

// ── 2. CORPORA: clean raw recorded runs from the repo into per-figure series ──
// Example:
//   const raw = readFileSync(join(paperRoot, "..", "bench", "results.jsonl"), "utf8")
//     .split("\n").filter(Boolean).map((l) => JSON.parse(l));
//   const kept = raw.filter((r) => r.mode === "decode");   // log what you drop!
//   console.log(`corpus: kept ${kept.length}/${raw.length} rows`);
const figures = {
  // fig1_example: { title: "…", series: [...] },
};
writeFileSync(out("figures.json"), JSON.stringify(figures, null, 2) + "\n");

const todos = rows.filter((r) => r.is_todo).length;
console.log(`consolidate: ${rows.length} curated rows (${todos} TODO), ${Object.keys(figures).length} figure series`);
