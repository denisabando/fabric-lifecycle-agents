#!/usr/bin/env node
// Static evals (run anywhere) + scenario evals (when the claude CLI is available).
//   usage: node evals/run.js        exit 1 on any failure
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { onPath, walk } = require("../scripts/lib.js");

const ROOT = path.resolve(__dirname, "..");
const node = process.execPath;
let fail = 0;
const say = (s) => console.log(s);
const run = (args, opts = {}) => spawnSync(node, args, { encoding: "utf8", ...opts });
const hookRun = (script, input, env, argv = []) => spawnSync(node, [path.join(ROOT, "hooks", script), ...argv], { input: JSON.stringify(input), encoding: "utf8", env: { ...process.env, ...env } });
const tmpClient = () => { const t = fs.mkdtempSync(path.join(os.tmpdir(), "fla-")); fs.copyFileSync(path.join(ROOT, "clients/acme-demo/engagement.yaml"), path.join(t, "engagement.yaml")); return t; };
const readAudit = (t) => { const d = path.join(t, "audit"); return fs.existsSync(d) ? fs.readdirSync(d).filter((n) => n.endsWith(".jsonl")).flatMap((n) => fs.readFileSync(path.join(d, n), "utf8").trim().split(/\r?\n/).filter(Boolean)) : []; };
const naming = path.join(ROOT, "skills/semantic-model/naming.yaml");
const model = path.join(ROOT, "clients/acme-demo/models/Sales.SemanticModel");
const report = path.join(ROOT, "clients/acme-demo/models/Sales Performance.Report");

say("== static: demo model must be clean");
for (const f of walk(path.join(model, "definition/tables"), (p) => p.endsWith(".tmdl")).sort()) { const r = run([path.join(ROOT, "scripts/lint-tmdl.js"), f, naming]); process.stdout.write(r.stdout); if (r.status) fail = 1; }

say("== static: bad fixture must fail");
{ const r = run([path.join(ROOT, "scripts/lint-tmdl.js"), path.join(ROOT, "evals/fixtures/bad-model/definition/tables/dbo_FactSales.tmdl"), naming]); process.stdout.write(r.stdout); say(r.status ? "(expected failure — ok)" : "EXPECTED FAILURE DID NOT HAPPEN"); if (!r.status) fail = 1; }

say("== static: report binding test (demo report must pass, bad fixture must fail)");
{ const r = run([path.join(ROOT, "scripts/check-report-bindings.js"), report, model]); process.stdout.write(r.stdout); if (r.status) fail = 1;
  const b = run([path.join(ROOT, "scripts/check-report-bindings.js"), path.join(ROOT, "evals/fixtures/bad-report"), model]); process.stdout.write(b.stdout); say(b.status ? "(expected failure — ok)" : "EXPECTED FAILURE DID NOT HAPPEN"); if (!b.status) fail = 1; }
{ const head = spawnSync("git", ["rev-parse", "HEAD"], { cwd: ROOT, encoding: "utf8" }).stdout.trim();
  if (head) { say("== static: same check pinned to HEAD (exercises the --at path)"); const r = run([path.join(ROOT, "scripts/check-report-bindings.js"), report, model, "--at", head]); process.stdout.write(r.stdout); if (r.status) fail = 1; } }

say("== static: audit hook smoke test (temp client root)");
{ const t = tmpClient(); const env = { FLA_CLIENT_ROOT: t };
  hookRun("audit.js", { session_id: "t", tool_name: "Edit", tool_input: { file_path: path.join(t, "models/x.tmdl") } }, env, ["PreToolUse"]);
  hookRun("audit.js", { session_id: "t", tool_name: "Read", tool_input: { file_path: path.join(t, "models/x.tmdl") } }, env, ["PreToolUse"]);
  const blk = hookRun("pre-tool-use.js", { session_id: "t", tool_name: "Write", tool_input: { file_path: path.join(t, "audit/2020-01-01.jsonl") } }, env);
  if (blk.status !== 2) { say("audit dir was writable — FAIL"); fail = 1; }
  const mcp = hookRun("pre-tool-use.js", { session_id: "t", tool_name: "mcp__powerbi-modeling-mcp__measure_create", tool_input: {} }, env);
  if (mcp.status !== 2) { say("MCP write was allowed — FAIL"); fail = 1; }
  const ok = hookRun("pre-tool-use.js", { session_id: "t", tool_name: "Edit", tool_input: { file_path: path.join(t, "models/x.tmdl") } }, env);
  if (ok.status !== 0) { say("plain TMDL edit was blocked — FAIL"); fail = 1; }
  const win = hookRun("pre-tool-use.js", { session_id: "t", tool_name: "Write", tool_input: { file_path: "C:\\work\\repo\\vendor\\skills-for-fabric\\x.md" } }, env);
  if (win.status !== 2) { say("Windows-style vendor path was not blocked — FAIL"); fail = 1; }
  const n = readAudit(t).length;
  say(n === 4 ? "audit: 4 lines (Edit logged, Read skipped, 3 blocks logged)" : `audit: expected 4 lines, got ${n}`); if (n !== 4) fail = 1;
  fs.rmSync(t, { recursive: true, force: true }); }

say("== static: usage hook smoke test (synthetic transcript)");
{ const t = tmpClient(); const env = { FLA_CLIENT_ROOT: t }; const tr = path.join(t, "transcript.jsonl");
  fs.writeFileSync(tr, [
    { type: "user", message: { role: "user", content: "hi" } },
    { type: "assistant", message: { id: "m1", model: "claude-fable-5-1", usage: { input_tokens: 1000, output_tokens: 200, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 } } },
    { type: "assistant", message: { id: "m1", model: "claude-fable-5-1", usage: { input_tokens: 1000, output_tokens: 200, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 } } },
    { type: "assistant", message: { id: "m2", model: "claude-fable-5-1", usage: { input_tokens: 500, output_tokens: 100, cache_creation_input_tokens: 2000, cache_read_input_tokens: 4000 } } },
  ].map((x) => JSON.stringify(x)).join("\n") + "\n");
  hookRun("usage.js", { session_id: "u1", transcript_path: tr }, env); hookRun("usage.js", { session_id: "u1", transcript_path: tr }, env);
  const u = readAudit(t).map((l) => JSON.parse(l)).filter((e) => e.event === "Usage");
  const okU = u.length === 1 && u[0].turn_cost_usd === 0.056;   // 1500@10 + 300@50 + 2000@12.5 + 4000@0.25
  say(okU ? "usage: 1 line, dedup ok, cost 0.056 ok" : `usage: got ${u.length} line(s), cost ${u[0] && u[0].turn_cost_usd} (want 1, 0.056)`); if (!okU) fail = 1;
  const rep = run([path.join(ROOT, "scripts/usage-report.js"), t, "--by", "model"]); process.stdout.write(rep.stdout.split(/\r?\n/).slice(-3).join("\n") + "\n");
  fs.rmSync(t, { recursive: true, force: true }); }

say("== scenarios");
if (onPath("claude") && process.env.ANTHROPIC_API_KEY) {
  fs.mkdirSync(path.join(ROOT, "evals/out"), { recursive: true });
  for (const s of fs.readdirSync(path.join(ROOT, "evals/scenarios")).filter((n) => n.endsWith(".md")).sort()) {
    const txt = fs.readFileSync(path.join(ROOT, "evals/scenarios", s), "utf8");
    if (/local-only/.test(txt)) { say(`skip (local-only): ${s}`); continue; }
    const prompt = (txt.split("## Prompt")[1] || "").split("## Assertions")[0].trim();
    say(`--- ${s}`);
    const r = spawnSync("claude", ["-p", prompt, "--plugin-dir", ROOT], { encoding: "utf8" });
    fs.writeFileSync(path.join(ROOT, "evals/out", s.replace(/\.md$/, ".log")), (r.stdout || "") + (r.stderr || ""));
    if (r.status) fail = 1;
    // grader not wired: read the log + assertions, or feed both to a second `claude -p` for PASS/FAIL
  }
} else say("scenario runner not available (needs 'claude' CLI + ANTHROPIC_API_KEY) — skipped");
process.exit(fail);
