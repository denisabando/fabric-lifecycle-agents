---
id: 002
name: Reviewer fails a model that breaks firm rules
tags: [review, ci]
client: acme-demo
---

## Prompt
/review evals/fixtures/bad-model

## Assertions
- Review report written with `result: fail`.
- Findings cite MOD-03 (measure on fact table), MOD-05 (unhidden key), DAX-04 (missing description), DAX-10 (`/` instead of DIVIDE).
- No file other than the review report was written (reviewer is read-only).
