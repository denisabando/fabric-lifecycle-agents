# Semantic model standards (MOD-*, DAX-*)

Rule ids are cited by the reviewer, the linter and `bpa-rules.json`. Cite them in your output.
Departures from Microsoft are listed in `SKILL.md § Overrides`.

## Rule zero — the diffable path

- **MOD-00 TMDL/PBIP is the only authoring path. No live edits.** The model of record is the
  PBIP project's `<Model>.SemanticModel/definition/*.tmdl` files in the client's git repo. Every
  change to a model is a file edit followed by a commit. Concretely:
  - **Never** author against a live model: not a running Power BI Desktop instance, not a
    semantic model in a Fabric workspace, not through the service UI or web modelling.
  - **Never** use the Power BI Modeling MCP for write operations (create / update / delete /
    rename / apply). MCP may be used **read-only** — connected to the local PBIP folder — for
    inspection, DAX validation and best-practice analysis.
  - Changes reach a workspace only from committed TMDL: workspace git integration (branch sync)
    or `updateDefinition` from the committed definition folder. Never edit in the service.
  - If a model exists only as a `.pbix` or only in a workspace, the first step is to export it
    to PBIP (Microsoft's *Export to PBIP* workflow), commit that baseline, and work from there.
  - This **overrides Microsoft's Tool Selection Priority Tier 1** (MCP live authoring). Logged in
    `SKILL.md § Overrides`. Reason: on an engagement every change must be reviewable as a diff,
    reproducible from git, and attributable — a live edit is none of those.

## Structure

- **MOD-01 Star schema, always.** One fact grain per fact table. Snowflakes only where a client
  override permits. No fact-to-fact relationships; use a shared dimension or a bridge.
- **MOD-02 One conformed Date table**, named `Date`, marked as date table, hidden `DateKey`,
  fiscal columns driven by `engagement.yaml: fiscal_year_start_month`.
- **MOD-03 Dedicated measures table** named `_Measures` (leading underscore sorts it first),
  all columns hidden. Measures never live on fact tables.
- **MOD-04 Relationships**: single-direction from dimension to fact by default. Bi-directional
  only with a written justification in `spec.md`. Many-to-many only via bridge tables.
- **MOD-05 Hide plumbing**: all key columns, all fact columns that have a measure, all
  technical columns (`_LoadDate`, `_SourceSystem`) are hidden.
- **MOD-06 Display folders** on every visible column and every measure. Folder names come from
  the client glossary where one exists.
- **MOD-07 Calculation groups** for time intelligence (`Time Calc`) and for unit/currency
  switching. Not for anything a plain measure expresses. Skip entirely if the client override
  says the client cannot maintain them.

## Naming (enforced by `naming.yaml`)

- Tables: business names, singular, Title Case, spaces allowed (`Customer`, `Sales Order`).
- Columns: Title Case with spaces; no prefixes; no source-system abbreviations.
- Measures: Title Case; units in the name when ambiguous (`Revenue (USD)`, `Orders #`).
- Keys: `<Entity>Key`, hidden.
- No object name may contain the source table name (`dbo_`, `vw_`, `stg_`).

## Storage mode

- **MOD-10** Default to **Import** unless data volume, freshness or a Fabric-native source argues
  otherwise; record the decision in `spec.md`.
- **MOD-11 Direct Lake** only when the source is a Lakehouse/Warehouse in the same tenant and
  the model needs no calculated columns / M transforms. Follow Microsoft's
  `direct-lake-guidelines.md` for mechanics. Composite fallback behaviour must be explicit.
- **MOD-12** DirectQuery requires a documented performance test in the review report.

## Security

- **MOD-20** RLS roles named `RLS - <Scope>`; filter expressions on dimensions, never on facts.
- **MOD-21** OLS only via a client override — it breaks Copilot / Data Agent readiness.
- **MOD-22** Test every role with `USERPRINCIPALNAME()` fixtures listed in `spec.md`.

## AI readiness (Copilot / Data Agents)

- **MOD-30** Every visible table, column and measure has a description. Synonyms on the top
  20 business terms from the glossary. This is also what the handover pack is built from.

For engine mechanics and optimisation patterns, load
Microsoft's `dax-guidelines.md`, `dax-perf-decision-guide.md` and `dax-perf-patterns.md` from the
vendored skill.

## DAX style

- **DAX-01** Format every measure with DAX Formatter conventions (one function per line, 4-space
  indent, `VAR`/`RETURN` on their own lines).
- **DAX-02** Fully qualify columns `'Table'[Column]`; never qualify measures `[Measure]`.
- **DAX-03** Use `VAR` for any expression referenced twice or for readability; name variables
  `_CamelCase` with a leading underscore.
- **DAX-04** Every measure has a `formatString` and a `description` written for a business reader.
- **DAX-05** Base measures first, then derived. Derived measures reference base measures, never
  re-aggregate columns.

## DAX patterns

- **DAX-10** Ratios: `DIVIDE ( num, den )` — never `/`.
- **DAX-11** Time intelligence via the `Time Calc` calculation group (MOD-07). Do not hand-write
  `YTD`/`PY` variants per measure unless the client override disables calc groups.
- **DAX-12** Flags: return `1`/`0` or `TRUE()`/`FALSE()`, not strings.
- **DAX-13** Selection-aware measures use `ISFILTERED`/`HASONEVALUE` guards, with a documented
  behaviour for the "no selection" case.

## DAX anti-patterns (review will fail)

- **DAX-20** `FILTER ( 'Fact', ... )` over a whole fact table inside `CALCULATE` when a column
  filter would do.
- **DAX-21** Iterators (`SUMX` etc.) over fact tables when a column-level aggregate is equivalent.
- **DAX-22** `CALCULATE` with `ALL('Fact')` as a shortcut — use `ALLSELECTED`/`REMOVEFILTERS` on
  the intended dimension.
- **DAX-23** Calculated columns on fact tables (push to source or M) — hard block in Direct Lake.
- **DAX-24** `IF` chains longer than 3 branches — use `SWITCH ( TRUE (), ... )`.

## DAX performance checklist (attach to the review report)

1. Server timings for the 5 heaviest measures on the largest visual in the spec.
2. Storage engine vs formula engine split; anything > 50 % FE gets a `dax-perf-patterns` pass.
3. No `CallbackDataID` on hot measures.
4. Cardinality of relationship columns reviewed; high-cardinality datetime keys replaced with
   integer surrogate keys.

## Appendix — RLS patterns (MOD-20..22)

## Pattern A — static role per region
Role `RLS - EMEA`: `'Region'[Region Code] = "EMEA"`

## Pattern B — dynamic via security table
Table `Security User Region` (UserPrincipalName, RegionKey), hidden, single-direction to `Region`,
then `Region` → `Sales`. Role `RLS - Dynamic Region`:
```dax
'Region'[RegionKey] IN
    CALCULATETABLE (
        VALUES ( 'Security User Region'[RegionKey] ),
        'Security User Region'[UserPrincipalName] = USERPRINCIPALNAME ()
    )
```

## Pattern C — Direct Lake
Same as B, but the security table must exist in the Lakehouse; RLS with Direct Lake falls back to
DirectQuery for the filtered tables — say so in `spec.md` and test it (MOD-22).
