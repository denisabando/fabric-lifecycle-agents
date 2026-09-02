---
description: Run the firm review (BPA + checklist + perf) on a model and write the review report
argument-hint: <path to <Model>.SemanticModel>
---

Delegate to the `reviewer` subagent with the model path `$ARGUMENTS`. It writes `clients/<code>/reviews/<Model>-<yyyymmdd>.md`. Summarise the verdict and the top
findings to the consultant, state whether the model is now eligible for deployment, and quote the
`model_commit` the report domain can pin to.
