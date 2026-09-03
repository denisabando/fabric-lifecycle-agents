#!/usr/bin/env node
// PostToolUse: after an edit, run the relevant check and report findings back. Never blocks.
//   *.tmdl            -> naming linter + Tabular Editor BPA (if on PATH)
//   *.Report/**.json  -> report binding check + powerbi-report-author validate (if on PATH)
"use strict";
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { readStdinJson, norm, PLUGIN_ROOT, onPath } = require("../scripts/lib.js");

const ti = readStdinJson().tool_input || {};
const file = norm(ti.file_path || "");
const run = (cmd, args) => spawnSync(cmd, args, { encoding: "utf8" });
const say = (s) => process.stdout.write(s.endsWith("\n") ? s : s + "\n");

if (/\.tmdl$/i.test(file)) {
  const r = run(process.execPath, [path.join(PLUGIN_ROOT, "scripts", "lint-tmdl.js"), file, path.join(PLUGIN_ROOT, "skills", "semantic-model", "naming.yaml")]);
  say(r.stdout || r.stderr || "");
  let def = path.dirname(file);
  while (path.basename(def) !== "definition" && path.dirname(def) !== def) def = path.dirname(def);
  const te = onPath("TabularEditor.exe") ? "TabularEditor.exe" : onPath("TabularEditor") ? "TabularEditor" : null;
  if (te && path.basename(def) === "definition") {
    const b = run(te, [def, "-A", path.join(PLUGIN_ROOT, "skills", "semantic-model", "bpa-rules.json"), "-V"]);
    say((b.stdout + b.stderr).split(/\r?\n/).slice(-20).join("\n"));
  } else say("[hook] BPA skipped (Tabular Editor CLI not on PATH). Reviewer will run it.");
} else if (/\.Report\/.*\.json$/i.test(file)) {
  const rep = file.slice(0, file.indexOf(".Report/") + ".Report".length);
  const modelsDir = path.dirname(rep);
  const model = fs.existsSync(modelsDir) ? fs.readdirSync(modelsDir).find((n) => n.endsWith(".SemanticModel")) : null;
  if (model) { const r = run(process.execPath, [path.join(PLUGIN_ROOT, "scripts", "check-report-bindings.js"), rep, path.join(modelsDir, model)]); say(r.stdout || r.stderr || ""); }
  else say(`[hook] no semantic model beside ${rep} (RPT-01)`);
  if (onPath("powerbi-report-author")) { const v = run("powerbi-report-author", ["validate", rep]); say((v.stdout + v.stderr).split(/\r?\n/).slice(-10).join("\n")); }
  else say("[hook] PBIR validate skipped (powerbi-report-author not on PATH)");
}
process.exit(0);
