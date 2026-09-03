---
description: Run the firm review on a semantic model or a report and write the review report
argument-hint: <path to <Model>.SemanticModel or <Report>.Report>
---

If `$ARGUMENTS` ends in `.Report`, delegate to `report-reviewer`; otherwise delegate to the `reviewer` subagent with the model path `$ARGUMENTS`. Before delegating, run `node scripts/check-trail.js <client-root> --report-only` and pass any
unattributed commits to the reviewer as findings (a change made in the Fabric service and committed
from the workspace bypassed MOD-00 / RPT-00 and needs review). It writes `clients/<code>/reviews/<Model>-<yyyymmdd>.md`. Summarise the verdict and the top
findings to the consultant, state whether the model is now eligible for deployment, and quote the
`model_commit` the report domain can pin to.
