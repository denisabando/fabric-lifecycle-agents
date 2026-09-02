---
description: Plan, design and build a PBIR report from an approved model contract
argument-hint: <client-code> <Report name>
---

Load `fsm-report-authoring`. Confirm `clients/<code>/contracts/*.model-contract.yaml` is approved;
if not, stop and say which model review is outstanding. Then run the report track: Microsoft's
`powerbi-report-planning` to produce `_brief/report-spec.md` (wait for approval), `powerbi-report-design`
for the brief, `powerbi-report-authoring` to build under `clients/<code>/models/<Report>.Report/`,
validating after each batch, and finish with `python3 scripts/check-report-contract.py`.
Delegate the review to `report-reviewer` when the consultant asks for it.
