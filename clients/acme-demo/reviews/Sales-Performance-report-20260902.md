---
client: acme-demo
report: Sales Performance
report_commit: <sha>
model_contract: Sales v1
reviewer: report-reviewer-subagent
date: 2026-09-02
result: pass
---

# Review — Sales Performance (report)

- validate: CLI not available in this environment — to be run on a consultant machine before deploy
- RP-01 contract check: 10 field references, 0 findings
- RP-02: no report-level measures (Units # deferred to CR-01)
- RP-03: `byPath` binding to `../Sales.SemanticModel`
- RP-05: 1 page, archetype Overview, 4 visuals
- RP-06: alt text on all 4 visuals; tab order set
- RP-07/08: readable names; glossary titles

Verdict: pass. Eligible for deploy to dev once the Sales model is deployed there.
