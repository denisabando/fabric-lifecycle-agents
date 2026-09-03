# Report standards (RPT-*)

Rule ids are cited by the report reviewer and `scripts/check-report-bindings.py`.
Departures from Microsoft are listed in `SKILL.md § Overrides`.

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
- **RPT-04 Firm theme** from the theme in the appendix below unless a client override supplies one;
  colours for measures come from the theme, never hard-coded per visual.
- **RPT-05 Page archetypes**: every page is one of Overview / Trend / Breakdown / Detail
  (Microsoft `powerbi-report-design` archetypes), stated in the report spec, ≤ 8 visuals per page.
- **RPT-06 Accessibility**: alt text on every visual, tab order set, colour-contrast check from
  Microsoft's `accessibility.md` in the review.
- **RPT-07 Names**: pages and visuals get stable, readable `name`s (`salesOverview`,
  `cardNetSales`), not random hex — diffs must be readable to a human reviewer.
- **RPT-08 Glossary titles**: visual titles use glossary business terms, not model object names.

## Appendix — review checklist

- [ ] RPT-00 only PBIR files changed; no `.pbix`, no `localSettings.json` committed
- [ ] `powerbi-report-author validate <Report>.Report` clean
- [ ] RPT-01 `scripts/check-report-bindings.py ... --at <model_commit>` clean; sha matches the latest passing model review
- [ ] RPT-02 no report-level measures / calculated fields
- [ ] RPT-03 `definition.pbir` is `byPath` (build) — deployer will switch
- [ ] RPT-04 theme is the firm theme or a client-approved one; no hard-coded series colours
- [ ] RPT-05 every page has an archetype in the spec, ≤ 8 visuals
- [ ] RPT-06 alt text on every visual, tab order set, contrast checked
- [ ] RPT-07 readable page / visual names
- [ ] RPT-08 visual titles use glossary terms
- [ ] Desktop screenshot of each page attached (MS `screenshot-review.md`)

## Appendix — firm report theme (RPT-04)

Write this to `StaticResources/RegisteredResources/firm-theme.json` and reference it from `report.json`.

```json
{
  "name": "Firm default",
  "dataColors": ["#0f6cbd", "#7c3aed", "#15803d", "#b45309", "#c2410c", "#475569"],
  "background": "#ffffff",
  "foreground": "#1f2a37",
  "tableAccent": "#0f6cbd",
  "textClasses": { "title": { "fontFace": "Segoe UI Semibold", "fontSize": 14 }, "label": { "fontFace": "Segoe UI", "fontSize": 10 } }
}
```
