#!/usr/bin/env node
// Trail check: every commit that touches <client-root>/models/ must be attributable —
//   (a) carry `Decision:` and `Agent-Session:` trailers, and
//   (b) the decision record named by `Decision:` must exist at that commit.
// Commits that fail are "unattributed changes": typically edits made in the Fabric service and
// committed from the workspace UI, bypassing hooks, review and decision records (MOD-00 / RPT-00).
//   usage: node check-trail.js <client-root> [--since <ref>] [--report-only]
//   exit 1 when unattributed commits exist (unless --report-only)
"use strict";
const path = require("path");
const { execSync } = require("child_process");
const { norm, readYamlLite } = require("./lib.js");

const args = process.argv.slice(2);
const root = path.resolve(args[0]);
const since = args.includes("--since") ? args[args.indexOf("--since") + 1] : null;
const reportOnly = args.includes("--report-only");
const g = (a, cwd = root) => { try { return execSync("git " + a, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }); } catch { return ""; } };

const top = g("rev-parse --show-toplevel").trim(); if (!top) { console.log("[trail] not a git repo"); process.exit(0); }
const rel = norm(path.relative(top, root)) || ".";
const cfg = readYamlLite(path.join(root, "engagement.yaml"));
const allowed = new Set(((cfg.git || {}).attributed_authors || []).map(String));   // e.g. CI bots
const range = since ? `${since}..HEAD` : "-n 200";
const SEP = "";
// records end with \x1e, fields split on \x1f; trailer values may contain newlines, so strip them per field
const log = g(`log ${range} --format="%H%x1f%an%x1f%ae%x1f%ad%x1f%s%x1f%(trailers:key=Decision,valueonly)%x1f%(trailers:key=Agent-Session,valueonly)%x1e" --date=short -- "${rel}/models"`, top);
const findings = []; let checked = 0;
for (const recTxt of log.split("\x1e").map((r) => r.trim()).filter(Boolean)) {
  const [sha, name, email, date, subject, decision, session] = recTxt.split("\x1f").map((s) => (s || "").replace(/\s+/g, " ").trim());
  checked++;
  if (allowed.has(email)) continue;
  const files = g(`show --name-only --format= ${sha} -- "${rel}/models"`, top).trim().split(/\r?\n/).filter(Boolean);
  const problems = [];
  if (!decision) problems.push("no Decision: trailer");
  if (!session) problems.push("no Agent-Session: trailer");
  if (decision) {
    const decPath = norm(path.join(rel, decision)).replace(/^\.\//, "");
    const exists = g(`cat-file -e ${sha}:"${decPath}" && echo ok`, top).trim() === "ok";
    if (!exists) problems.push(`decision record ${decision} not present at ${sha.slice(0, 7)}`);
  }
  if (problems.length) findings.push({ sha: sha.slice(0, 7), date, name, email, subject, files, problems });
}
for (const f of findings) {
  console.log(`[trail] UNATTRIBUTED ${f.sha} ${f.date} ${f.name} <${f.email}> — "${f.subject}"`);
  console.log(`        files: ${f.files.map((x) => x.replace(rel + "/", "")).join(", ")}`);
  console.log(`        ${f.problems.join("; ")}`);
}
console.log(`[trail] ${checked} commit(s) touching models/ checked, ${findings.length} unattributed${since ? ` (since ${since})` : ""}`);
if (findings.length) console.log("[trail] An unattributed commit usually means a change was made in the Fabric service and committed from the workspace, bypassing the agent, hooks and review (MOD-00 / RPT-00). Re-review before it reaches a higher environment.");
process.exit(findings.length && !reportOnly ? 1 : 0);
