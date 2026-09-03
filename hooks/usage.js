#!/usr/bin/env node
// Token + cost trail (Stop). Sums per-message usage from the session transcript, prices the delta
// since the last Stop with hooks/pricing.yaml, appends one "Usage" line. Estimates; main session only.
"use strict";
const fs = require("fs");
const path = require("path");
const { readStdinJson, clientRoot, readYamlLite, appendAudit, nowIso, PROJECT_DIR } = require("../scripts/lib.js");

const d = readStdinJson();
const tp = d.transcript_path || "";
const session = d.session_id || "unknown";
if (!tp || !fs.existsSync(tp)) process.exit(0);
const root = clientRoot() || path.join(PROJECT_DIR, "audit-unassigned");

const pricing = readYamlLite(path.join(__dirname, "pricing.yaml"));
const models = pricing.models || {}; const def = pricing.default; const checked = pricing.checked || "";
const price = (m) => { for (const k of Object.keys(models)) if (m.startsWith(k)) return [models[k], k]; return [def, "default"]; };
const KEYS = ["input", "output", "cache_write", "cache_read"];
const cost = (t, p) => KEYS.reduce((s, k) => s + (t[k] || 0) * (p[k] || 0) / 1e6, 0);

const seen = new Map();   // message id -> [model, usage]; last streamed chunk wins
for (const line of fs.readFileSync(tp, "utf8").split(/\r?\n/)) {
  let e; try { e = JSON.parse(line); } catch { continue; }
  const msg = e && e.type === "assistant" && e.message && typeof e.message === "object" ? e.message : null;
  if (!msg || !msg.usage) continue;
  seen.set(msg.id || e.uuid || String(seen.size), [msg.model || "unknown", msg.usage]);
}
const totals = {};
for (const [model, u] of seen.values()) {
  const t = totals[model] || (totals[model] = { input: 0, output: 0, cache_write: 0, cache_read: 0 });
  t.input += u.input_tokens | 0; t.output += u.output_tokens | 0;
  t.cache_write += u.cache_creation_input_tokens | 0; t.cache_read += u.cache_read_input_tokens | 0;
}
const stateDir = path.join(root, "audit", "state"); fs.mkdirSync(stateDir, { recursive: true });
const sp = path.join(stateDir, session.replace(/[^\w.-]/g, "_") + ".json");
const prev = fs.existsSync(sp) ? JSON.parse(fs.readFileSync(sp, "utf8")) : {};
const turn = {}; let turnCost = 0, cumCost = 0; const pricedAs = new Set();
for (const [model, t] of Object.entries(totals)) {
  const [p, key] = price(model); pricedAs.add(key);
  const pt = prev[model] || {}; const delta = {}; let any = false;
  for (const k of KEYS) { delta[k] = t[k] - (pt[k] || 0); if (delta[k]) any = true; }
  if (any) turn[model] = delta;
  turnCost += cost(delta, p); cumCost += cost(t, p);
}
fs.writeFileSync(sp, JSON.stringify(totals));
if (!Object.keys(turn).length) process.exit(0);
appendAudit(root, { ts: nowIso(), event: "Usage", session, turn_tokens: turn, turn_cost_usd: +turnCost.toFixed(4),
  session_tokens: totals, session_cost_usd: +cumCost.toFixed(4), pricing_checked: checked, priced_as: [...pricedAs].sort(),
  note: "estimate; main session only, subagents excluded" });
process.exit(0);
