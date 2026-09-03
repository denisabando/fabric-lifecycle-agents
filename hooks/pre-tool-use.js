#!/usr/bin/env node
// PreToolUse guardrails. Exit 2 = block the call; the message on stderr goes back to the agent.
// Every block is also recorded in the audit trail (event "Blocked").
"use strict";
const path = require("path");
const { readStdinJson, norm, clientRoot, appendAudit, nowIso, todayCompact } = require("../scripts/lib.js");

const input = readStdinJson();
const tool = input.tool_name || "";
const ti = input.tool_input || {};
const filePath = norm(ti.file_path || ti.path || ti.notebook_path || "");
const command = norm(ti.command || "");
const argsText = norm(JSON.stringify(ti));

function block(reason) {
  const root = clientRoot(filePath) || path.join(process.env.CLAUDE_PROJECT_DIR || process.cwd(), "audit-unassigned");
  const rec = { ts: nowIso(), event: "Blocked", session: input.session_id || "", tool, reason };
  if (filePath) rec.path = filePath; if (command) rec.command = command.slice(0, 300);
  try { appendAudit(root, rec); } catch {}
  process.stderr.write(reason + "\n"); process.exit(2);
}

// 00. the audit trail is append-only; only hooks write the .jsonl logs
if (/\/audit\/[^"]*\.jsonl/.test(filePath) ||
    (tool === "Bash" && /\/audit\/[^" ]*\.jsonl[^"]*(>|>>|rm |del |mv |move |sed -i|tee|truncate|Set-Content|Add-Content|Out-File)|(>|>>|rm |del |mv |move |sed -i|tee|truncate|Set-Content|Add-Content|Out-File)[^"]*\/audit\/[^" ]*\.jsonl/.test(command)))
  block("BLOCKED: audit/ is the append-only audit trail; only hooks write there.");

// 0. MOD-00 — Modeling MCP is read-only; writes go to TMDL files
if (/^mcp__powerbi-modeling-mcp__/.test(tool) && !/(list|get|read|query|validate|analy|export|serialize|describe|connect|status|info)/i.test(tool))
  block(`BLOCKED (MOD-00): '${tool}' would write to a live model. Edit the TMDL files in the PBIP definition folder and commit instead; MCP is read-only on engagements.`);

// 0b. RPT-00 — reports are PBIR in git: never write .pbix/.pbit or localSettings
if (/\.(pbix|pbit)$/i.test(filePath) || /\.pbi\/localSettings\.json/i.test(argsText))
  block("BLOCKED (RPT-00): reports are authored as PBIR files in git; .pbix/.pbit and localSettings.json are never written or committed.");

// 1. vendor/ is read-only
if (/(^|\/)vendor\//.test(filePath))
  block("BLOCKED: vendor/ is Microsoft's skill, pinned and read-only. Put firm changes in skills/<domain>/SKILL.md and log overrides in its §3 table.");
if (tool === "Bash" && /(>|>>|sed -i|tee|rm |del |mv |move |cp |copy |Set-Content|Out-File)[^"]*vendor\//.test(command))
  block("BLOCKED: shell write into vendor/ (read-only submodule).");

// 2. prod deployments need today's confirmation token
if (/updateDefinition|deploymentPipelines\/.*\/deploy|--target[ =]prod|prod_workspace/i.test(argsText)) {
  const token = new RegExp(`DEPLOY-PROD-[a-z0-9-]+-${todayCompact()}`);
  if (!token.test(argsText))
    block(`BLOCKED: this looks like a production deployment. Ask the consultant to re-issue the request including today's token DEPLOY-PROD-<client>-${todayCompact()} after reading the review report.`);
}
process.exit(0);
