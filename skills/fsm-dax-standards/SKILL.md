---
name: fsm-dax-standards
description: "Firm DAX standards: formatting, variables, measure patterns, anti-patterns and a performance checklist. Load whenever writing, reviewing or optimising DAX. Extends Microsoft's dax-guidelines and dax-perf references; firm rules win on conflict."
---

# Firm DAX standards

Rule ids `DX-*` are cited by the reviewer. For engine mechanics and optimisation patterns, load
Microsoft's `dax-guidelines.md`, `dax-perf-decision-guide.md` and `dax-perf-patterns.md` from the
vendored skill.

## Style

- **DX-01** Format every measure with DAX Formatter conventions (one function per line, 4-space
  indent, `VAR`/`RETURN` on their own lines).
- **DX-02** Fully qualify columns `'Table'[Column]`; never qualify measures `[Measure]`.
- **DX-03** Use `VAR` for any expression referenced twice or for readability; name variables
  `_CamelCase` with a leading underscore.
- **DX-04** Every measure has a `formatString` and a `description` written for a business reader.
- **DX-05** Base measures first, then derived. Derived measures reference base measures, never
  re-aggregate columns.

## Patterns

- **DX-10** Ratios: `DIVIDE ( num, den )` — never `/`.
- **DX-11** Time intelligence via the `Time Calc` calculation group (MS-07). Do not hand-write
  `YTD`/`PY` variants per measure unless the client override disables calc groups.
- **DX-12** Flags: return `1`/`0` or `TRUE()`/`FALSE()`, not strings.
- **DX-13** Selection-aware measures use `ISFILTERED`/`HASONEVALUE` guards, with a documented
  behaviour for the "no selection" case.

## Anti-patterns (review will fail)

- **DX-20** `FILTER ( 'Fact', ... )` over a whole fact table inside `CALCULATE` when a column
  filter would do.
- **DX-21** Iterators (`SUMX` etc.) over fact tables when a column-level aggregate is equivalent.
- **DX-22** `CALCULATE` with `ALL('Fact')` as a shortcut — use `ALLSELECTED`/`REMOVEFILTERS` on
  the intended dimension.
- **DX-23** Calculated columns on fact tables (push to source or M) — hard block in Direct Lake.
- **DX-24** `IF` chains longer than 3 branches — use `SWITCH ( TRUE (), ... )`.

## Performance checklist (attach to the review report)

1. Server timings for the 5 heaviest measures on the largest visual in the spec.
2. Storage engine vs formula engine split; anything > 50 % FE gets a `dax-perf-patterns` pass.
3. No `CallbackDataID` on hot measures.
4. Cardinality of relationship columns reviewed; high-cardinality datetime keys replaced with
   integer surrogate keys.
