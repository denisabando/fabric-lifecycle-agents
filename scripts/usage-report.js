#!/usr/bin/env node
// Aggregate Usage events from <client-root>/audit/*.jsonl.
//   usage: node usage-report.js <client-root> [--by session|day|model|skill]
//   --by skill joins sessions to decisions/<skill>/*.md via the `session:` frontmatter line.
"use strict";
const fs = require("fs");
const path = require("path");
const { walk } = require("./lib.js");

const root = process.argv[2]; const by = process.argv.includes("--by") ? process.argv[process.argv.indexOf("--by") + 1] : "session";
const events = [];
const adir = path.join(root, "audit");
for (const f of (fs.existsSync(adir) ? fs.readdirSync(adir) : []).filter((n) => n.endsWith(".jsonl")).sort())
  for (const line of fs.readFileSync(path.join(adir, f), "utf8").split(/\r?\n/)) { try { const e = JSON.parse(line); e._day = f.slice(0, -6); events.push(e); } catch {} }
const usage = events.filter((e) => e.event === "Usage");
if (!usage.length) { console.log("no Usage events"); process.exit(0); }
const sessSkill = {};
for (const f of walk(path.join(root, "decisions"), (p) => p.endsWith(".md"))) {
  const m = fs.readFileSync(f, "utf8").match(/^session:\s*(\S+)/m);
  if (m) (sessSkill[m[1]] = sessSkill[m[1]] || new Set()).add(path.basename(path.dirname(f)));
}
const KEYS = ["input", "output", "cache_write", "cache_read"];
const agg = {}; const row = () => ({ turns: 0, input: 0, output: 0, cache_write: 0, cache_read: 0, cost: 0 });
for (const e of usage) {
  const keys = { session: [e.session || ""], day: [e._day], model: Object.keys(e.turn_tokens || {}).length ? Object.keys(e.turn_tokens) : ["?"],
    skill: [...(sessSkill[e.session] || new Set(["(no decision record)"]))].sort() }[by];
  for (const k of keys) {
    const a = agg[k] || (agg[k] = row()); a.turns++; a.cost += e.turn_cost_usd || 0;
    for (const [model, t] of Object.entries(e.turn_tokens || {})) { if (by === "model" && model !== k) continue; for (const kk of KEYS) a[kk] += t[kk] || 0; }
  }
}
const w = Math.max(...Object.keys(agg).map((k) => k.length)) + 2;
const pad = (s, n, r) => (r ? String(s).padStart(n) : String(s).padEnd(n));
console.log(pad(by, w) + pad("turns", 6, 1) + pad("input", 10, 1) + pad("output", 9, 1) + pad("cache_w", 9, 1) + pad("cache_r", 10, 1) + pad("cost $", 9, 1));
const tot = row();
for (const k of Object.keys(agg).sort()) { const a = agg[k]; console.log(pad(k, w) + pad(a.turns, 6, 1) + pad(a.input, 10, 1) + pad(a.output, 9, 1) + pad(a.cache_write, 9, 1) + pad(a.cache_read, 10, 1) + pad(a.cost.toFixed(2), 9, 1)); for (const kk of Object.keys(tot)) tot[kk] += a[kk]; }
console.log(pad("TOTAL", w) + pad(tot.turns, 6, 1) + pad(tot.input, 10, 1) + pad(tot.output, 9, 1) + pad(tot.cache_write, 9, 1) + pad(tot.cache_read, 10, 1) + pad(tot.cost.toFixed(2), 9, 1));
console.log(`\npricing table checked: ${[...new Set(usage.map((e) => e.pricing_checked || "?"))].sort().join(", ")}  (estimates; subagent turns not included)`);
