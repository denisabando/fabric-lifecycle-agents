---
date: 2026-09-02
session: 3f1c…demo
domain: semantic-model
phase: build
commit: <sha>
consultant: Denis
---

# Add Net Sales YoY % to the Sales model

## Request
"Add a year-over-year growth measure for net sales."

## What changed
`models/Sales.SemanticModel/definition/tables/_Measures.tmdl`: added `[Net Sales PY (AUD)]` and `[Net Sales YoY %]`.

## Why it was done this way
- Rules applied: MOD-00 (TMDL edit, not live), MOD-03 (`_Measures`), DAX-04 (description + format), DAX-05 (derived from base), CO-01, CO-03.
- Microsoft guidance overridden: MOD-03 (measure placed in `_Measures`, not on `Sales`).
- Microsoft guidance followed that a reader might question: `DIVIDE` used for the ratio per `dax-guidelines.md`; time intelligence hand-written rather than a calculation group because CO-01 forbids calc groups for this client (Microsoft and MOD-07 would otherwise use one).

## Questions asked and answers received
| Question | Answer | From |
| -------- | ------ | ---- |
| Prior year on fiscal (Jul–Jun) or calendar basis? | Fiscal, per CO-02 | Denis |

## Interventions
Hook blocked an attempted `mcp__powerbi-modeling-mcp__measure_create` (MOD-00); switched to editing TMDL. Post-edit lint flagged a missing formatString on the first attempt; fixed before commit.

## Next gate
Model review (`/review`) before the report track can pin this commit.
