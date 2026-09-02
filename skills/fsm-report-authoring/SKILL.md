---
name: fsm-report-authoring
description: "ENTRY POINT for all Power BI report work on a client engagement: plan, design, build, review and publish PBIR reports on top of an approved semantic model. Orchestrates Microsoft's powerbi-report-planning / -design / -authoring / -management skills (how) with firm report standards (what good looks like) and client overrides. Requires an approved model contract. Do not invoke the Microsoft report skills directly on an engagement — go through this one."
---

# fsm-report-authoring — orchestrator (report domain)

Downstream of `fsm-semantic-model`. You never touch the semantic model; you consume its
**model contract** and produce PBIR report files in the client's git repo.

## 1. Establish context

1. Identify the engagement (`clients/<code>/engagement.yaml`), read `overrides.md`, `glossary.md`.
2. **Require the model contract**: `clients/<code>/contracts/<Model>.model-contract.yaml` with
   `status: approved`. If missing or `draft`, stop: the model phase has not finished review.
   The contract — not the TMDL, not a live model — is the only source of table / column /
   measure names you may bind to (**RP-01**).
3. Determine the report phase (see `fsm-engagement-workflow` → report track) and confirm the
   previous artefact exists.

## 2. Layers, in precedence order

```
client override  >  firm rules (RP-*)  >  Microsoft report skills  >  your own judgement
```

| Layer | Load | Governs |
| --- | --- | --- |
| Client | `clients/<code>/overrides.md` | anything it states |
| Firm | this file § Rules, `references/report-review-checklist.md` | PBIR-only path, binding via contract, page/visual standards, review gates |
| Microsoft | `powerbi-report-planning` → requirements → `_brief/report-spec.md`; `powerbi-report-design` → design brief; `powerbi-report-authoring` → PBIR mechanics + `powerbi-report-author validate`; `powerbi-report-management` → publish via REST | how |

Use Microsoft's planning skill to produce the report spec, its design skill for the brief, its
authoring skill for every PBIR edit (always run its `validate` after each batch), and its
management skill only in the Deploy phase. When a firm/client rule contradicts Microsoft
guidance, the higher layer wins and the conflict is appended to `rules/precedence.md`.

## 3. Rules

- **RP-00 PBIR in git is the only authoring path. No live edits.** Reports are
  `<Report>.Report/definition/**` JSON in the client repo; every change is a file edit + commit.
  Never author in the service, never save or commit `.pbix`, never use Power BI Desktop as the
  place changes are made (Desktop is for `powerbi-desktop` reload / screenshot verification
  only). Overrides nothing in Microsoft's skill (it is PBIR-native) but is stated as rule zero
  to match MS-00.
- **RP-01 Bind only through the model contract.** Every `Column` / `Measure` expression in a
  `visual.json`, filter or sort must resolve to an entry in the approved contract.
  `scripts/check-report-contract.py` enforces this; the reviewer fails the report otherwise.
- **RP-02 No report-level measures or calculated fields.** If a number is missing, raise a
  model change request (`contracts/<Model>.change-requests.md`); do not work around it in the
  report. (Overrides the MS authoring skill's allowance for report measures — logged.)
- **RP-03 Binding mode**: `definition.pbir` uses `byPath` to the sibling `.SemanticModel` in the
  repo during build; the deployer switches to `byConnection` for the target workspace.
- **RP-04 Firm theme** from `references/firm-theme.json` unless a client override supplies one;
  colours for measures come from the theme, never hard-coded per visual.
- **RP-05 Page archetypes**: every page is one of Overview / Trend / Breakdown / Detail
  (Microsoft `powerbi-report-design` archetypes), stated in the report spec, ≤ 8 visuals per page.
- **RP-06 Accessibility**: alt text on every visual, tab order set, colour-contrast check from
  Microsoft's `accessibility.md` in the review.
- **RP-07 Names**: pages and visuals get stable, readable `name`s (`salesOverview`,
  `cardNetSales`), not random hex — diffs must be readable to a human reviewer.
- **RP-08 Glossary titles**: visual titles use glossary business terms, not model object names.

## 4. Subagents

| Task | Subagent |
| --- | --- |
| Author / edit PBIR | (this skill, via MS authoring skill) |
| Review a report | `report-reviewer` (read-only; runs validate + contract check + checklist) |
| Publish | `deployer` (same gates as models; report deploys also require the model already deployed to that env) |

## 5. Output contract

```
Phase:        <report-spec|design|build|review|deploy>
Changed:      <files / pages / visuals>
Contract:     <model-contract version bound>
Rules applied: <RP-* / CO-* ids>
Overrides:    <any MS guidance overridden, with precedence.md entry>
Next gate:    <what must happen before the next phase>
```
