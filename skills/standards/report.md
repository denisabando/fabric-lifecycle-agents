# Report standards (RPT-*)

> **Draft.** Written to exercise the architecture, not agreed by the practice. Everything here is the
> firm's *delta* on Microsoft's `powerbi-report-planning / -design / -authoring / -management` skills.
> Microsoft already covers page archetypes, layout, chart selection, colour, accessibility (alt text,
> tab order, contrast), PBIR mechanics and validation. Those are **not repeated**.

Rule ids are cited by the report reviewer and `scripts/check-report-bindings.py`.

## Overrides of Microsoft guidance

| Rule | Microsoft says (reference) | We do instead | Why |
| ---- | -------------------------- | ------------- | --- |
| **RPT-01** | `powerbi-report-authoring` Quick Start step 2 — read the current TMDL, or ask the live model via MCP, for field names | bind only to visible objects in the model's TMDL at the `model_commit` of the latest passing model review | a report must not depend on unreviewed model state; the reviewed commit is the interface |
| **RPT-07** | `authoring.md` — page and visual `name`s are random 20-hex-char ids | stable, readable names (`salesOverview`, `cardNetSales`) | PBIR diffs must be readable by a human reviewer. Names are free-form strings in the schema; `powerbi-report-author validate` must still pass |

## Rule zero — the diffable path

- **RPT-00 PBIR in git is the only authoring path. No live edits.** Reports are
  `<Report>.Report/definition/**` JSON in the client repo; every change is a file edit + commit. Never
  author in the service; never save or commit `.pbix`; Power BI Desktop is for `powerbi-desktop`
  reload / screenshot verification only. (Consistent with Microsoft — stated as rule zero to match
  MOD-00.)

## Binding to the model

- **RPT-01** Bind to the reviewed model commit, visible objects only. `scripts/check-report-bindings.py
  <Report>.Report <Model>.SemanticModel --at <sha>` enforces it; the reviewer fails the report
  otherwise. If the model is re-reviewed at a new commit, re-run and re-pin. *(override — see table)*
- **RPT-02** No report-level measures or calculated fields. A missing number is a model change
  request (`clients/<code>/<Model>.model-change-requests.md`), not a workaround in the report.
- **RPT-03** `definition.pbir` uses `byPath` to the sibling `.SemanticModel` during build; the
  deployer switches it to `byConnection` for the target workspace.

## Presentation (additions to Microsoft's design skill)

- **RPT-04** The firm theme (appendix) unless a client override supplies one; series colours come
  from the theme, never hard-coded per visual.
- **RPT-07** Readable page and visual names. *(override — see table)*
- **RPT-08** Visual titles use glossary business terms, not model object names.

## Appendix — review checklist

- [ ] RPT-00 only PBIR files changed; no `.pbix`, no `localSettings.json`
- [ ] `powerbi-report-author validate <Report>.Report` clean
- [ ] RPT-01 `check-report-bindings.py --at <model_commit>` clean; sha matches the latest passing model review
- [ ] RPT-02 no report-level measures
- [ ] RPT-03 `byPath` during build
- [ ] RPT-04 firm or client-approved theme; no hard-coded series colours
- [ ] RPT-07 readable names · RPT-08 glossary titles
- [ ] Microsoft's `pre-flight-checklist.md` and `accessibility.md` walked
- [ ] Desktop screenshot of each page attached

## Appendix — firm report theme (RPT-04)

Write to `StaticResources/RegisteredResources/firm-theme.json` and reference from `report.json`.

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
