---
description: Commit the current work with the trail trailers, push the feature branch, open a pull request
argument-hint: [target branch, default = the dev environment's branch]
---

Read `git:` in `<client-root>/engagement.yaml`. Then:

1. **Branch.** You must be on a branch named `<git.branch_prefix><something>` (default `feature/`).
   If you are on a protected branch (any environment's `branch`, or `git.default_branch`), create
   `feature/<yyyy-mm-dd>-<slug>` from the target branch first. Never commit on a protected branch —
   the pre-tool-use hook will refuse anyway.
2. **Checks.** Run `node scripts/lint-tmdl.js` on every changed `.tmdl`, `node scripts/check-report-bindings.js`
   for any changed report, and `node scripts/check-trail.js <client-root> --since <target>` — all clean.
3. **Decision record.** A decision record for this work must exist under `decisions/<skill>/`. If not,
   write it now (§6 of the domain skill).
4. **Commit** with the trail trailers, one logical change per commit. The trailers must be the LAST
   paragraph of the message, together (git only recognises trailers in the final block):
   ```
   model(<Model>): <what>            (or report(<Report>): <what>)

   Decision: decisions/<skill>/<file>.md
   Agent-Session: <session id>
   Rules: <MOD-* / DAX-* / RPT-* / CO-* ids>
   ```
5. **Push** the branch and open the PR with GitHub's CLI:
   `gh pr create --base <target> --title "<subject>" --body-file <tmp>` where the body follows
   `.github/pull_request_template.md` in the client repo — links to the decision record and the
   latest review report, the rules applied, the `model_commit` a report is pinned to, and the checklist.
   Request a reviewer if `git.reviewers` is set.
6. Report the PR URL. **Merging is a human act on GitHub.** The prod environment's branch is reached only
   by a PR from the dev/test branch that a person approves; you never push to it.
