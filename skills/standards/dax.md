# DAX standards (DAX-*)

Rule ids `DAX-*` are cited by the reviewer. For engine mechanics and optimisation patterns, load
Microsoft's `dax-guidelines.md`, `dax-perf-decision-guide.md` and `dax-perf-patterns.md` from the
vendored skill.

## Style

- **DAX-01** Format every measure with DAX Formatter conventions (one function per line, 4-space
  indent, `VAR`/`RETURN` on their own lines).
- **DAX-02** Fully qualify columns `'Table'[Column]`; never qualify measures `[Measure]`.
- **DAX-03** Use `VAR` for any expression referenced twice or for readability; name variables
  `_CamelCase` with a leading underscore.
- **DAX-04** Every measure has a `formatString` and a `description` written for a business reader.
- **DAX-05** Base measures first, then derived. Derived measures reference base measures, never
  re-aggregate columns.

## Patterns

- **DAX-10** Ratios: `DIVIDE ( num, den )` — never `/`.
- **DAX-11** Time intelligence via the `Time Calc` calculation group (MOD-07). Do not hand-write
  `YTD`/`PY` variants per measure unless the client override disables calc groups.
- **DAX-12** Flags: return `1`/`0` or `TRUE()`/`FALSE()`, not strings.
- **DAX-13** Selection-aware measures use `ISFILTERED`/`HASONEVALUE` guards, with a documented
  behaviour for the "no selection" case.

## Anti-patterns (review will fail)

- **DAX-20** `FILTER ( 'Fact', ... )` over a whole fact table inside `CALCULATE` when a column
  filter would do.
- **DAX-21** Iterators (`SUMX` etc.) over fact tables when a column-level aggregate is equivalent.
- **DAX-22** `CALCULATE` with `ALL('Fact')` as a shortcut — use `ALLSELECTED`/`REMOVEFILTERS` on
  the intended dimension.
- **DAX-23** Calculated columns on fact tables (push to source or M) — hard block in Direct Lake.
- **DAX-24** `IF` chains longer than 3 branches — use `SWITCH ( TRUE (), ... )`.

## Performance checklist (attach to the review report)

1. Server timings for the 5 heaviest measures on the largest visual in the spec.
2. Storage engine vs formula engine split; anything > 50 % FE gets a `dax-perf-patterns` pass.
3. No `CallbackDataID` on hot measures.
4. Cardinality of relationship columns reviewed; high-cardinality datetime keys replaced with
   integer surrogate keys.
