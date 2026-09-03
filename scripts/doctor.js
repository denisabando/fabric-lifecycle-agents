#!/usr/bin/env node
// Is this machine ready to run the plugin? One line per prerequisite, pass/fail, with the fix.
//   usage: node scripts/doctor.js        exit 1 if a REQUIRED item fails
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const win = process.platform === "win32";
const rows = [];
function run(cmd, args = []) {
  const r = spawnSync(cmd, args, { encoding: "utf8", shell: win, timeout: 15000 });
  return { ok: r.status === 0, out: ((r.stdout || "") + (r.stderr || "")).trim() };
}
const first = (s) => (s || "").split(/\r?\n/)[0].slice(0, 70);
function check(name, required, fn, fix) {
  let res; try { res = fn(); } catch (e) { res = { ok: false, note: e.message }; }
  rows.push({ name, required, ok: !!res.ok, note: res.note || "", fix });
}

// --- runtime
check("git", true, () => { const r = run("git", ["--version"]); return { ok: r.ok, note: first(r.out) }; }, "install Git for Windows / Xcode CLT");
check("node >= 20", true, () => { const v = process.versions.node; return { ok: +v.split(".")[0] >= 20, note: "v" + v }; }, "install Node.js 20+ (Claude Code needs it anyway)");
check("Claude Code CLI", true, () => { const r = run("claude", ["--version"]); return { ok: r.ok, note: first(r.out) }; }, "npm i -g @anthropic-ai/claude-code, or install the VS Code extension");

// --- repo state
check("vendor/skills-for-fabric populated", true, () => {
  const p = path.join(ROOT, "vendor/skills-for-fabric/plugins/powerbi-authoring/skills/semantic-model-authoring/SKILL.md");
  return { ok: fs.existsSync(p), note: fs.existsSync(p) ? "submodule present" : "empty — submodule not initialised" };
}, "git submodule update --init");
check("static evals pass", true, () => { const r = spawnSync(process.execPath, [path.join(ROOT, "evals/run.js")], { encoding: "utf8" }); return { ok: r.status === 0, note: r.status === 0 ? "node evals/run.js ok" : "node evals/run.js failed — run it to see why" }; }, "fix whatever evals/run.js reports before going further");
check("plugin installed in Claude Code", false, () => {
  const home = os.homedir();
  const cands = [path.join(home, ".claude", "plugins"), path.join(home, ".claude", "plugins", "marketplaces")];
  const hit = cands.some((d) => fs.existsSync(d) && JSON.stringify(fs.readdirSync(d)).includes("fabric"));
  const settings = path.join(home, ".claude", "settings.json");
  const inSettings = fs.existsSync(settings) && /fabric-lifecycle-agents/.test(fs.readFileSync(settings, "utf8"));
  return { ok: hit || inSettings, note: hit || inSettings ? "found under ~/.claude" : "not found — cannot confirm from outside Claude Code; check with /plugin" };
}, "/plugin marketplace add .  then  /plugin install fabric-lifecycle-agents@fabric-agents");

// --- Fabric / GitHub access
check("Azure CLI (az)", true, () => { const r = run("az", ["version", "-o", "tsv"]); return { ok: r.ok, note: r.ok ? "installed" : "" }; }, "install Azure CLI (winget install Microsoft.AzureCLI / brew install azure-cli)");
check("az logged in", true, () => { const r = run("az", ["account", "show", "--query", "[user.name,tenantId]", "-o", "tsv"]); return { ok: r.ok, note: r.ok ? first(r.out).replace(/\s+/g, " · ") : "not logged in" }; }, "az login --tenant <your-test-tenant>.onmicrosoft.com");
check("GitHub CLI (gh)", true, () => { const r = run("gh", ["--version"]); return { ok: r.ok, note: first(r.out) }; }, "install GitHub CLI (winget install GitHub.cli / brew install gh)");
check("gh logged in", true, () => { const r = run("gh", ["auth", "status"]); return { ok: r.ok, note: r.ok ? (r.out.match(/Logged in to [^\n]*/) || ["ok"])[0].slice(0, 70) : "not logged in" }; }, "gh auth login");

// --- Power BI tooling (optional but recommended)
check("Power BI Desktop", false, () => {
  if (!win) return { ok: false, note: "Windows only" };
  const paths = [process.env["ProgramFiles"] + "\\Microsoft Power BI Desktop\\bin\\PBIDesktop.exe", process.env["LOCALAPPDATA"] + "\\Microsoft\\WindowsApps\\PBIDesktop.exe"];
  const hit = paths.find((p) => fs.existsSync(p));
  return { ok: !!hit, note: hit ? hit : "not found in the usual places (Store install may still be fine)" };
}, "install Power BI Desktop; enable PBIP/TMDL/PBIR preview features");
check("Tabular Editor CLI", false, () => { const r = run(win ? "where" : "which", ["TabularEditor.exe"]); return { ok: r.ok, note: r.ok ? first(r.out) : "not on PATH — BPA step will be skipped" }; }, "install Tabular Editor 2 and add its folder to PATH");
check("powerbi-report-author", false, () => { const r = run("powerbi-report-author", ["--version"]); return { ok: r.ok, note: r.ok ? first(r.out) : "not on PATH — PBIR validate will be skipped" }; }, "npm i -g @microsoft/powerbi-report-author");

// --- engagement config
check("engagement.yaml placeholders filled", false, () => {
  const f = path.join(ROOT, "clients/acme-demo/engagement.yaml");
  const t = fs.readFileSync(f, "utf8"); const left = (t.match(/<[A-Za-z][^>\n]*>/g) || []).filter((x) => !/^<code>$/.test(x));
  return { ok: left.length === 0, note: left.length ? "still has: " + left.slice(0, 3).join(", ") : "tenant + dev workspace set" };
}, "edit clients/acme-demo/engagement.yaml: tenant and the dev workspace name");

// --- print
const w = Math.max(...rows.map((r) => r.name.length)) + 2;
console.log(`doctor — ${os.platform()} ${os.release()} · ${ROOT}\n`);
let failReq = 0;
for (const r of rows) {
  const mark = r.ok ? "PASS" : r.required ? "FAIL" : "warn";
  if (!r.ok && r.required) failReq++;
  console.log(`${mark}  ${r.name.padEnd(w)}${r.note}${!r.ok ? `\n      fix: ${r.fix}` : ""}`);
}
console.log(`\n${failReq ? `${failReq} required item(s) failing — fix those first.` : "All required items pass. Follow docs/first-run-windows.md from step 4."}`);
process.exit(failReq ? 1 : 0);
