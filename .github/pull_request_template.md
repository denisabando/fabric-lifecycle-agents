<!-- Fabric Lifecycle Agents — PR template. Every PR that touches models/ links its trail. -->

## What
<one line — same as the commit subject>

## Trail
- Decision record: `decisions/<skill>/<file>.md`
- Review report: `reviews/<...>.md` (result: pass | fail | not yet reviewed)
- Model commit a report is pinned to (report PRs only): `<sha>`
- Rules applied: <MOD-* / DAX-* / RPT-* / CO-* ids>
- Microsoft guidance overridden: <rule id and §3 row, or "none">

## Checks (run by hooks / CI — tick what you saw)
- [ ] `node scripts/lint-tmdl.js` clean on changed TMDL
- [ ] `node scripts/check-report-bindings.js` clean on changed reports
- [ ] `node scripts/check-trail.js <client-root> --since <base>` — 0 unattributed commits
- [ ] No files under `vendor/`, no `.pbix`, no `localSettings.json`
- [ ] `audit/` and `decisions/` committed with the work

## Reviewer
- [ ] I read the decision record and agree with the reasoning
- [ ] If this targets the prod branch: a passing review exists for this exact commit
