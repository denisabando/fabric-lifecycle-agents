# Precedence log

```
client override  >  firm rules (fsm-*)  >  Microsoft skill  >  model's own judgement
```

Every place a firm or client rule deliberately overrides Microsoft guidance is recorded here so
it is re-examined on each upstream sync (the sync PR links to this file).

| Date | Rule | Overrides (MS reference) | Why | Re-check on sync |
| ---- | ---- | ------------------------ | --- | ---------------- |
| 2026-09-02 | MS-00 TMDL/PBIP only, no live edits | `SKILL.md` § Tool Selection Priority Tier 1 (MCP live authoring against Desktop / workspace) | every engagement change must be a reviewable, reproducible git diff; MCP allowed read-only against the PBIP folder | yes — re-check if MS changes tiering or adds a TMDL-first mode |
| 2026-09-02 | MS-03 measures in `_Measures` table only | `naming-conventions.md` allows measures on fact tables | consistency across engagements; handover docs generated per table | yes |
| 2026-09-02 | MS-21 no OLS by default | `modeling-guidelines.md` presents OLS as an option | breaks Copilot / Data Agent readiness (MS-30) | yes |
