#!/usr/bin/env node
// RPT-01 boundary test: every Column/Measure reference in a PBIR report must resolve to a VISIBLE
// object in the model's TMDL — at the reviewed commit when --at <sha> is given.
//   usage: node check-report-bindings.js <Report>.Report <Model>.SemanticModel [--at <sha>]
"use strict";
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { walk, norm } = require("./lib.js");

const args = process.argv.slice(2);
const rep = args[0], model = args[1];
const at = args.includes("--at") ? args[args.indexOf("--at") + 1] : null;

function tmdlFiles() {
  const tables = path.join(model, "definition", "tables");
  if (!at) return fs.readdirSync(tables).filter((n) => n.endsWith(".tmdl")).sort().map((n) => fs.readFileSync(path.join(tables, n), "utf8"));
  const top = execSync("git rev-parse --show-toplevel", { cwd: model, encoding: "utf8" }).trim();
  const rel = norm(path.relative(top, path.resolve(tables)));
  const names = execSync(`git ls-tree --name-only ${at} "${rel}/"`, { cwd: top, encoding: "utf8" }).split(/\r?\n/).filter((n) => n.endsWith(".tmdl"));
  return names.map((n) => execSync(`git show ${at}:"${n}"`, { cwd: top, encoding: "utf8" }));
}
const cols = new Set(), meas = new Set();
for (const txt of tmdlFiles()) {
  const tm = txt.match(/^table\s+(?:'([^']+)'|(\S+))/m); const table = tm[1] || tm[2];
  const head = txt.split(/\n\tcolumn|\n\tmeasure/)[0];
  const tableHidden = /^\tisHidden\s*$/m.test(head);
  for (const c of txt.matchAll(/^\tcolumn\s+(?:'([^']+)'|(\S+))([\s\S]*?)(?=^\t(?:column|measure|partition|hierarchy)\b|(?![\s\S]))/gm))
    if (!/isHidden/.test(c[3]) && !tableHidden) cols.add(`${table}|${c[1] || c[2]}`);
  for (const m of txt.matchAll(/^\tmeasure\s+(?:'([^']+)'|([^=\s]+))\s*=([\s\S]*?)(?=^\t(?:column|measure|partition|hierarchy)\b|^\t\/\/\/|(?![\s\S]))/gm))
    if (!/isHidden/.test(m[3])) meas.add(`${table}|${m[1] || m[2]}`);
}
const findings = []; let refs = 0;
function visit(o, where) {
  if (Array.isArray(o)) return o.forEach((v) => visit(v, where));
  if (!o || typeof o !== "object") return;
  for (const [key, set] of [["Column", cols], ["Measure", meas]]) {
    const x = o[key];
    if (x && typeof x === "object" && "Property" in x) {
      const ent = (((x.Expression || {}).SourceRef) || {}).Entity || "?"; refs++;
      if (!set.has(`${ent}|${x.Property}`)) findings.push(`${where}: ${key.toLowerCase()} '${ent}'[${x.Property}] is not a visible object in the model${at ? " at " + at.slice(0, 7) : ""} (RPT-01)`);
    }
  }
  for (const v of Object.values(o)) visit(v, where);
}
for (const f of walk(rep, (p) => p.endsWith(".json") && !/(version|report|pages)\.json$/.test(p)).sort()) {
  const where = norm(path.relative(rep, f)); let data;
  try { data = JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { findings.push(`${where}: invalid JSON (${e.message})`); continue; }
  visit(data, where);
  if (f.endsWith("visual.json") && ((data.visual || {}).measures || data.reportMeasures)) findings.push(`${where}: report-level measure defined (RPT-02)`);
}
for (const x of findings) console.log("[bindings] " + x);
console.log(`[bindings] ${path.basename(rep)} vs ${path.basename(model)}${at ? " @ " + at.slice(0, 7) : " (working tree)"}: ${refs} references, ${findings.length} findings`);
process.exit(findings.length ? 1 : 0);
