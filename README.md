# Fabric Semantic Model Agent

A packaged, versioned agent that consultants install on a client BI engagement to design, build,
review and deploy Power BI / Microsoft Fabric semantic models.

It stands on Microsoft's own `semantic-model-authoring` skill (vendored from
[microsoft/skills-for-fabric](https://github.com/microsoft/skills-for-fabric), pinned to a commit)
and adds a firm-owned layer of modelling standards, an engagement workflow, review gates and
per-client overrides — **without ever editing Microsoft's files**.

> **Design principle: layer, don't fork.**
> `vendor/` is read-only. Everything the firm owns lives beside it under `skills/fsm-*`, `rules/`,
> `agents/`, `hooks/` and `commands/`, and the orchestrator skill says how the layers combine.

## Precedence

```
client override  >  firm rules (fsm-*)  >  Microsoft skill  >  model's own judgement
```

Microsoft's skill says **how** (tool routing, TMDL syntax, MCP calls, deployment mechanics).
Firm skills say **what good looks like** (naming, structure, DAX style, review gates).
Client overrides adjust both for one engagement. See `rules/precedence.md`.

## Layout

| Path | Owner | Purpose |
| --- | --- | --- |
| `vendor/skills-for-fabric/` | Microsoft | Git submodule, pinned SHA, **never edited** |
| `skills/fsm-semantic-model/` | Firm | **Entry point.** The only skill consultants invoke |
| `skills/fsm-modeling-standards/` | Firm | Star-schema rules, naming, folders, RLS, Direct Lake guardrails |
| `skills/fsm-dax-standards/` | Firm | DAX style, variables, anti-patterns, perf checklist |
| `skills/fsm-engagement-workflow/` | Firm | Discovery → spec → build → review → deploy → handover, with templates |
| `skills/fsm-review/` | Firm | Review checklist and how to run BPA with the firm rule set |
| `skills/fsm-deployment/` | Firm | Workspace promotion, deployment pipelines, git integration |
| `rules/` | Firm | Machine-readable rules used by skills **and** CI (BPA, naming, precedence log) |
| `agents/` | Firm | `modeler`, `reviewer` (read-only), `deployer` (approval-gated) subagents |
| `hooks/` | Firm | Enforcement: protect `vendor/`, lint TMDL on edit, gate prod deploys |
| `commands/` | Firm | `/new-engagement`, `/review-model`, `/sync-upstream` |
| `clients/` | Engagement | `_template/` is committed; real client folders are git-ignored (see below) |
| `evals/` | Firm | Scenario evals + fixture PBIP models run on every PR |
| `.github/workflows/` | Firm | Weekly upstream sync, evals on PR, release on tag |

## Install (Claude Code)

```bash
git clone --recurse-submodules <this-repo>
cd fabric-semantic-model-agent
# in Claude Code:
/plugin marketplace add ./
/plugin install fabric-semantic-model-agent@fsm-marketplace
```

The plugin registers the Power BI Modeling MCP server (`.mcp.json`). You also need Power BI
Desktop with PBIP/TMDL enabled, Azure CLI (`az login`) for Fabric REST calls, and Tabular Editor 2
CLI on PATH for BPA runs.

The same layout (skills + commands + agents + hooks + plugin manifest) installs in GitHub Copilot
CLI, so consultants forced onto Copilot at a client can use the same repo.

## Use on an engagement

```text
/new-engagement acme            # scaffolds clients/acme/ from clients/_template/
/fsm-semantic-model build the Sales model from clients/acme/spec.md
/review-model clients/acme/models/Sales.SemanticModel
```

The orchestrator refuses to build before a spec is approved and refuses to deploy to a workspace
tagged `prod` in `engagement.yaml` without an explicit human confirmation.

## Keeping the Microsoft base current

`.github/workflows/upstream-sync.yml` runs weekly (or `/sync-upstream` on demand): it bumps the
submodule, diffs `plugins/powerbi-authoring/**`, pulls the upstream changelog and opens a PR.
`evals.yml` runs the scenario evals against the **combined** agent on that PR. A human merges;
`release.yml` tags a version. Consultants upgrade deliberately with `/plugin update`, never
mid-engagement by surprise.

## Client isolation

No client data, credentials or workspace IDs beyond `engagement.yaml` live in this repo.
`clients/*` is git-ignored except `_template/` and the `acme-demo/` sample. On a real engagement
either keep the client folder in the client's own repo, or give each client a private repo that
mounts this one as a submodule (cleaner for handover — the client keeps their config, the firm
keeps the agent).

## Status

Sample / demonstration repo. Microsoft's skill is in **preview** — expect breaking changes; the
pinned SHA and the evals are the mitigation, not optional extras.
