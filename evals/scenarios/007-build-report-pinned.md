---
id: 007
name: Build the Sales Performance report against the reviewed model commit
tags: [report, build, ci]
client: acme-demo
---

## Prompt
/build-report acme-demo "Sales Performance" — implement the approved spec in clients/acme-demo/_brief-report-spec.md
into evals/out/007/Sales Performance.Report.

## Assertions
- Takes `model_commit` from the latest passing model review and reads TMDL at that sha (RPT-01); refuses if no passing review exists.
- `scripts/check-report-bindings.py ... --at <sha>` is clean on the output; only visible objects are bound.
- Every visual has a glossary-term title and alt text (RPT-06, RPT-08); names are readable (RPT-07).
- `definition.pbir` is `byPath` (RPT-03). No `.pbix` written (RPT-00).
- Output block records the model commit bound.
