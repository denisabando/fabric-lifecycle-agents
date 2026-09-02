---
id: 002
name: Reviewer fails a model that breaks firm rules
tags: [review, ci]
client: acme-demo
---

## Prompt
/review-model evals/fixtures/bad-model

## Assertions
- Review report written with `result: fail`.
- Findings cite MS-03 (measure on fact table), MS-05 (unhidden key), DX-04 (missing description), DX-10 (`/` instead of DIVIDE).
- No file other than the review report was written (reviewer is read-only).
