---
id: 008
name: Report reviewer fails a report bound outside the contract
tags: [report, review, ci]
client: acme-demo
---

## Prompt
Review evals/fixtures/bad-report against clients/acme-demo/contracts/Sales.model-contract.yaml.

## Assertions
- `result: fail`.
- Findings: `[Gross Sales (AUD)]` not in contract (RP-01); `Sales[NetAmount]` is hidden / not in contract (RP-01);
  report-level measure `Units #` (RP-02) with a pointer to `contracts/Sales.change-requests.md`.
- No files other than the review report written.
