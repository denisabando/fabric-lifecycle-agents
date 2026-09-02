---
name: fsm-modeling-standards
description: "Firm modelling standards for Power BI / Fabric semantic models: star schema rules, naming, display folders, date table, calculation groups, RLS/OLS patterns, storage-mode selection and Direct Lake guardrails. Load whenever creating or changing model structure. Sits ABOVE Microsoft's modeling-guidelines in precedence; below client overrides."
---

# Firm modelling standards

Rule ids are referenced by the reviewer and by `rules/bpa-rules.json`. Cite them in your output.

## Structure

- **MS-01 Star schema, always.** One fact grain per fact table. Snowflakes only where a client
  override permits. No fact-to-fact relationships; use a shared dimension or a bridge.
- **MS-02 One conformed Date table**, named `Date`, marked as date table, hidden `DateKey`,
  fiscal columns driven by `engagement.yaml: fiscal_year_start_month`.
- **MS-03 Dedicated measures table** named `_Measures` (leading underscore sorts it first),
  all columns hidden. Measures never live on fact tables.
- **MS-04 Relationships**: single-direction from dimension to fact by default. Bi-directional
  only with a written justification in `spec.md`. Many-to-many only via bridge tables.
- **MS-05 Hide plumbing**: all key columns, all fact columns that have a measure, all
  technical columns (`_LoadDate`, `_SourceSystem`) are hidden.
- **MS-06 Display folders** on every visible column and every measure. Folder names come from
  the client glossary where one exists.
- **MS-07 Calculation groups** for time intelligence (`Time Calc`) and for unit/currency
  switching. Not for anything a plain measure expresses. Skip entirely if the client override
  says the client cannot maintain them.

## Naming (enforced by `rules/naming.yaml`)

- Tables: business names, singular, Title Case, spaces allowed (`Customer`, `Sales Order`).
- Columns: Title Case with spaces; no prefixes; no source-system abbreviations.
- Measures: Title Case; units in the name when ambiguous (`Revenue (USD)`, `Orders #`).
- Keys: `<Entity>Key`, hidden.
- No object name may contain the source table name (`dbo_`, `vw_`, `stg_`).

## Storage mode

- **MS-10** Default to **Import** unless data volume, freshness or a Fabric-native source argues
  otherwise; record the decision in `spec.md`.
- **MS-11 Direct Lake** only when the source is a Lakehouse/Warehouse in the same tenant and
  the model needs no calculated columns / M transforms. Follow Microsoft's
  `direct-lake-guidelines.md` for mechanics. Composite fallback behaviour must be explicit.
- **MS-12** DirectQuery requires a documented performance test in the review report.

## Security

- **MS-20** RLS roles named `RLS - <Scope>`; filter expressions on dimensions, never on facts.
- **MS-21** OLS only via a client override — it breaks Copilot / Data Agent readiness.
- **MS-22** Test every role with `USERPRINCIPALNAME()` fixtures listed in `spec.md`.

## AI readiness (Copilot / Data Agents)

- **MS-30** Every visible table, column and measure has a description. Synonyms on the top
  20 business terms from the glossary. This is also what the handover pack is built from.

## Explicit overrides of Microsoft guidance

Anything listed here must also be logged in `rules/precedence.md`.

- Microsoft's naming guidance permits measures on fact tables; **MS-03** forbids it (firm
  standard for consistency across engagements and for handover documentation).

See `references/rls-patterns.md` for worked RLS examples.
