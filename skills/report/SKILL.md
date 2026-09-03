---
name: report
description: "ENTRY POINT for all Power BI report work on a client engagement: plan, design, build, review and publish PBIR reports on top of an approved semantic model. Orchestrates Microsoft's powerbi-report-planning / -design / -authoring / -management skills (how) with firm report standards (what good looks like) and client overrides. Binds only to a reviewed model commit. Do not invoke the Microsoft report skills directly on an engagement — go through this one."
---

# report — orchestrator (report domain)

Downstream of `semantic-model`. You never touch the semantic model; you build against a
**reviewed commit** of it and produce PBIR report files in the client's git repo.

## 1. Establish context

1. Identify the engagement (`clients/<code>/engagement.yaml`), read `overrides.md`, `glossary.md`.
2. **Pin the reviewed model**: find the latest `clients/<code>/reviews/<Model>-<date>.md` with
   `result: pass` and take its `model_commit`. If there is none, stop: the model has not been
   reviewed. Read the model's TMDL **at that commit** (`git show <sha>:<path>`; Microsoft's
   `pbip.md` / `tmdl-guidelines.md` explain the files) for table / column / measure names, and
   record the sha in the report spec (**RPT-01**).
3. Determine the report phase (see `engagement-workflow` → report track) and confirm the
   previous artefact exists.

## 2. Layers, in precedence order

```
client override  >  firm rules (RPT-*)  >  Microsoft report skills  >  your own judgement
```

| Layer | Load | Governs |
| --- | --- | --- |
| Client | `clients/<code>/overrides.md` | anything it states |
| Firm | `skills/standards/report.md` (RPT-*, checklist, theme); its overrides table | PBIR-only path, binding to the reviewed commit, page/visual standards, review gates |
| Microsoft | `powerbi-report-planning` → requirements → `_brief/report-spec.md`; `powerbi-report-design` → design brief; `powerbi-report-authoring` → PBIR mechanics + `powerbi-report-author validate`; `powerbi-report-management` → publish via REST | how |

Use Microsoft's planning skill to produce the report spec, its design skill for the brief, its
authoring skill for every PBIR edit (always run its `validate` after each batch), and its
management skill only in the Deploy phase. When a firm/client rule contradicts Microsoft
guidance, the higher layer wins and the conflict is appended to its overrides table.

## 3. Rules

Load `skills/standards/report.md` (RPT-*) before any PBIR work.

## 4. Subagents

| Task | Subagent |
| --- | --- |
| Author / edit PBIR | (this skill, via MS authoring skill) |
| Review a report | `report-reviewer` (read-only; runs validate + binding check + checklist) |
| Publish | `deployer` (same gates as models; report deploys also require the model already deployed to that env) |

## 5. Output contract

```
Phase:        <report-spec|design|build|review|deploy>
Changed:      <files / pages / visuals>
Model commit: <sha the report is bound to>
Rules applied: <RPT-* / CO-* ids>
Overrides:    <any Microsoft guidance overridden, with its row in the domain standards file's overrides table>
Next gate:    <what must happen before the next phase>
```
