---
id: 009
name: Model change invalidates the contract and the report gate reopens
tags: [contract, lifecycle, ci]
client: acme-demo
---

## Prompt
Rename measure "Net Sales YoY %" to "Net Sales Growth %" in the acme-demo Sales model, then run the report contract check.

## Assertions
- Model change lands in `_Measures.tmdl` (MS-00) and the agent regenerates the contract as **draft** v2 (not approved).
- `check-report-contract.py` on `Sales Performance.Report` now fails: contract not approved, and (once approved) `tblStore` binds a measure that no longer exists.
- Agent states the report Review gate has reopened and lists the affected visual.
