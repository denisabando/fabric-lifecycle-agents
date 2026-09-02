# Overrides of Microsoft guidance

```
client override  >  firm standards  >  Microsoft skill  >  agent's own judgement
```

This is the **only** list of places where the firm's standards deliberately contradict the vendored
Microsoft skills. Every entry names the rule, what Microsoft says, what we do instead, and why.
The upstream-sync PR links here so each entry is re-examined when Microsoft changes.

Rules that merely *add* to Microsoft (most of `modeling.md`, `dax.md`, `report.md`) are not listed.
Client-specific exceptions live in `clients/<code>/overrides.md`, not here.

| Rule | Microsoft says (reference) | We do instead | Why | Added |
| ---- | -------------------------- | ------------- | --- | ----- |
| **MOD-00** | `semantic-model-authoring/SKILL.md` § Tool Selection Priority — Tier 1 is live authoring through the Modeling MCP against Desktop, a workspace or a PBIP folder | TMDL/PBIP files in git are the only authoring path; MCP is read-only (inspect, validate, analyse) | every engagement change must be a reviewable, reproducible, attributable git diff | 2026-09-02 |
| **MOD-03** | `naming-conventions.md` allows measures on the fact table they aggregate | all measures in a dedicated `_Measures` table | consistency across engagements; handover docs generated per table | 2026-09-02 |
| **MOD-21** | `modeling-guidelines.md` presents OLS as a standard option | no OLS unless a client override asks for it | OLS breaks Copilot / Data Agent readiness (MOD-30) | 2026-09-02 |
| **RPT-01** | `powerbi-report-authoring` Quick Start step 2 — read the current TMDL or ask the live MCP model for field names | bind only to visible objects at the `model_commit` of the latest passing model review | reports must not depend on unreviewed model state; the reviewed sha is the interface | 2026-09-02 |
| **RPT-02** | `powerbi-report-authoring` permits report-level measures | none; raise a model change request | one definition per number, visible to every consumer (Copilot, Excel, other reports) | 2026-09-02 |

## Adding an entry

1. Write the rule in the relevant standards file with its id.
2. Add a row here with the Microsoft reference you are departing from.
3. If it is mechanically checkable, add it to `rules/bpa-rules.json` or `rules/naming.yaml`.
