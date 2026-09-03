---
name: semantic-model
description: "ENTRY POINT for all semantic model work on a client engagement. Use whenever a consultant asks to design, build, change, review, optimise or deploy a Power BI / Fabric semantic model. Orchestrates Microsoft's semantic-model-authoring skill (how) with firm standards (what good looks like) and the client's overrides. Do not invoke the Microsoft skill directly on an engagement — go through this one."
---

# semantic-model — orchestrator (model domain)

You are working on a **client BI engagement**. Every model you touch will be reviewed, deployed
and handed over. Act accordingly: text-based (TMDL) artifacts in git, an evidence trail, no
surprises in prod.

## 1. Establish context (always, before any modelling)

1. Identify the engagement: look for `clients/<code>/engagement.yaml`. If the user did not name a
   client and only one non-template folder exists under `clients/`, use it; otherwise ask.
2. Read, in this order:
   - `clients/<code>/engagement.yaml` — workspaces, environments, storage mode, capacity tier
   - `clients/<code>/overrides.md` — client rules that beat firm rules
   - `clients/<code>/glossary.md` — business terms → model object names
3. Determine the phase from `engagement-workflow` and confirm the previous phase's artefact
   exists. **Do not build before `spec.md` is marked approved. Do not deploy before a review
   report exists for the current model version.**

## 2. Load the layers, in precedence order

```
client override  >  firm standards  >  Microsoft skill  >  your own judgement
```

| Layer | Load | Governs |
| --- | --- | --- |
| Client | `clients/<code>/overrides.md` | anything it explicitly states |
| Firm | `skills/standards/semantic-model.md` (MOD-*, DAX-*); `skills/standards/SKILL.md § Overrides` for departures from Microsoft | naming, structure, DAX style, review gates |
| Microsoft | `vendor/skills-for-fabric/plugins/powerbi-authoring/skills/semantic-model-authoring/SKILL.md` | tool routing (Modeling MCP → TMDL → REST), TMDL syntax, Direct Lake mechanics, deployment, refresh, permissions |

Follow the Microsoft skill's workflow selector for *how* to perform an operation, **with one
standing override**: firm rule **MOD-00** replaces Microsoft's Tool Selection Priority. Tier 1
(MCP live authoring) is disabled for writes; always take the TMDL/PBIP path (Microsoft's Tier 2)
and use the Modeling MCP read-only for inspection and validation against the PBIP folder. Apply firm and client rules to decide *what* to create.

When a firm or client rule contradicts Microsoft guidance, the higher layer wins. Record the
conflict in `skills/standards/SKILL.md § Overrides` (date, rule, which MS guidance it overrides, why) so it is
reviewed on the next upstream sync. **Never edit anything under `vendor/`.**

## 3. Delegate to subagents where defined

| Task | Subagent | Notes |
| --- | --- | --- |
| Create / modify model objects | `modeler` | uses Modeling MCP; falls back to TMDL per MS skill |
| Review a model | `reviewer` | read-only; BPA + firm rules + perf; its report pins `model_commit` |
| Promote between workspaces | `deployer` | gates + mechanisms live in its instructions; refuses `prod` without the token |

## 4. Always-on rules (short list; details in the firm skills)

- **MOD-00**: source of truth is the PBIP project's TMDL under `clients/<code>/models/`. Every
  change is a file edit + commit. No live edits to Desktop, workspace or via MCP writes.
- Every measure has a `description`. The handover pack is generated from it.
- Never read client **data** (only metadata) unless `engagement.yaml: allow_data_reads: true`.
- Never place credentials, connection strings or workspace IDs anywhere except
  `engagement.yaml` / environment variables.
- The Modeling MCP is read-only on engagements (inspect, validate DAX, analyse). If a user asks
  for a live edit, explain MOD-00 and offer the TMDL edit instead.

## 5. Handoff to the report domain

The handoff is the **reviewed commit**: a passing review report records `model_commit`, and the
report domain builds against the model's TMDL at that sha. Nothing to generate. After any later
model change, the report track re-runs `scripts/check-report-bindings.py --at <new sha>` once a
new review passes. Read `clients/<code>/<Model>.model-change-requests.md` for measures the report
domain needs — they are spec revisions, not ad-hoc additions.

## 6. Output contract

Finish every task with a short block:

```
Phase:        <discovery|spec|build|review|deploy|handover>
Changed:      <files / objects>
Rules applied: <firm/client rule ids that shaped decisions>
Overrides:    <any Microsoft guidance overridden, with its standards/SKILL.md § Overrides entry>
Next gate:    <what must happen before the next phase>
```
