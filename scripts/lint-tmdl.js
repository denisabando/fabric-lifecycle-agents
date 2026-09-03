#!/usr/bin/env node
// Lightweight TMDL naming linter driven by skills/semantic-model/naming.yaml.
//   usage: node lint-tmdl.js <file.tmdl> <naming.yaml>     exit 1 on findings
"use strict";
const fs = require("fs");
const { readYamlLite } = require("./lib.js");

const [file, rulesPath] = process.argv.slice(2);
const rules = readYamlLite(rulesPath);
const txt = fs.readFileSync(file, "utf8");
const findings = [];
const tbl = txt.match(/^table\s+(?:'([^']+)'|(\S+))/m); const table = tbl ? (tbl[1] || tbl[2]) : null;
const tprefix = rules.tables.forbidden_prefixes || [];
if (table && tprefix.some((p) => table.toLowerCase().startsWith(p.toLowerCase())))
  findings.push(`${file}: table '${table}' has a technical prefix (Microsoft naming-conventions; naming.yaml tables.forbidden_prefixes)`);

const blockRe = /^\t(measure|column)\s+(?:'([^']+)'|([^=\s]+))\s*=?(.*?)(?=^\t(?:measure|column|partition|hierarchy)\b|^\t\/\/\/|(?![\s\S]))/gms;
const described = new Set(); for (const m of txt.matchAll(/\/\/\/[^\n]*\n\t+measure\s+(?:'([^']+)'|([^=\s]+))\s*=/g)) described.add(m[1] || m[2]);
for (const m of txt.matchAll(blockRe)) {
  const [, kind, n1, n2, body] = m; const name = n1 || n2;
  if (kind === "measure") {
    if (table && table !== rules.tables.measures_table) findings.push(`${file}: measure '${name}' defined on '${table}' — MOD-03: measures belong in ${rules.tables.measures_table}`);
    if (rules.measures.require_description && !/description:/.test(body) && !described.has(name)) findings.push(`${file}: measure '${name}' has no description (DAX-04)`);
    if (rules.measures.require_format_string && !/formatString/.test(body)) findings.push(`${file}: measure '${name}' has no formatString (DAX-04)`);
  } else {
    if (name.endsWith(rules.columns.key_suffix) && rules.columns.keys_hidden && !/isHidden/.test(body)) findings.push(`${file}: key column '${name}' is not hidden (Microsoft modeling-guidelines: hide key columns)`);
    if ((rules.columns.forbidden_prefixes || []).some((p) => name.toLowerCase().startsWith(p.toLowerCase()))) findings.push(`${file}: column '${name}' has a technical prefix`);
  }
}
for (const f of findings) console.log("[lint] " + f);
if (!findings.length) console.log(`[lint] ${file}: clean`);
process.exit(findings.length ? 1 : 0);
