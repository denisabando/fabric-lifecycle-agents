#!/usr/bin/env node
// PreToolUse guardrails. Exit 2 = block the call; the message on stderr goes back to the agent.
// Every block is also recorded in the audit trail (event "Blocked").
"use strict";
const path = require("path");
const { readStdinJson, norm, clientRoot, appendAudit, nowIso, todayCompact, protectedBranches, currentBranch } = require("../scripts/lib.js");

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

// 1b. git workflow — never commit to or push a protected branch; never force-push; never push to prod branch
if (tool === "Bash" && /\bgit\s+(commit|push|merge|rebase|reset\s+--hard|branch\s+-[dD])\b/.test(command)) {
  const root = clientRoot(filePath);
  if (root) {
    const prot = protectedBranches(root);
    const cur = currentBranch(root);
    if (/\bgit\s+commit\b/.test(command) && prot.has(cur))
      block(`BLOCKED: you are on protected branch '${cur}'. Create a feature branch (git checkout -b feature/<date>-<slug>) and open a pull request (/pr). Environment branches change only by PR.`);
    if (/\bgit\s+push\b/.test(command)) {
      if (/--force|-f\b|\+[\w\/-]+/.test(command)) block("BLOCKED: force-push is never allowed on an engagement repo.");
      for (const b of prot) if (new RegExp(`\\bgit\\s+push\\b[^\\n]*\\b(origin\\s+)?${b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\s|:|$)`).test(command) || (prot.has(cur) && !/\s\S+\s+\S+/.test(command.replace(/^.*git\s+push/, ""))))
        block(`BLOCKED: pushing to protected branch '${b}' directly. Push your feature branch and open a pull request (/pr).`);
    }
    if (/\bgit\s+(merge|rebase)\b/.test(command) && prot.has(cur))
      block(`BLOCKED: merging into protected branch '${cur}' locally. Merges into environment branches happen through an approved pull request on GitHub.`);
  }
}

// 2. prod deployments need today's confirmation token (non-git deployment methods only)
if (/updateDefinition|deploymentPipelines\/.*\/deploy|--target[ =]prod|prod_workspace/i.test(argsText)) {
  const token = new RegExp(`DEPLOY-PROD-[a-z0-9-]+-${todayCompact()}`);
  if (!token.test(argsText))
    block(`BLOCKED: this looks like a production deployment. Ask the consultant to re-issue the request including today's token DEPLOY-PROD-<client>-${todayCompact()} after reading the review report.`);
}
process.exit(0);
