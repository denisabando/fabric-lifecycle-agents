---
name: standards
description: "The firm's standards for Fabric / Power BI engagement work, in one place: semantic model rules (MOD-*, DAX-*), report rules (RPT-*), the machine-checkable rule files, and the single list of places where the firm overrides Microsoft's vendored skills. Loaded by the domain orchestrators; load directly when asked what the firm standard is or why the agent departed from Microsoft."
---

# Standards

Everything the firm says, in one folder. Nothing here is Microsoft's (that is `vendor/`) and nothing
here is client-specific (that is `clients/<code>/overrides.md`).

| File | What | Loaded by |
| --- | --- | --- |
| `semantic-model.md` | MOD-* modelling rules, DAX-* rules, RLS patterns | `skills/semantic-model` orchestrator, `reviewer` |
| `report.md` | RPT-* rules, review checklist, firm theme | `skills/report` orchestrator, `report-reviewer` |
| `naming.yaml`, `bpa-rules.json` | the machine-checkable subset, same rule ids | hooks, CI, Tabular Editor |

Precedence, everywhere:

```
client override  >  these standards  >  Microsoft skill (vendor/)  >  agent's own judgement
```

Conventions: one standards file per domain, named after its orchestrator; a rule-id prefix per
domain (`MOD`, `DAX`, `RPT`, a future `ING`…); `-00` is always "the diffable path — no live edits";
a rule that contradicts Microsoft must have a row in the table below.

## Overrides of Microsoft guidance

The **only** list of places where these standards deliberately contradict the vendored Microsoft
skills. The upstream-sync PR links here so each row is re-examined when Microsoft changes. Rules
that merely add to Microsoft are not listed.

| Rule | Microsoft says (reference) | We do instead | Why | Added |
| ---- | -------------------------- | ------------- | --- | ----- |
| **MOD-00** | `semantic-model-authoring/SKILL.md` § Tool Selection Priority — Tier 1 is live authoring through the Modeling MCP against Desktop, a workspace or a PBIP folder | TMDL/PBIP files in git are the only authoring path; MCP is read-only (inspect, validate, analyse) | every engagement change must be a reviewable, reproducible, attributable git diff | 2026-09-02 |
| **MOD-03** | `naming-conventions.md` allows measures on the fact table they aggregate | all measures in a dedicated `_Measures` table | consistency across engagements; handover docs generated per table | 2026-09-02 |
| **MOD-21** | `modeling-guidelines.md` presents OLS as a standard option | no OLS unless a client override asks for it | OLS breaks Copilot / Data Agent readiness (MOD-30) | 2026-09-02 |
| **RPT-01** | `powerbi-report-authoring` Quick Start step 2 — read the current TMDL or ask the live MCP model for field names | bind only to visible objects at the `model_commit` of the latest passing model review | reports must not depend on unreviewed model state; the reviewed sha is the interface | 2026-09-02 |
| **RPT-02** | `powerbi-report-authoring` permits report-level measures | none; raise a model change request | one definition per number, visible to every consumer (Copilot, Excel, other reports) | 2026-09-02 |

To add one: write the rule in the domain file, add a row here with the Microsoft reference, and if it
is mechanically checkable mirror it in `naming.yaml` or `bpa-rules.json`.
