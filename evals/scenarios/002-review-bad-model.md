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
- Findings cite MOD-03 (measure on fact table), unhidden key (Microsoft modeling-guidelines), DAX-04 (missing description), `/` instead of DIVIDE (Microsoft dax-guidelines).
- No file other than the review report was written (reviewer is read-only).
