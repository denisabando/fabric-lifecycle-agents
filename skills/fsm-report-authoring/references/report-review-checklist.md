# Report review checklist (RP-*)

- [ ] RP-00 only PBIR files changed; no `.pbix`, no `localSettings.json` committed
- [ ] `powerbi-report-author validate <Report>.Report` clean
- [ ] RP-01 `scripts/check-report-bindings.py ... --at <model_commit>` clean; sha matches the latest passing model review
- [ ] RP-02 no report-level measures / calculated fields
- [ ] RP-03 `definition.pbir` is `byPath` (build) — deployer will switch
- [ ] RP-04 theme is the firm theme or a client-approved one; no hard-coded series colours
- [ ] RP-05 every page has an archetype in the spec, ≤ 8 visuals
- [ ] RP-06 alt text on every visual, tab order set, contrast checked
- [ ] RP-07 readable page / visual names
- [ ] RP-08 visual titles use glossary terms
- [ ] Desktop screenshot of each page attached (MS `screenshot-review.md`)
