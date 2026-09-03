---
name: engagement-workflow
description: "The consulting engagement workflow for semantic model delivery: discovery → model spec → build → review → deploy → handover. Defines the artefact each phase must produce, the approval gates between phases, and the templates to use. Load at the start of any engagement task and whenever the user asks 'what's next' or 'where are we'."
---

# Engagement workflow

Each phase produces one artefact under `clients/<code>/`. The next phase may not start until
that artefact exists (and, where marked, is approved). Gates are also enforced by hooks.

| # | Phase | Artefact | Gate to leave phase | Subagent |
| - | ----- | -------- | ------------------- | -------- |
| 1 | Discovery | `requirements.md` (from `templates/requirements.md`) | consultant marks `status: complete` | — |
| 2 | Model spec | `spec.md` (from `templates/model-spec.md`) | **client sign-off**: `status: approved` + approver + date | — |
| 3 | Build | PBIP project under `models/<Model>.SemanticModel/` — TMDL in git, on a `feature/` branch | `/pr` opened into the dev branch; hook checks clean | `modeler` |
| 4 | Review | `reviews/<Model>-<yyyymmdd>.md` (from `templates/review-report.md`) | **BPA pass** (no `Error` severity) + checklist complete | `reviewer` |
| 5 | Deploy | `deployments/<Model>-<env>-<yyyymmdd>.md` | PR into the environment's branch merged by a human; workspace *Update from git* | `deployer` |
| 6 | Handover | `handover/<Model>/` (model docs generated from TMDL + BPA report + deployment record) | client acceptance | — |

## Report track (downstream domain)

Starts only when the model track has a **passing review** whose `model_commit` the report can
pin to. If the model is changed and re-reviewed later, the report's binding check is re-run against
the new sha and Review reopens if anything broke.

| # | Phase | Artefact | Gate to leave phase | Subagent |
| - | ----- | -------- | ------------------- | -------- |
| R1 | Report spec | `_brief/report-spec.md` (Microsoft `powerbi-report-planning`) | client sign-off `status: approved` | — |
| R2 | Design | design brief in the spec (Microsoft `powerbi-report-design`) | consultant accepts | — |
| R3 | Build | `models/<Report>.Report/definition/**` PBIR in git | `powerbi-report-author validate` + `check-report-bindings.js --at <model_commit>` clean | (report) |
| R4 | Review | `reviews/<Report>-report-<yyyymmdd>.md` | `result: pass` | `report-reviewer` |
| R5 | Deploy | `deployments/<Report>-<env>-<yyyymmdd>.md` | model already in that env; PR into the env branch merged | `deployer` |
| R6 | Handover | added to the model's handover pack | client acceptance | — |

## Phase notes

**Discovery.** Run the questionnaire in `templates/requirements.md` with the client. Capture
business questions, grains, sources, refresh needs, security scope, consumers (reports, Copilot,
Data Agents), and constraints (licensing, tooling the client can maintain). Populate
`glossary.md` as terms come up.

**Model spec.** Translate requirements into tables (with grain), dimensions, measures (name,
description, formula intent, format), relationships, storage mode decision (MOD-10/11/12), RLS
scope, and the top 20 glossary terms for synonyms. The spec is the contract — the agent builds
*only* what is in it. Changes after approval go through a spec revision, not straight into TMDL.

**Build.** Follow `semantic-model`. Work in small commits (one table / one measure group per
commit). The post-edit hook lints TMDL and runs BPA after every `.tmdl` change; fix findings
before moving on.

**Review.** `reviewer` is read-only. It runs Tabular Editor BPA with `skills/semantic-model/bpa-rules.json`,
walks the firm checklist, runs the DAX performance checklist, and writes the report with the
`model_commit` it reviewed — that sha is the handoff to the report track.
Findings go back to Build.

**Deploy.** `deployer` (its instructions carry the gates and mechanisms) promotes dev → test → prod using the mechanism in `engagement.yaml`
(`deployment_pipeline` | `git_integration` | `rest_updateDefinition`). Prod requires the human
to type the confirmation token printed by the hook.

**Handover.** Generate documentation from TMDL (tables, columns, measures with descriptions,
relationships diagram), bundle the latest review report and deployment record, and produce the
client-facing pack from `templates/handover.md`.

## Git workflow (all domains)

One branch per environment (`engagement.yaml: environments[].branch`, default `dev` / `test` / `main`),
each Fabric workspace's git integration tracking its branch. The agent works only on `feature/*` branches
and never commits to, pushes to, or merges into an environment branch — the pre-tool-use hook refuses.
Work reaches `dev` by `/pr`; `test` and `main` by PRs a human approves. Every commit touching `models/`
carries `Decision:` and `Agent-Session:` trailers; `scripts/check-trail.js` lists any that do not —
usually a change made in the Fabric service and committed from the workspace, which bypassed the agent
and needs review before it goes further. Configure branch protection on GitHub for the environment
branches (the plugin cannot enforce that side).

## Status check

When asked "where are we", list the six model phases and, if a report spec exists, the six report phases, with ✅ / ⏳ / ⬜ based on which artefacts exist
and their `status:` field, and name the next gate.
