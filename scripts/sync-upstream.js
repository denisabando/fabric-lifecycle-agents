#!/usr/bin/env node
// Compare the pinned vendor/skills-for-fabric commit with upstream main; print a review-ready summary.
//   usage: node sync-upstream.js [--bump]     (--bump checks out upstream main in the submodule)
"use strict";
const path = require("path");
const { execSync } = require("child_process");
const { PLUGIN_ROOT } = require("./lib.js");
const sub = path.join(PLUGIN_ROOT, "vendor", "skills-for-fabric");
const g = (a) => { try { return execSync("git " + a, { cwd: sub, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { return ""; } };
const WATCH = "plugins/powerbi-authoring common CHANGELOG.md";
const old = g("rev-parse HEAD"); g("fetch -q origin main"); const neu = g("rev-parse origin/main");
console.log(`pinned:   ${old}\nupstream: ${neu}`);
if (old === neu) { console.log("UP_TO_DATE=true"); process.exit(0); }
console.log("UP_TO_DATE=false\n\n## Changed files in watched paths\n" + g(`diff --stat ${old} ${neu} -- ${WATCH}`));
console.log("\n## New CHANGELOG entries\n" + g(`diff ${old} ${neu} -- CHANGELOG.md`).split(/\r?\n/).filter((l) => l.startsWith("+") && !l.startsWith("+++")).map((l) => l.slice(1)).join("\n"));
console.log("\n## Guidance-level diff (semantic-model-authoring)\n" + g(`diff ${old} ${neu} -- plugins/powerbi-authoring/skills/semantic-model-authoring`).split(/\r?\n/).slice(0, 400).join("\n"));
if (process.argv.includes("--bump") || process.env.BUMP === "true") { g(`checkout -q ${neu}`); console.log(`BUMPED submodule to ${neu} (commit it in the parent repo)`); }
