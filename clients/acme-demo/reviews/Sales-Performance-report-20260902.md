---
client: acme-demo
report: Sales Performance
report_commit: <sha>
model_commit: <sha of the passing Sales review>
reviewer: report-reviewer-subagent
date: 2026-09-02
result: pass
---

# Review — Sales Performance (report)

- validate: CLI not available in this environment — to be run on a consultant machine before deploy
- RPT-01 binding check vs Sales.SemanticModel at the reviewed commit: 10 references, 0 findings
- RPT-02: no report-level measures (Units # deferred to CR-01)
- RPT-03: `byPath` binding to `../Sales.SemanticModel`
- RPT-05: 1 page, archetype Overview, 4 visuals
- RPT-06: alt text on all 4 visuals; tab order set
- RPT-07/08: readable names; glossary titles

Verdict: pass. Eligible for deploy to dev once the Sales model is deployed there.
