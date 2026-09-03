---
name: report
description: "ENTRY POINT for all Power BI report work on a client engagement: plan, design, build, review and publish PBIR reports on top of a reviewed semantic model, or answer what the firm's report standards are. Wraps Microsoft's powerbi-report-planning / -design / -authoring / -management skills (how) with the firm's overrides and additions and the client's overrides. Do not invoke the Microsoft report skills directly on an engagement — go through this one."
---

# report

Everything the firm says about reports, in one file: routing (§1–2), overrides of Microsoft (§3), firm
additions (§4), subagents (§5), output (§6). Microsoft's guidance — page archetypes, layout, chart
selection, colour, accessibility, PBIR mechanics, validation — is **not repeated**; read it from `vendor/`.

> **Draft standards.** §3–4 were written to exercise the architecture, not agreed by the practice.

Downstream of `semantic-model`. You never touch the model; you build against a **reviewed commit** of
it and produce PBIR files in the client's git repo.

## 1. Establish context

1. Identify the engagement (`clients/<code>/engagement.yaml`); read `overrides.md`, `glossary.md`.
2. **Pin the reviewed model**: find the latest `clients/<code>/reviews/<Model>-<date>.md` with
   `result: pass` and take its `model_commit`. None → stop; the model has not been reviewed. Read the
   model's TMDL **at that commit** (`git show <sha>:<path>`; Microsoft's `pbip.md` / `tmdl-guidelines.md`
   explain the files) for object names, and record the sha in the report spec.
3. Determine the report phase (`engagement-workflow` → report track); confirm the previous artefact exists.

## 2. Layers, in precedence order

```
client override  >  this file §3–4  >  Microsoft report skills (vendor/)  >  your own judgement
```

Microsoft, by phase: `powerbi-report-planning` → `_brief/report-spec.md`; `powerbi-report-design` →
design brief; `powerbi-report-authoring` → every PBIR edit, running `powerbi-report-author validate`
after each batch; `powerbi-report-management` → publish, Deploy phase only. Never edit `vendor/`.

## 3. Overrides of Microsoft guidance

| Rule | Microsoft says (reference) | We do instead | Why |
| ---- | -------------------------- | ------------- | --- |
| **RPT-01** | `powerbi-report-authoring` Quick Start step 2 — read the current TMDL, or ask the live model via MCP, for field names | bind only to visible objects in the model's TMDL at the `model_commit` of the latest passing model review | a report must not depend on unreviewed model state; the reviewed commit is the interface |
| **RPT-07** | `authoring.md` — page and visual `name`s are random 20-hex-char ids | stable, readable names (`salesOverview`, `cardNetSales`) | PBIR diffs must be readable by a human reviewer; names are free-form strings in the schema, `validate` must still pass |

## 4. Firm additions

- **RPT-00 PBIR in git is the only authoring path. No live edits.** Reports are
  `<Report>.Report/definition/**` JSON in the client repo; every change is a file edit + commit. Never
  author in the service; never save or commit `.pbix`; Desktop is for `powerbi-desktop` reload /
  screenshot verification only. (Consistent with Microsoft — rule zero to match MOD-00.)
- **RPT-01** Bind to the reviewed commit, visible objects only. `scripts/check-report-bindings.js
  <Report>.Report <Model>.SemanticModel --at <sha>` enforces it; if the model is re-reviewed at a new
  commit, re-run and re-pin. *(override, see §3)*
- **RPT-02** No report-level measures or calculated fields. A missing number is a model change
  request (`clients/<code>/<Model>.model-change-requests.md`), not a workaround in the report.
- **RPT-03** `definition.pbir` uses `byPath` to the sibling `.SemanticModel` during build; the
  deployer switches it to `byConnection` for the target workspace.
- **RPT-04** The firm theme (`theme.json` beside this file) unless a client override supplies one;
  series colours come from the theme, never hard-coded per visual.
- **RPT-07** Readable page and visual names. *(override, see §3)*
- **RPT-08** Visual titles use glossary business terms, not model object names.

**Review checklist** (the `report-reviewer` walks this): RPT-00 only PBIR files changed, no `.pbix` or
`localSettings.json` · `powerbi-report-author validate` clean · RPT-01 `check-report-bindings.js --at
<model_commit>` clean and the sha matches the latest passing model review · RPT-02 no report measures ·
RPT-03 `byPath` during build · RPT-04 theme, no hard-coded series colours · RPT-07 / RPT-08 · Microsoft's
`pre-flight-checklist.md` and `accessibility.md` walked · Desktop screenshot of each page attached.

## 5. Subagents

| Task | Subagent |
| --- | --- |
| Author / edit PBIR | this skill, via Microsoft's authoring skill |
| Review a report | `report-reviewer` — read-only; validate + binding check + checklist above |
| Publish | `deployer` — same gates as models; the model must already be deployed to that environment |

## 6. Output block → decision record

Finish every task with the block below **and** write it into
`<client-root>/decisions/report/<yyyy-mm-dd>-<slug>.md` using
`skills/engagement-workflow/templates/decision.md` — request, what changed, why (rules, overrides),
questions asked and answered, interventions (hook blocks, corrections), next gate. The Stop hook
refuses to finish a turn that changed `models/` without one. Commit it with the change; the commit
message carries `Decision: decisions/report/<file>` and `Agent-Session: <id>` trailers. The mechanical
record of what happened (every prompt, tool call and block) is written by hooks to
`<client-root>/audit/` — you never write there.

```
Phase:         <report-spec|design|build|review|deploy>
Changed:       <files / pages / visuals>
Model commit:  <sha the report is bound to>
Rules applied: <RPT-* / CO-* ids>
Overrides:     <any Microsoft guidance overridden — must have a row in §3>
Next gate:     <what must happen before the next phase>
```
