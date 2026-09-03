#!/usr/bin/env node
// Mechanical audit trail: one JSON line per event in <client-root>/audit/<date>.jsonl.
// Registered on UserPromptSubmit, PreToolUse, PostToolUse, SubagentStart, SubagentStop, Stop.
// Metadata only — never file contents, tool output bodies or query results.
//   usage: node audit.js <EventName>   (event JSON on stdin)
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { readStdinJson, norm, clientRoot, readYamlLite, appendAudit, nowIso, git, PROJECT_DIR } = require("../scripts/lib.js");

const event = process.argv[2] || "unknown";
const d = readStdinJson();
const tool = d.tool_name || "";
const ti = d.tool_input || {};
const READ_ONLY = new Set(["Read", "Glob", "Grep", "LS", "TodoWrite", "TodoRead", "WebFetch", "WebSearch"]);
const filePath = norm(ti.file_path || ti.path || ti.notebook_path || "");
const root = clientRoot(filePath) || path.join(PROJECT_DIR, "audit-unassigned");
const cfg = (readYamlLite(path.join(root, "engagement.yaml")).audit) || {};

if ((event === "PreToolUse" || event === "PostToolUse") && READ_ONLY.has(tool) && !cfg.include_reads) process.exit(0);
const trunc = (s, n = 300) => { s = String(s || ""); return s.length <= n ? s : s.slice(0, n) + `…(+${s.length - n})`; };

const rec = { ts: nowIso(), event, session: d.session_id || "", cwd: norm(d.cwd || "") };
if (event === "UserPromptSubmit") rec.prompt = trunc(d.prompt, 500);
else if (event === "PreToolUse" || event === "PostToolUse") {
  rec.tool = tool;
  if (filePath) rec.path = norm(path.isAbsolute(filePath) && filePath.startsWith(norm(root)) ? path.relative(root, filePath) : filePath);
  if (ti.command) rec.command = trunc(ti.command);
  if (ti.pattern) rec.pattern = trunc(ti.pattern, 120);
  if (tool.startsWith("mcp__")) { const a = { ...ti }; delete a.expression; delete a.content; rec.mcp_args = trunc(JSON.stringify(a)); }
  if (event === "PostToolUse") {
    if (filePath && fs.existsSync(filePath) && fs.statSync(filePath).isFile())
      rec.sha256 = crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex").slice(0, 16);
    const r = d.tool_response;
    rec.result = (r && typeof r === "object" && r.is_error) || (typeof r === "string" && /^error/i.test(r)) ? "error" : "ok";
  }
} else if (event === "SubagentStart" || event === "SubagentStop") rec.agent = d.agent_name || d.subagent_type || d.agent_type || "";
else if (event === "Stop") {
  rec.transcript = norm(d.transcript_path || "");
  const st = git(`status --porcelain -- "${root}"`, root); rec.uncommitted_changes = st ? st.split(/\r?\n/).length : 0;
}
appendAudit(root, rec);
process.exit(0);
