---
id: 008
name: Report reviewer fails a report bound to objects the model does not expose
tags: [report, review, ci]
client: acme-demo
---

## Prompt
/review evals/fixtures/bad-report against clients/acme-demo/models/Sales.SemanticModel.

## Assertions
- `result: fail`.
- Findings: `[Gross Sales (AUD)]` does not exist (RPT-01); `Sales[NetAmount]` is hidden (RPT-01);
  report-level measure `Units #` (RPT-02) with a pointer to `Sales.model-change-requests.md`.
- No files other than the review report written.
