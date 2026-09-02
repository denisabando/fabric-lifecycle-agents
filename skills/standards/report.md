# Report standards (RPT-*)

Rule ids are cited by the report reviewer and `scripts/check-report-bindings.py`.

- **RPT-00 PBIR in git is the only authoring path. No live edits.** Reports are
  `<Report>.Report/definition/**` JSON in the client repo; every change is a file edit + commit.
  Never author in the service, never save or commit `.pbix`, never use Power BI Desktop as the
  place changes are made (Desktop is for `powerbi-desktop` reload / screenshot verification
  only). Overrides nothing in Microsoft's skill (it is PBIR-native) but is stated as rule zero
  to match MOD-00.
- **RPT-01 Bind to the reviewed model commit, visible objects only.** Every `Column` / `Measure`
  expression in a `visual.json`, filter or sort must resolve to a visible object in the model's
  TMDL at the `model_commit` of the latest passing model review — not the working tree, not a
  live model. `scripts/check-report-bindings.py <Report>.Report <Model>.SemanticModel --at <sha>`
  enforces this; the reviewer fails the report otherwise. If the model is re-reviewed at a new
  commit, re-run the check and re-pin.
- **RPT-02 No report-level measures or calculated fields.** If a number is missing, raise a
  model change request (`clients/<code>/<Model>.model-change-requests.md`); do not work around
  it in the report. (Overrides the MS authoring skill's allowance for report measures — logged.)
- **RPT-03 Binding mode**: `definition.pbir` uses `byPath` to the sibling `.SemanticModel` in the
  repo during build; the deployer switches to `byConnection` for the target workspace.
- **RPT-04 Firm theme** from `report-theme.json` unless a client override supplies one;
  colours for measures come from the theme, never hard-coded per visual.
- **RPT-05 Page archetypes**: every page is one of Overview / Trend / Breakdown / Detail
  (Microsoft `powerbi-report-design` archetypes), stated in the report spec, ≤ 8 visuals per page.
- **RPT-06 Accessibility**: alt text on every visual, tab order set, colour-contrast check from
  Microsoft's `accessibility.md` in the review.
- **RPT-07 Names**: pages and visuals get stable, readable `name`s (`salesOverview`,
  `cardNetSales`), not random hex — diffs must be readable to a human reviewer.
- **RPT-08 Glossary titles**: visual titles use glossary business terms, not model object names.

Where these rules depart from Microsoft's guidance, the departure is recorded in `overrides.md`.
Review checklist: `report-review-checklist.md`.
