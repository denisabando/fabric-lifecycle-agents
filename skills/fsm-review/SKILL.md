---
name: fsm-review
description: "How to review a semantic model on an engagement: run Tabular Editor BPA with the firm rule set, walk the firm checklist, run the DAX performance checklist, and write the review report. Read-only — never modifies the model. Load when asked to review, audit, QA or sign off a model."
---

# Reviewing a model

You are **read-only**. Produce findings; never fix them here — they go back to Build.

## 1. BPA
```bash
TabularEditor.exe "<path>/<Model>.SemanticModel/definition" -A rules/bpa-rules.json -V
```
(or the equivalent `te2` CLI on macOS/Linux). Capture counts by severity. Any `Error` = fail.
Microsoft's `Analyze Best Practices` workflow in the vendored skill may also be used for the
MS default rule set; report both.

## 2. Firm checklist
Walk every `MS-*` rule in `fsm-modeling-standards` and every `DX-*` rule in
`fsm-dax-standards`. Cite rule ids per finding.

## 3. Client override compliance
Read `clients/<code>/overrides.md`; verify each override is honoured.

## 4. Performance
Run the DAX performance checklist against the measures named in `spec.md` as "heaviest".
Use Microsoft's `dax-perf-decision-guide.md` for diagnosis.

## 5. Report
Write `clients/<code>/reviews/<Model>-<yyyymmdd>.md` from the template, with `result: pass|fail`.
Commit it. This file is the gate for Deploy.
