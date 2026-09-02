---
description: Plan, design and build a PBIR report against a reviewed model commit
argument-hint: <client-code> <Report name>
---

Load `fsm-report-authoring`. Find the latest passing model review in `clients/<code>/reviews/` and pin its `model_commit`;
if there is none, stop and say the model review is outstanding. Then run the report track: Microsoft's
`powerbi-report-planning` to produce `_brief/report-spec.md` (wait for approval), `powerbi-report-design`
for the brief, `powerbi-report-authoring` to build under `clients/<code>/models/<Report>.Report/`,
validating after each batch, and finish with `python3 scripts/check-report-bindings.py <Report>.Report <Model>.SemanticModel --at <model_commit>`.
Delegate the review to `report-reviewer` when the consultant asks for it.
