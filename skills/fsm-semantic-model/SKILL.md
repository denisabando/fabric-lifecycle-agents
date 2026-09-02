---
name: fsm-semantic-model
description: "ENTRY POINT for all semantic model work on a client engagement. Use whenever a consultant asks to design, build, change, review, optimise or deploy a Power BI / Fabric semantic model. Orchestrates Microsoft's semantic-model-authoring skill (how) with firm standards (what good looks like) and the client's overrides. Do not invoke the Microsoft skill directly on an engagement — go through this one."
---

# fsm-semantic-model — orchestrator

You are working on a **client BI engagement**. Every model you touch will be reviewed, deployed
and handed over. Act accordingly: text-based (TMDL) artefacts in git, an evidence trail, no
surprises in prod.

## 1. Establish context (always, before any modelling)

1. Identify the engagement: look for `clients/<code>/engagement.yaml`. If the user did not name a
   client and only one non-template folder exists under `clients/`, use it; otherwise ask.
2. Read, in this order:
   - `clients/<code>/engagement.yaml` — workspaces, environments, storage mode, capacity tier
   - `clients/<code>/overrides.md` — client rules that beat firm rules
   - `clients/<code>/glossary.md` — business terms → model object names
3. Determine the phase from `fsm-engagement-workflow` and confirm the previous phase's artefact
   exists. **Do not build before `spec.md` is marked approved. Do not deploy before a review
   report exists for the current model version.**

## 2. Load the layers, in precedence order

```
client override  >  firm rules (fsm-*)  >  Microsoft skill  >  your own judgement
```

| Layer | Load | Governs |
| --- | --- | --- |
| Client | `clients/<code>/overrides.md` | anything it explicitly states |
| Firm | `fsm-modeling-standards`, `fsm-dax-standards` (+ `rules/naming.yaml`, `rules/bpa-rules.json`) | naming, structure, DAX style, review gates |
| Microsoft | `vendor/skills-for-fabric/plugins/powerbi-authoring/skills/semantic-model-authoring/SKILL.md` | tool routing (Modeling MCP → TMDL → REST), TMDL syntax, Direct Lake mechanics, deployment, refresh, permissions |

Follow the Microsoft skill's **Tool selection priority** and its workflow selector exactly for
*how* to perform an operation. Apply firm and client rules to decide *what* to create.

When a firm or client rule contradicts Microsoft guidance, the higher layer wins. Append the
conflict to `rules/precedence.md` (date, rule, which MS guidance it overrides, why) so it is
reviewed on the next upstream sync. **Never edit anything under `vendor/`.**

## 3. Delegate to subagents where defined

| Task | Subagent | Notes |
| --- | --- | --- |
| Create / modify model objects | `modeler` | uses Modeling MCP; falls back to TMDL per MS skill |
| Review a model | `reviewer` | read-only; runs BPA with `rules/bpa-rules.json` + firm checklist |
| Promote between workspaces | `deployer` | refuses `prod` without the confirmation token |

## 4. Always-on rules (short list; details in the firm skills)

- Source of truth is the PBIP project's TMDL under `clients/<code>/models/`. Every change is a
  git diff.
- Every measure has a `description`. The handover pack is generated from it.
- Never read client **data** (only metadata) unless `engagement.yaml: allow_data_reads: true`.
- Never place credentials, connection strings or workspace IDs anywhere except
  `engagement.yaml` / environment variables.
- Prefer the Modeling MCP when Power BI Desktop is open on the model; otherwise edit TMDL directly
  and say so.

## 5. Output contract

Finish every task with a short block:

```
Phase:        <discovery|spec|build|review|deploy|handover>
Changed:      <files / objects>
Rules applied: <firm/client rule ids that shaped decisions>
Overrides:    <any MS guidance overridden, with precedence.md entry>
Next gate:    <what must happen before the next phase>
```
