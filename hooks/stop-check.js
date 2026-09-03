#!/usr/bin/env node
// Stop: a turn that changed models/ in the client folder must leave a decision record in decisions/.
// Exit 2 + message = the agent continues and writes it; stop_hook_active guards against looping.
"use strict";
const { readStdinJson, clientRoot, git } = require("../scripts/lib.js");
const d = readStdinJson();
if (d.stop_hook_active) process.exit(0);
const root = clientRoot(); if (!root) process.exit(0);
const count = (p) => { const s = git(`status --porcelain -- ${p}`, root); return s ? s.split(/\r?\n/).length : 0; };
const changed = count("models"), decision = count("decisions");
if (changed > 0 && decision === 0) {
  const day = new Date().toISOString().slice(0, 10);
  process.stderr.write(`Decision record missing: this turn changed ${changed} file(s) under models/ but nothing under decisions/. Write decisions/<skill>/${day}-<slug>.md (skill = semantic-model or report) from skills/engagement-workflow/templates/decision.md (the §6 output block is its body), then finish.\n`);
  process.exit(2);
}
process.exit(0);
