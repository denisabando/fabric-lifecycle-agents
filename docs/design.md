# Fabric Semantic Model Agent — Design

*Draft, 2 Sept 2026*

## 1. What we are building

A packaged, versioned agent that consultants install on a client BI engagement to design, build, review and deploy Power BI / Fabric semantic models. It stands on Microsoft's own `semantic-model-authoring` skill (from `microsoft/skills-for-fabric`) and adds a firm-owned layer of standards, engagement workflow and client-specific overrides — without ever editing Microsoft's files.

The single design principle: **layer, don't fork.** Microsoft's skill is vendored read-only and pinned to a commit. Everything the firm owns lives beside it, and an orchestrator skill tells the model how the layers combine.

## 2. What Microsoft already gives us

`microsoft/skills-for-fabric` is a plugin marketplace. The relevant bundle is `plugins/powerbi-authoring`, which contains `semantic-model-authoring` (create/edit models in Import, DirectQuery and Direct Lake; tables, relationships, measures, DAX optimisation, BPA analysis, AI-readiness for Copilot/Data Agents; deploy, refresh, permissions) and `powerbi-report-authoring`. The skill routes work through the **Power BI Modeling MCP server** as its primary path, with two fallbacks: direct TMDL editing of PBIP projects, and Fabric REST `getDefinition`/`updateDefinition` for workspace-hosted models. The repo also ships a `check-updates` skill that reads version + changelog from `main` (at most weekly), install instructions for Copilot CLI, Claude Code, Cursor and others, and an `mcp-setup/` folder. The skill is in preview, so its structure and tool names will change — this is the main reason for the pinning and eval strategy below.

## 3. Repository layout

```
fabric-semantic-model-agent/
├── .claude-plugin/
│   ├── plugin.json                 # name, version, skills/agents/hooks paths
│   └── marketplace.json            # so consultants can `/plugin marketplace add <repo>`
├── .mcp.json                       # Power BI Modeling MCP + Fabric REST MCP registration
├── vendor/
│   └── skills-for-fabric/          # git submodule, pinned SHA, READ-ONLY
├── skills/                         # firm-owned overlay (all prefixed fsm- to avoid collisions)
│   ├── fsm-semantic-model/         # ENTRY POINT / orchestrator — the only skill users invoke
│   │   └── SKILL.md
│   ├── fsm-modeling-standards/     # naming, star-schema rules, display folders, calc groups,
│   │   ├── SKILL.md                # date table, RLS/OLS patterns, Direct Lake guardrails
│   │   └── references/
│   ├── fsm-dax-standards/          # DAX style, variable use, anti-patterns, perf checklist
│   ├── fsm-engagement-workflow/    # discovery → spec → build → review → deploy → handover
│   │   ├── SKILL.md
│   │   └── templates/              # requirements questionnaire, model spec, sign-off doc
│   ├── fsm-review/                 # review checklist + how to run BPA with firm rules
│   └── fsm-deployment/             # workspace promotion, deployment pipelines, git integration
├── rules/                          # machine-readable, referenced by skills AND CI
│   ├── bpa-rules.json              # Tabular Editor BPA rule set (MS defaults + firm additions)
│   ├── naming.yaml                 # object naming conventions
│   └── precedence.md               # which layer wins when rules conflict
├── agents/                         # subagent definitions
│   ├── modeler.md                  # builds via MCP/TMDL
│   ├── reviewer.md                 # read-only; runs BPA + checklist, never edits
│   └── deployer.md                 # promotes between workspaces; requires explicit approval
├── hooks/
│   ├── pre-tool-use.sh             # block writes to vendor/ and to prod workspaces w/o approval
│   └── post-edit-tmdl.sh           # lint TMDL + run BPA after any .tmdl change
├── commands/
│   ├── new-engagement.md           # scaffold clients/<name>/ from template
│   ├── review-model.md
│   └── sync-upstream.md            # manual trigger for the update flow
├── clients/
│   ├── _template/
│   │   ├── engagement.yaml         # workspace IDs, capacity, storage mode, env names
│   │   ├── overrides.md            # client-specific rules that beat firm rules
│   │   └── glossary.md             # business terms → model names
│   └── <client-code>/              # one per engagement (or a separate private repo — see §7)
├── evals/
│   ├── scenarios/                  # prompt + expected TMDL/DAX outcomes
│   └── run.sh
├── .github/workflows/
│   ├── upstream-sync.yml           # weekly: bump submodule, diff, open PR
│   ├── evals.yml                   # on PR: run scenario evals + BPA on fixture models
│   └── release.yml                 # tag → version bump → marketplace manifest
├── CHANGELOG.md
└── README.md
```

## 4. How the layers combine (the orchestrator)

`skills/fsm-semantic-model/SKILL.md` is the only skill a consultant invokes (`/fsm-semantic-model build the sales model from clients/acme/spec.md`). It does four things:

1. **Loads the base.** Points the model at `vendor/skills-for-fabric/plugins/powerbi-authoring/skills/semantic-model-authoring/SKILL.md` and says: follow it for *how* to do things (tool routing, MCP calls, TMDL syntax, deployment mechanics).
2. **Applies firm standards.** Loads `fsm-modeling-standards` and `fsm-dax-standards` and says: these govern *what a good model looks like* — naming, structure, DAX style, review gates. Where Microsoft's guidance and firm guidance conflict, firm wins, and the conflict is logged to `rules/precedence.md` so it's reviewed on the next upstream sync.
3. **Applies client overrides.** If `clients/<code>/overrides.md` exists, it beats both. Typical contents: "measures live in a dedicated `_Measures` table", "fiscal year starts July", "no calc groups — client's Tabular Editor licence is free tier".
4. **Runs the engagement workflow.** `fsm-engagement-workflow` defines the phases and the artefact each must produce before the next starts (requirements → approved model spec → TMDL in PBIP → review report → deployment record → handover pack). The agent refuses to build before a spec is approved, and refuses to deploy to a workspace tagged `prod` in `engagement.yaml` without an explicit human confirmation.

Precedence, stated once in `rules/precedence.md` and echoed in the orchestrator:

```
client override  >  firm rules (fsm-*)  >  Microsoft skill  >  model's own judgement
```

Microsoft's skill is never edited. If a firm rule needs to *suppress* something Microsoft recommends, the suppression is written in the firm skill ("ignore the MS guidance on X because Y"), which keeps the diff against upstream clean.

## 5. Keeping the Microsoft base current

Vendoring as a **submodule pinned to a SHA** (not a subtree, not a copy) gives a clean, auditable upstream pointer. The update flow:

- `upstream-sync.yml` runs weekly: `git submodule update --remote`, and if the SHA moved, it diffs `plugins/powerbi-authoring/**`, pulls the upstream changelog (the same data the repo's own `check-updates` skill reads), and opens a PR titled "Upstream: skills-for-fabric <old>..<new>" with the diff summary in the body.
- `evals.yml` runs on that PR: the scenario evals in `evals/` exercise the *combined* agent (base + overlay) against fixture PBIP models, and the BPA rule set runs against the outputs. This is what catches an upstream rename of a tool, a changed MCP invocation, or a new recommendation that contradicts a firm rule.
- A human reviews and merges; `release.yml` cuts a new version. Consultants on live engagements upgrade deliberately (`/plugin update`), never automatically, so a mid-engagement upstream change can't shift the model's behaviour under them.
- `/sync-upstream` is the same flow on demand.

Also worth doing: a small script that extracts every rule-like sentence from the vendored SKILL.md into `rules/upstream-rules.snapshot.md`, so the upstream PR diff shows *guidance* changes, not just text churn.

## 6. Tooling the agent needs on a consultant's machine

- Power BI Desktop with PBIP/TMDL enabled (the source-of-truth format; everything is diffable text).
- Power BI Modeling MCP server (registered via `.mcp.json`; Microsoft's plugin does this on install).
- Fabric REST access — a Fabric MCP or thin CLI wrapper, authenticated as the consultant (or a per-client service principal held outside the repo).
- Tabular Editor 2 CLI for BPA runs in hooks/CI (free), with `rules/bpa-rules.json`.
- Git integration on Fabric workspaces where the client allows it, so deploy = merge.

## 7. Consultant / client concerns

**Client isolation.** No client data, credentials, or workspace IDs beyond `engagement.yaml` in the shared repo. Two acceptable patterns: `clients/` is gitignored except `_template/`, and each engagement keeps its folder in the client's own repo; or `clients/` lives in a separate private repo per client that mounts the agent as a submodule. The second is cleaner for handover — the client keeps their config, the firm keeps the agent.

**Auditability.** Every model change lands as a TMDL diff in git, and the review subagent's report is committed alongside. That's the engagement's evidence trail.

**Guardrails in hooks, not just prose.** Skills are suggestions; hooks are enforcement. The pre-tool-use hook blocks edits under `vendor/`, blocks deployments to prod-tagged workspaces without a confirmation token, and blocks any tool call that would read data (not metadata) from a client source unless the engagement config allows it.

**Handover.** The `handover` phase produces a client-facing pack: model documentation generated from TMDL (tables, measures with descriptions, relationships diagram), the BPA report, and the deployment record. Descriptions on every measure are a firm rule precisely so this can be generated.

**Multi-tool.** Consultants may be forced onto Copilot at some clients. The layout above is plugin-compatible with both Claude Code and Copilot CLI (skills + commands + agents + hooks folders, plugin manifest), so the same repo installs in either.

## 8. Build order

1. Scaffold the repo, add the submodule, write `plugin.json` / `.mcp.json`, confirm the vendored MS skill works unmodified through the orchestrator on a sample PBIP.
2. Write `fsm-modeling-standards` and `fsm-dax-standards` from the firm's existing standards docs; encode the testable ones in `bpa-rules.json` and `naming.yaml`.
3. Add the reviewer subagent + post-edit hook so every TMDL change is linted.
4. Write `fsm-engagement-workflow` with the templates; add the deploy guardrail hook.
5. Build 5–10 eval scenarios from real (anonymised) engagement asks; wire `evals.yml`.
6. Add `upstream-sync.yml` and run it once by hand to prove the PR flow.
7. Tag v1.0.0, publish the marketplace manifest, pilot on one engagement.

## 9. Risks

- Microsoft's skill is preview; expect breaking changes — the pinned SHA + evals are the mitigation, not optional.
- The Power BI Modeling MCP server needs Desktop running locally; CI can only exercise the TMDL/REST fallback paths. Keep evals honest about which path they test.
- Firm rules that silently override Microsoft guidance drift over time. The precedence log and a quarterly "reconcile with upstream" review keep them intentional.
