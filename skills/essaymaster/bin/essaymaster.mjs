#!/usr/bin/env node
/**
 * essaymaster CLI — the mechanical spine of the essaymaster discipline.
 *
 * Ships inside the plugin (zero dependencies), so it is ALWAYS present wherever
 * the skill runs: the skill routes every mechanical step through these verbs
 * unconditionally. Judgment (mining, classification, writing, review) stays with
 * the agent; state transitions and verification live here.
 *
 *   essaymaster drift [--json] [--quiet]     how far each paper lags HEAD
 *   essaymaster init [--dir paper]           scaffold a paper + sync state + git hook
 *   essaymaster migrate <slug>               paper/ -> papers/<slug>/ (history-preserving)
 *   essaymaster check [--json] [<dir>]       lint the invariants (CI-able; exit 1 on fail)
 *   essaymaster sync-done [--commit sha] [--force] [<dir>]   advance the sync pointer, guarded
 *   essaymaster bundle [<dir>]               build + assemble + verify the arXiv bundle
 *   essaymaster hooks install                (re)install the git post-commit capture hook
 *
 * The per-paper build stays vendored (paper/build.sh): a paper must build from a
 * bare checkout forever, with or without this CLI.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PKG = dirname(dirname(fileURLToPath(import.meta.url)));
const argvRest = process.argv.slice(3);
const flag = (name) => argvRest.includes(name);
const opt = (name) => { const i = argvRest.indexOf(name); return i >= 0 ? argvRest[i + 1] : undefined; };
const positional = () => argvRest.filter((a, i) => !a.startsWith("--") && argvRest[i - 1] !== "--commit" && argvRest[i - 1] !== "--dir");

const git = (args, cwd) => execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
const tryGit = (args, cwd) => { try { return git(args, cwd); } catch { return null; } };
const gitOk = (args, cwd) => { try { git(args, cwd); return true; } catch { return false; } };
const repoRoot = () => {
  const r = tryGit(["rev-parse", "--show-toplevel"]);
  if (!r) { console.error("essaymaster: not inside a git repository"); process.exit(1); }
  return r;
};
const readJSON = (p) => { try { return JSON.parse(readFileSync(p, "utf8")); } catch { return null; } };

function findPapers(root) {
  const out = [];
  const walk = (dir, depth) => {
    if (depth > 3) return;
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name === "node_modules" || e.name === ".git" || e.name === "templates") continue;
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p, depth + 1);
      else if (e.name === "SYNC.json") out.push({ dir: dirname(p), rel: relative(root, dirname(p)) || ".", sync: readJSON(p), syncPath: p });
    }
  };
  walk(root, 1);
  return out;
}

const initialized = (s) => s?.lastSyncedCommit && s.lastSyncedCommit !== "FILL-AT-INIT";

// ── drift ────────────────────────────────────────────────────────────────────
function cmdDrift() {
  const root = repoRoot();
  const rows = [];
  for (const p of findPapers(root)) {
    if (!initialized(p.sync)) continue;
    if (!gitOk(["cat-file", "-e", `${p.sync.lastSyncedCommit}^{commit}`], root)) {
      rows.push({ paper: p.rel, error: `lastSyncedCommit ${p.sync.lastSyncedCommit} not found (rebase?)` });
      continue;
    }
    const paths = p.sync.watchedPaths || [];
    const log = tryGit(["log", "--oneline", `${p.sync.lastSyncedCommit}..HEAD`, "--", ...(paths.length ? paths : ["."])], root) || "";
    const commits = log ? log.split("\n") : [];
    rows.push({ paper: p.rel, behind: commits.length, commits });
  }
  if (flag("--json")) return console.log(JSON.stringify(rows, null, 2));
  for (const r of rows) {
    if (r.error) console.log(`essaymaster: ${r.paper}: ${r.error}`);
    else if (r.behind > 0) console.log(`essaymaster: '${r.paper}' is ${r.behind} watched commit(s) behind HEAD — consider a paper sync (/paper-sync).`);
    else if (!flag("--quiet")) console.log(`essaymaster: '${r.paper}' is in sync.`);
  }
}

// ── init ─────────────────────────────────────────────────────────────────────
function cmdInit() {
  const root = repoRoot();
  const dir = opt("--dir") || "paper";
  const dest = join(root, dir);
  if (existsSync(dest)) { console.error(`essaymaster: ${dir}/ already exists — refusing to overwrite. (Adding a second paper? Run 'essaymaster migrate <slug>' first, then init with --dir papers/<new-slug>.)`); process.exit(1); }
  cpSync(join(PKG, "templates", "paper"), dest, { recursive: true });
  const syncPath = join(dest, "SYNC.json");
  const sync = readJSON(syncPath);
  sync.lastSyncedCommit = git(["rev-parse", "HEAD"], root);
  writeFileSync(syncPath, JSON.stringify(sync, null, 2) + "\n");
  cmdHooks(root);
  console.log(`essaymaster: scaffolded ${dir}/ (sync pointer -> ${sync.lastSyncedCommit.slice(0, 7)}).`);
  console.log("Next (agent judgment, per the skill): plan doc -> watchedPaths in SYNC.json -> data/measurements.json with provenance -> draft -> ./build.sh");
}

// ── migrate ──────────────────────────────────────────────────────────────────
function cmdMigrate() {
  const root = repoRoot();
  const slug = positional()[0];
  if (!slug) { console.error("usage: essaymaster migrate <slug>"); process.exit(1); }
  if (!existsSync(join(root, "paper"))) { console.error("essaymaster: no standalone paper/ to migrate"); process.exit(1); }
  const dest = `papers/${slug}`;
  mkdirSync(join(root, "papers"), { recursive: true });
  git(["add", "paper"], root); // git mv requires tracked sources (fresh scaffolds may be untracked)
  git(["mv", "paper", dest], root);
  const idx = join(root, "papers", "README.md");
  if (!existsSync(idx)) writeFileSync(idx, `# Papers\n\n- [${slug}](${slug}/) — <status> — <one-line claim>\n`);
  console.log(`essaymaster: git mv paper -> ${dest} done (history preserved). NOT done mechanically — the agent must now:`);
  console.log(`  1. grep the repo for 'paper/' and '-C paper' and fix references (docs, CI, scripts)`);
  console.log(`  2. check relative paths inside ${dest}/results/consolidate.mjs and figures/make-figures.mjs that reach into repo corpora (the extra directory level changes them)`);
  console.log(`  3. fill papers/README.md; run ${dest}/build.sh — migration is not done until it builds`);
  console.log(`  4. commit the migration alone, before scaffolding the new paper`);
}

// ── check ────────────────────────────────────────────────────────────────────
function paperDirArg(root) {
  const p = positional()[0];
  if (p) return resolve(root, p);
  const papers = findPapers(root);
  if (papers.length === 1) return papers[0].dir;
  if (papers.length === 0) { console.error("essaymaster: no paper (SYNC.json) found"); process.exit(1); }
  console.error(`essaymaster: multiple papers found (${papers.map((x) => x.rel).join(", ")}) — pass the directory`); process.exit(1);
}

function cmdCheck() {
  const root = repoRoot();
  const dir = paperDirArg(root);
  const fails = [], warns = [], info = [];
  const texPath = join(dir, "paper.tex");
  const tex = existsSync(texPath) ? readFileSync(texPath, "utf8") : null;
  if (!tex) fails.push("paper.tex missing");
  if (!readJSON(join(dir, "SYNC.json"))) fails.push("SYNC.json missing or invalid JSON");
  const data = readJSON(join(dir, "data", "measurements.json"));
  if (!data) fails.push("data/measurements.json missing or invalid JSON");

  // regenerate the pipeline so lints run against current data
  let csvTodo = 0;
  for (const script of ["results/consolidate.mjs", "figures/make-figures.mjs"]) {
    if (!existsSync(join(dir, script))) { fails.push(`${script} missing`); continue; }
    const r = spawnSync("node", [script], { cwd: dir, encoding: "utf8" });
    if (r.status !== 0) fails.push(`${script} failed: ${(r.stderr || "").split("\n")[0]}`);
    const m = (r.stdout || "").match(/\((\d+) TODO\)/); // consolidate's own count is authoritative
    if (m) csvTodo = Number(m[1]);
  }

  // ledger lint: every scalar row must inherit a nonempty provenance
  if (data) {
    const missing = [];
    const walk = (obj, prefix, prov) => {
      const here = typeof obj.provenance === "string" && obj.provenance.trim() ? obj.provenance : prov;
      for (const [k, v] of Object.entries(obj)) {
        if (k === "provenance" || k.startsWith("_")) continue;
        const key = prefix ? `${prefix}.${k}` : k;
        if (v && typeof v === "object" && !Array.isArray(v)) walk(v, key, here);
        else if (Array.isArray(v)) v.forEach((it, i) => { if (it && typeof it === "object") walk(it, `${key}[${i}]`, here); else if (!here) missing.push(`${key}[${i}]`); });
        else if (!here) missing.push(key);
      }
    };
    walk(data, "", "");
    if (missing.length) fails.push(`ledger rows with no provenance: ${missing.slice(0, 5).join(", ")}${missing.length > 5 ? ` (+${missing.length - 5})` : ""}`);
  }

  if (tex) {
    // figures referenced in tex must exist in some includable form
    for (const m of tex.matchAll(/\\includegraphics(?:\[[^\]]*\])?\{([^}]+)\}/g)) {
      const name = m[1];
      if (!["pdf", "png", "jpg", "svg"].some((ext) => existsSync(join(dir, "figures", `${name}.${ext}`))) && !existsSync(join(dir, name)))
        fails.push(`\\includegraphics{${name}} has no figures/${name}.(svg|pdf|png)`);
    }
    // every \cite key must exist in refs.bib
    const bib = existsSync(join(dir, "refs.bib")) ? readFileSync(join(dir, "refs.bib"), "utf8") : "";
    const bibKeys = new Set([...bib.matchAll(/^@\w+\{([^,\s]+)\s*,/gm)].map((m) => m[1]));
    const cited = new Set([...tex.matchAll(/\\cite[pt]?\{([^}]+)\}/g)].flatMap((m) => m[1].split(",").map((s) => s.trim())));
    for (const k of cited) if (!bibKeys.has(k)) fails.push(`\\cite{${k}} not in refs.bib`);
    // TODO surface check (csvTodo parsed from consolidate's own summary above)
    const texTodo = (tex.match(/\\todo\{/g) || []).length - 1; // minus the \newcommand definition
    info.push(`TODO: ${csvTodo} ledger-flagged, ${Math.max(texTodo, 0)} \\todo{} in tex`);
    if (csvTodo > 0 && texTodo <= 0) warns.push(`${csvTodo} TODO-flagged ledger rows but no \\todo{} marker in the tex — unsourced numbers may be invisible in the PDF`);
    // staleness
    const pdf = join(dir, "paper.pdf");
    if (!existsSync(pdf)) warns.push("paper.pdf not built");
    else if (statSync(pdf).mtimeMs < statSync(texPath).mtimeMs) warns.push("paper.pdf older than paper.tex — rebuild before committing");
  }

  const result = { ok: fails.length === 0, fails, warns, info };
  if (flag("--json")) console.log(JSON.stringify(result, null, 2));
  else {
    for (const f of fails) console.log(`  FAIL ${f}`);
    for (const w of warns) console.log(`  warn ${w}`);
    for (const i of info) console.log(`  info ${i}`);
    console.log(result.ok ? `essaymaster check: OK (${warns.length} warning(s))` : `essaymaster check: FAILED (${fails.length})`);
  }
  process.exit(result.ok ? 0 : 1);
}

// ── sync-done ────────────────────────────────────────────────────────────────
function cmdSyncDone() {
  const root = repoRoot();
  const dir = paperDirArg(root);
  const syncPath = join(dir, "SYNC.json");
  const sync = readJSON(syncPath);
  if (!sync) { console.error("essaymaster: SYNC.json missing/invalid"); process.exit(1); }
  const texPath = join(dir, "paper.tex"), pdfPath = join(dir, "paper.pdf");
  if (!flag("--force") && existsSync(texPath) && (!existsSync(pdfPath) || statSync(pdfPath).mtimeMs < statSync(texPath).mtimeMs)) {
    console.error("essaymaster: paper.tex is newer than paper.pdf — run ./build.sh first (or --force).");
    process.exit(1);
  }
  const target = opt("--commit") ? git(["rev-parse", opt("--commit")], root) : git(["rev-parse", "HEAD"], root);
  sync.lastSyncedCommit = target;
  writeFileSync(syncPath, JSON.stringify(sync, null, 2) + "\n");
  console.log(`essaymaster: sync pointer -> ${target.slice(0, 7)}. Commit SYNC.json with your 'paper:' sync commit.`);
}

// ── bundle ───────────────────────────────────────────────────────────────────
function cmdBundle() {
  const root = repoRoot();
  const dir = paperDirArg(root);
  const have = (c) => spawnSync(c, ["--version"], { encoding: "utf8" }).status === 0;
  let built = false;
  if (have("latexmk")) built = spawnSync("latexmk", ["-pdf", "-bibtex", "-interaction=nonstopmode", "paper.tex"], { cwd: dir, stdio: "ignore" }).status === 0;
  else if (have("tectonic")) built = spawnSync("tectonic", ["--keep-intermediates", "paper.tex"], { cwd: dir, stdio: "ignore" }).status === 0;
  if (!built) { console.error("essaymaster: bundle needs latexmk or tectonic (tectonic run with --keep-intermediates to produce the .bbl)"); process.exit(1); }
  const out = join(dir, "arxiv-bundle");
  mkdirSync(join(out, "figures"), { recursive: true });
  const copied = [];
  for (const f of readdirSync(dir)) if (f === "paper.tex" || f === "refs.bib" || f === "paper.bbl" || f.endsWith(".sty")) { cpSync(join(dir, f), join(out, f)); copied.push(f); }
  for (const f of existsSync(join(dir, "figures")) ? readdirSync(join(dir, "figures")) : []) if (/\.(pdf|png|jpg)$/.test(f)) { cpSync(join(dir, "figures", f), join(out, "figures", f)); copied.push(`figures/${f}`); }
  const problems = [];
  if (!copied.includes("paper.bbl")) problems.push("paper.bbl MISSING — arXiv needs the shipped .bbl (build with latexmk, or tectonic --keep-intermediates)");
  if (!copied.some((f) => f.startsWith("figures/"))) problems.push("no converted figures in bundle");
  console.log(`essaymaster bundle: ${out}\n  ${copied.join("\n  ")}`);
  for (const p of problems) console.log(`  PROBLEM: ${p}`);
  console.log(problems.length ? "essaymaster bundle: INCOMPLETE" : "essaymaster bundle: OK — upload the directory contents; review arXiv's rebuilt PDF before finalizing. Disclosure gate: confirm the owner has cleared this paper for public release.");
  process.exit(problems.length ? 1 : 0);
}

// ── hooks ────────────────────────────────────────────────────────────────────
function cmdHooks(rootMaybe) {
  const root = rootMaybe || repoRoot();
  const r = spawnSync("bash", [join(PKG, "scripts", "install-git-hook.sh"), root], { encoding: "utf8" });
  process.stdout.write(r.stdout || ""); process.stderr.write(r.stderr || "");
  if (r.status !== 0 && !rootMaybe) process.exit(1);
}

const cmd = process.argv[2];
const commands = { drift: cmdDrift, init: cmdInit, migrate: cmdMigrate, check: cmdCheck, "sync-done": cmdSyncDone, bundle: cmdBundle, hooks: () => (argvRest[0] === "install" ? cmdHooks() : (console.error("usage: essaymaster hooks install"), process.exit(1))) };
if (!commands[cmd]) {
  console.log("essaymaster <drift|init|migrate|check|sync-done|bundle|hooks> — see file header for usage");
  process.exit(cmd ? 1 : 0);
}
commands[cmd]();
