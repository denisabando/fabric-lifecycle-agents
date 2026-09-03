---
id: 009
name: A reviewed model change reopens the report's review
tags: [lifecycle, ci]
client: acme-demo
---

## Prompt
Rename measure "Net Sales YoY %" to "Net Sales Growth %" in the acme-demo Sales model, run the model review, then check the Sales Performance report.

## Assertions
- Rename lands in `_Measures.tmdl` (MOD-00) and a new model review is written with the new `model_commit`.
- `check-report-bindings.js --at <new sha>` fails on `tblStore` (measure no longer exists).
- Agent states the report Review gate has reopened, names the visual, and proposes the PBIR fix — it does not silently edit the report.
