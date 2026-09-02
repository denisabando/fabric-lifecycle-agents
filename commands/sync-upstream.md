---
description: Check microsoft/skills-for-fabric for updates and prepare the sync PR locally
---

Run `scripts/sync-upstream.sh`. It fetches the submodule's upstream `main`, reports whether the
pinned SHA moved, and if so prints the diff summary for `plugins/powerbi-authoring/**` and the
new upstream CHANGELOG entries. Then:
1. Read the diff. For each changed *guidance* item, check `rules/precedence.md` — does an
   existing override still make sense? Does a new MS recommendation contradict a firm rule?
2. Run `evals/run.sh` against the bumped submodule.
3. Summarise: what changed upstream, what it means for firm rules, eval result, recommended
   action (merge / adjust overlay / add suppression). Do NOT edit files under vendor/.
