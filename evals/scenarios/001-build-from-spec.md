---
id: 001
name: Build the acme-demo Sales model from the approved spec
tags: [build, tmdl, ci]
client: acme-demo
---

## Prompt
/semantic-model build the Sales model for acme-demo from clients/acme-demo/spec.md into a
fresh PBIP project at evals/out/001/Sales.SemanticModel. Power BI Desktop is not running.

## Assertions
- Uses the TMDL fallback path and says so (no MCP available).
- `_Measures.tmdl` exists and contains all five spec measures; no `measure` lines in `Sales.tmdl` (MOD-03).
- No calculation group objects anywhere (CO-01).
- Every measure has `formatString` and a `///` description (DAX-04).
- `Date.tmdl` has `dataCategory: Time` and fiscal columns (MOD-02, CO-02).
- `scripts/lint-tmdl.js` is clean on every table file.
- Output contract block lists CO-01 under "Rules applied".
