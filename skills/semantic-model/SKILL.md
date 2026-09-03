---
name: semantic-model
description: "ENTRY POINT for all semantic model work on a client engagement. Use whenever a consultant asks to design, build, change, review, optimise or deploy a Power BI / Fabric semantic model, or asks what the firm's modelling standards are. Wraps Microsoft's semantic-model-authoring skill (how) with the firm's overrides and additions (what good looks like) and the client's overrides. Do not invoke the Microsoft skill directly on an engagement — go through this one."
---

# semantic-model

Everything the firm says about semantic models, in one file: how a request is routed (§1–2), where
the firm overrides Microsoft (§3), what the firm adds to Microsoft (§4), who does the work (§5), and
how to report back (§6). Microsoft's own guidance is **not repeated** here — it is read from `vendor/`.

> **Draft standards.** §3–4 were written to exercise the architecture, not agreed by the practice.
> MOD-00 is the one rule that came from a stated requirement. Replace or extend before real use.

You are working on a **client BI engagement**. Every model you touch will be reviewed, deployed and
handed over: text (TMDL) artefacts in git, an evidence trail, no surprises in prod.

## 1. Establish context (always, before any modelling)

1. Identify the engagement: `clients/<code>/engagement.yaml`. If the user did not name a client and
   only one non-template folder exists under `clients/`, use it; otherwise ask.
2. Read, in this order: `engagement.yaml` (workspaces, environments, storage mode), `overrides.md`
   (client rules that beat everything below), `glossary.md` (business terms → object names).
3. Determine the phase from `engagement-workflow` and confirm the previous phase's artefact exists.
   **Do not build before `spec.md` is `status: approved`. Do not deploy before a passing review
   exists for the current commit.**

## 2. Layers, in precedence order

```
client override (clients/<code>/overrides.md)  >  this file §3–4  >  Microsoft skill (vendor/)  >  your own judgement
```

Microsoft's skill: `vendor/skills-for-fabric/plugins/powerbi-authoring/skills/semantic-model-authoring/SKILL.md`.
It says **how**: tool routing, TMDL syntax, Direct Lake mechanics, deployment, refresh, permissions, DAX
tuning, Copilot readiness. Follow its workflow selector for every operation, except where §3 says
otherwise. Never edit anything under `vendor/`.

Also read from Microsoft rather than from here: star schema, hiding keys, relationship direction,
calculation groups, display folders, naming without technical prefixes, `VAR`, `DIVIDE`, DAX
anti-patterns (`modeling-guidelines.md`, `naming-conventions.md`, `dax-guidelines.md`).

## 3. Overrides of Microsoft guidance

The only places this file contradicts the vendored skill. The upstream-sync PR links here so each row
is re-examined when Microsoft changes. Adding a row is the only way to override Microsoft.

| Rule | Microsoft says (reference) | We do instead | Why |
| ---- | -------------------------- | ------------- | --- |
| **MOD-00** | `SKILL.md` § Tool Selection Priority — Tier 1 is live authoring through the Modeling MCP against Desktop, a workspace or a PBIP folder | TMDL/PBIP files in git are the only authoring path; MCP is read-only | every engagement change must be a reviewable, reproducible, attributable git diff |
| **MOD-03** | `naming-conventions.md` puts measures on the table they aggregate, organised by display folder | all measures in one dedicated `_Measures` table | consistency across engagements; handover docs generated per table |
| **MOD-21** | `naming-conventions.md` / `semantic-model-ai-readiness.md` treat OLS as a normal option | no OLS unless a client override asks for it | OLS breaks Copilot / Data Agent readiness |

**MOD-00 in full — the diffable path.** The model of record is the PBIP project's
`<Model>.SemanticModel/definition/*.tmdl` in the client's git repo; every change is a file edit
followed by a commit. Never author against a live model (Desktop, workspace, service UI). Never use
the Power BI Modeling MCP for writes; read-only use (inspect, validate DAX, analyse best practices)
against the local PBIP folder is fine. Changes reach a workspace only from committed TMDL: workspace
git integration, or `updateDefinition` from the committed definition folder. A model that exists only
as `.pbix` or only in a workspace is first exported to PBIP (Microsoft's *Export to PBIP* workflow)
and committed as the baseline. If a user asks for a live edit, explain this and offer the TMDL edit.

## 4. Firm additions (things Microsoft does not say)

Rule ids are cited by the reviewer, `scripts/lint-tmdl.py` (via `naming.yaml`) and `bpa-rules.json`.

**Structure**
- **MOD-02** The date table is named `Date`; fiscal columns are driven by
  `engagement.yaml: fiscal_year_start_month`. Source preference follows Microsoft.
- **MOD-03** `_Measures` table (leading underscore sorts it first), all columns hidden; measures
  never live on fact or dimension tables. *(override, see §3)*
- **MOD-04** A bi-directional relationship needs a written justification in `spec.md`.
- **MOD-07** Calculation groups are skipped entirely when the client override says the client cannot
  maintain them; time intelligence is then hand-written per measure.

**Storage mode (process — mechanics are Microsoft's)**
- **MOD-10** The storage-mode decision and rationale are recorded in `spec.md` before build.
- **MOD-12** DirectQuery or Direct Lake requires a documented performance test in the review report.

**Security**
- **MOD-20** RLS roles are named `RLS - <Scope>`; filter expressions sit on dimensions, never facts.
- **MOD-21** No OLS by default. *(override, see §3)*
- **MOD-22** Every role has `USERPRINCIPALNAME()` test fixtures listed in `spec.md`; the review
  records the result. Patterns: `references/rls-patterns.md`.

**DAX (additions to Microsoft's `dax-guidelines.md`)**
- **DAX-04** Every measure has a `formatString` and a business-readable `description` — mandatory,
  the linter fails without it; the handover pack is generated from descriptions.
- **DAX-05** Base measures first, then derived; derived measures reference base measures, never
  re-aggregate columns.
- **DAX-12** Flags return `1`/`0` or `TRUE()`/`FALSE()`, not strings.
- **DAX-13** Selection-aware measures (`ISFILTERED` / `HASONEVALUE`) document the "no selection"
  behaviour in the description.
- **DAX-30** Performance evidence attached to the review: server timings for the five heaviest
  measures on the largest visual in the spec, SE/FE split, a `dax-perf-patterns` pass for anything
  over 50 % formula engine. Diagnosis method is Microsoft's `dax-perf-decision-guide.md`.

**Engagement hygiene**
- Never read client **data** (only metadata) unless `engagement.yaml: allow_data_reads: true`.
- Never place credentials, connection strings or workspace IDs anywhere except `engagement.yaml`
  or environment variables.

Machine-checkable subset: `naming.yaml` (linter), `bpa-rules.json` (Tabular Editor). Same ids.

## 5. Subagents

| Task | Subagent | Notes |
| --- | --- | --- |
| Create / modify model objects | `modeler` | edits TMDL; MCP read-only to verify |
| Review a model | `reviewer` | read-only; BPA + §3–4 + perf; its report records `model_commit` |
| Promote between workspaces | `deployer` | gates and mechanisms in its instructions; refuses `prod` without the token |

**Handoff to the report domain** is the reviewed commit: the passing review records `model_commit`
and the report domain builds against the TMDL at that sha. After any later model change, the report
track re-runs `scripts/check-report-bindings.py --at <new sha>` once a new review passes. Measures
the report domain needs arrive as `clients/<code>/<Model>.model-change-requests.md` — spec revisions,
not ad-hoc additions.

## 6. Output block → decision record

Finish every task with the block below **and** write it into
`<client-root>/decisions/semantic-model/<yyyy-mm-dd>-<slug>.md` using
`skills/engagement-workflow/templates/decision.md` — request, what changed, why (rules, overrides),
questions asked and answered, interventions (hook blocks, corrections), next gate. The Stop hook
refuses to finish a turn that changed `models/` without one. Commit it with the change; the commit
message carries `Decision: decisions/semantic-model/<file>` and `Agent-Session: <id>` trailers. The mechanical
record of what happened (every prompt, tool call and block) is written by hooks to
`<client-root>/audit/` — you never write there.

```
Phase:         <discovery|spec|build|review|deploy|handover>
Changed:       <files / objects>
Rules applied: <MOD-* / DAX-* / CO-* ids that shaped decisions>
Overrides:     <any Microsoft guidance overridden — must have a row in §3>
Next gate:     <what must happen before the next phase>
```
