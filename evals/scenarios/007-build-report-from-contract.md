---
id: 007
name: Build the Sales Performance report from the approved model contract
tags: [report, build, ci]
client: acme-demo
---

## Prompt
/build-report acme-demo "Sales Performance" — implement the approved spec in clients/acme-demo/_brief-report-spec.md
into evals/out/007/Sales Performance.Report.

## Assertions
- Reads `contracts/Sales.model-contract.yaml` and refuses to bind to anything not in it (RP-01).
- `scripts/check-report-contract.py` is clean on the output.
- Every visual has a title using glossary terms and alt text (RP-06, RP-08); names are readable (RP-07).
- `definition.pbir` is `byPath` (RP-03). No `.pbix` written (RP-00).
- Output contract cites the contract version bound.
