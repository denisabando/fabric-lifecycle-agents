# Semantic model standards (MOD-*, DAX-*)

> **Draft.** Written to exercise the architecture, not agreed by the practice. Replace or extend before
> real use. Everything here is the firm's *delta* on Microsoft's `semantic-model-authoring` skill:
> Microsoft already covers star schema, hiding keys, relationship direction, calculation groups,
> display folders, naming without technical prefixes, `VAR`, `DIVIDE`, DAX anti-patterns, performance
> tuning and Copilot readiness. Those are **not repeated** — the agent gets them from `vendor/`.

Rule ids are cited by the reviewer, the linter and `bpa-rules.json`.

## Overrides of Microsoft guidance

The only places where this file contradicts the vendored skill. The upstream-sync PR links here so each
row is re-examined when Microsoft changes. Anything not in this table is additive.

| Rule | Microsoft says (reference) | We do instead | Why |
| ---- | -------------------------- | ------------- | --- |
| **MOD-00** | `SKILL.md` § Tool Selection Priority — Tier 1 is live authoring through the Modeling MCP against Desktop, a workspace or a PBIP folder | TMDL/PBIP files in git are the only authoring path; MCP is read-only | every engagement change must be a reviewable, reproducible, attributable git diff |
| **MOD-03** | `naming-conventions.md` puts measures on the table they aggregate, organised by display folder | all measures in one dedicated `_Measures` table | consistency across engagements; handover docs generated per table |
| **MOD-21** | `naming-conventions.md` / `semantic-model-ai-readiness.md` treat OLS as a normal option | no OLS unless a client override asks for it | OLS breaks Copilot / Data Agent readiness |

## Rule zero — the diffable path

- **MOD-00 TMDL/PBIP is the only authoring path. No live edits.** The model of record is the PBIP
  project's `<Model>.SemanticModel/definition/*.tmdl` in the client's git repo; every change is a
  file edit followed by a commit.
  - Never author against a live model: not Desktop, not a workspace, not the service UI.
  - Never use the Power BI Modeling MCP for writes. Read-only use (inspect, validate DAX, analyse
    best practices) against the local PBIP folder is fine.
  - Changes reach a workspace only from committed TMDL: workspace git integration, or
    `updateDefinition` from the committed definition folder.
  - A model that exists only as `.pbix` or only in a workspace is first exported to PBIP
    (Microsoft's *Export to PBIP* workflow) and committed as the baseline.

## Structure (additions to Microsoft)

- **MOD-02 Date table** is named `Date`; fiscal columns are driven by
  `engagement.yaml: fiscal_year_start_month`. Source preference follows Microsoft (use the
  source's date table; generate only if none exists).
- **MOD-03 Dedicated measures table** `_Measures` (leading underscore sorts it first), all columns
  hidden. Measures never live on fact or dimension tables. *(override — see table above)*
- **MOD-04 Bi-directional relationships** need a written justification in `spec.md`.
- **MOD-07 Calculation groups** are skipped entirely when the client override says the client
  cannot maintain them; time intelligence is then hand-written per measure.

## Storage mode (process, not mechanics — mechanics are Microsoft's)

- **MOD-10** The storage-mode decision (Import / DirectQuery / Direct Lake / composite) and its
  rationale are recorded in `spec.md` before build.
- **MOD-12** DirectQuery or Direct Lake requires a documented performance test in the review report.

## Security

- **MOD-20** RLS roles are named `RLS - <Scope>`; filter expressions sit on dimensions, never facts.
- **MOD-21** No OLS by default. *(override — see table above)*
- **MOD-22** Every role has `USERPRINCIPALNAME()` test fixtures listed in `spec.md`, and the review
  records the result.

## DAX (additions to Microsoft's `dax-guidelines.md`)

- **DAX-04** Every measure has a `formatString` and a business-readable `description`. Microsoft
  recommends this; here it is mandatory and the linter fails without it. The handover pack is
  generated from the descriptions.
- **DAX-05** Base measures first, then derived. Derived measures reference base measures, never
  re-aggregate columns.
- **DAX-12** Flags return `1`/`0` or `TRUE()`/`FALSE()`, not strings.
- **DAX-13** Selection-aware measures (`ISFILTERED` / `HASONEVALUE`) document the "no selection"
  behaviour in the description.
- **DAX-30 Performance evidence** attached to the review report: server timings for the five
  heaviest measures on the largest visual in the spec, SE/FE split, and a `dax-perf-patterns` pass
  for anything over 50 % formula engine. Diagnosis method is Microsoft's `dax-perf-decision-guide.md`.

## Appendix — RLS patterns

**A. Static role per scope.** Role `RLS - EMEA`: `'Region'[Region Code] = "EMEA"`.

**B. Dynamic via security table.** Table `Security User Region` (UserPrincipalName, RegionKey),
hidden, single-direction to `Region`, then `Region` → `Sales`. Role `RLS - Dynamic Region`:

```dax
'Region'[RegionKey] IN
    CALCULATETABLE (
        VALUES ( 'Security User Region'[RegionKey] ),
        'Security User Region'[UserPrincipalName] = USERPRINCIPALNAME ()
    )
```

**C. Direct Lake.** As B, but the security table must exist in the Lakehouse; RLS on Direct Lake
falls back to DirectQuery for the filtered tables — record that in `spec.md` and test it (MOD-22).
