---
name: fsm-engagement-workflow
description: "The consulting engagement workflow for semantic model delivery: discovery → model spec → build → review → deploy → handover. Defines the artefact each phase must produce, the approval gates between phases, and the templates to use. Load at the start of any engagement task and whenever the user asks 'what's next' or 'where are we'."
---

# Engagement workflow

Each phase produces one artefact under `clients/<code>/`. The next phase may not start until
that artefact exists (and, where marked, is approved). Gates are also enforced by hooks.

| # | Phase | Artefact | Gate to leave phase | Subagent |
| - | ----- | -------- | ------------------- | -------- |
| 1 | Discovery | `requirements.md` (from `templates/requirements.md`) | consultant marks `status: complete` | — |
| 2 | Model spec | `spec.md` (from `templates/model-spec.md`) | **client sign-off**: `status: approved` + approver + date | — |
| 3 | Build | PBIP project under `models/<Model>.SemanticModel/` — TMDL in git | all TMDL committed; post-edit hook clean | `modeler` |
| 4 | Review | `reviews/<Model>-<yyyymmdd>.md` (from `templates/review-report.md`) | **BPA pass** (no `Error` severity) + checklist complete | `reviewer` |
| 5 | Deploy | `deployments/<Model>-<env>-<yyyymmdd>.md` | **prod confirmation token** for prod | `deployer` |
| 6 | Handover | `handover/<Model>/` (model docs generated from TMDL + BPA report + deployment record) | client acceptance | — |

## Phase notes

**Discovery.** Run the questionnaire in `templates/requirements.md` with the client. Capture
business questions, grains, sources, refresh needs, security scope, consumers (reports, Copilot,
Data Agents), and constraints (licensing, tooling the client can maintain). Populate
`glossary.md` as terms come up.

**Model spec.** Translate requirements into tables (with grain), dimensions, measures (name,
description, formula intent, format), relationships, storage mode decision (MS-10/11/12), RLS
scope, and the top 20 glossary terms for synonyms. The spec is the contract — the agent builds
*only* what is in it. Changes after approval go through a spec revision, not straight into TMDL.

**Build.** Follow `fsm-semantic-model`. Work in small commits (one table / one measure group per
commit). The post-edit hook lints TMDL and runs BPA after every `.tmdl` change; fix findings
before moving on.

**Review.** `reviewer` is read-only. It runs Tabular Editor BPA with `rules/bpa-rules.json`,
walks the `fsm-review` checklist, runs the DAX performance checklist, and writes the report.
Findings go back to Build.

**Deploy.** `deployer` promotes dev → test → prod using the mechanism in `engagement.yaml`
(`deployment_pipeline` | `git_integration` | `rest_updateDefinition`). Prod requires the human
to type the confirmation token printed by the hook.

**Handover.** Generate documentation from TMDL (tables, columns, measures with descriptions,
relationships diagram), bundle the latest review report and deployment record, and produce the
client-facing pack from `templates/handover.md`.

## Status check

When asked "where are we", list the six phases with ✅ / ⏳ / ⬜ based on which artefacts exist
and their `status:` field, and name the next gate.
