# Fabric Lifecycle Agents

Packaged, versioned agents that consultants install on a client engagement to design, build, review
and deploy Microsoft Fabric work — semantic models and Power BI reports today, with the structure
ready for further domains (ingestion, etc.).

Each domain stands on Microsoft's own skills (vendored from
[microsoft/skills-for-fabric](https://github.com/microsoft/skills-for-fabric), pinned to a commit)
and adds a firm-owned layer of standards, an engagement workflow, review gates and per-client
overrides — **without ever editing Microsoft's files**.

> **Design principle: layer, don't fork.**
> `vendor/` is read-only. Everything the firm owns lives beside it under `skills/`,
> `agents/`, `hooks/` and `commands/`, and the orchestrator skill says how the layers combine.

## Two domains, one handoff

| Domain | Entry skill | Microsoft base | Firm rules | Produces |
| --- | --- | --- | --- | --- |
| Semantic model | `semantic-model` | `semantic-model-authoring` | `MOD-*`, `DAX-*` | PBIP/TMDL model + a passing review that pins `model_commit` |
| Report | `report` | `powerbi-report-planning/-design/-authoring/-management` | `RPT-*` | PBIR report bound to visible objects at that commit |

The handoff is a **git commit, not a document**. When the model reviewer passes a model it records
`model_commit` in the review report; the report domain reads the model's TMDL at that sha (using
Microsoft's own PBIP/TMDL guidance — nothing new to learn) and binds only to visible objects.
`scripts/check-report-bindings.py <Report>.Report <Model>.SemanticModel --at <sha>` is the test at
that boundary; the post-edit hook runs it on every report JSON change and CI runs it on every PR.
If the model is re-reviewed at a new commit, the check is re-run and the report review reopens if
anything broke. Agents talk through files in the client repo, never through each other's context. A lifecycle orchestrator above both is deferred until a third
domain (e.g. ingestion) exists.

## Precedence

```
client override  >  firm standards  >  Microsoft skill  >  model's own judgement
```

Microsoft's skill says **how** (tool routing, TMDL syntax, MCP calls, deployment mechanics).
Firm skills say **what good looks like** (naming, structure, DAX style, review gates).
Client overrides adjust both for one engagement. Precedence inside the repo:

```
client override  >  skills/<domain>/SKILL.md §3–4  >  Microsoft skill (vendor/)  >  agent's own judgement
```

Three layers, three places: Microsoft's skills in `vendor/`; the firm's rules in each domain's
`skills/<domain>/SKILL.md`, with §3 the table of departures from Microsoft and §4 the additions; the
client's exceptions in `clients/<code>/overrides.md`. A `SKILL.md` exists only where the agent is meant
to be invoked — everything else is plain reference material.

**Rule zero (MOD-00): TMDL/PBIP is the only authoring path — no live edits.** The model of record
is the TMDL in the client's git repo; every change is a diff. Microsoft's skill prefers live
authoring through the Modeling MCP (its Tier 1); this repo overrides that and uses MCP read-only.

## Layout

| Path | Owner | Purpose |
| --- | --- | --- |
| `vendor/skills-for-fabric/` | Microsoft | Git submodule, pinned SHA, **never edited** |
| `skills/semantic-model/` | Firm | **Model domain, one file.** `SKILL.md`: routing (§1–2), overrides of Microsoft (§3), firm additions (§4), subagents, output. Beside it: `naming.yaml`, `bpa-rules.json` (machine-checkable subset), `references/rls-patterns.md` |
| `skills/report/` | Firm | **Report domain, one file.** Same six sections; `theme.json` beside it |
| `skills/engagement-workflow/` | Firm | Phases, gates and templates shared by every domain |
| `agents/` | Firm | `modeler`, `reviewer` + `report-reviewer` (read-only; review steps live here), `deployer` (gates + mechanisms live here) |
| `hooks/` | Firm | Enforcement (protect `vendor/`, lint on edit, gate prod deploys) and the mechanical audit trail (`audit.sh`, `stop-check.sh`) |
| `commands/` | Firm | `/new-engagement`, `/review`, `/sync-upstream` |
| `clients/` | Engagement | `_template/` is committed; real client folders are git-ignored (see below) |
| `evals/` | Firm | Scenario evals + fixture PBIP models run on every PR |
| `.github/workflows/` | Firm | Weekly upstream sync, evals on PR, release on tag |

## Install (Claude Code)

```bash
git clone --recurse-submodules <this-repo>
cd fabric-lifecycle-agents
# in Claude Code:
/plugin marketplace add ./
/plugin install fabric-lifecycle-agents@fabric-agents
```

The plugin manifest registers the Power BI Modeling MCP server (read-only on engagements, MOD-00). You also need Power BI
Desktop with PBIP/TMDL enabled, Azure CLI (`az login`) for Fabric REST calls, and Tabular Editor 2
CLI on PATH for BPA runs.

The same layout (skills + commands + agents + hooks + plugin manifest) installs in GitHub Copilot
CLI, so consultants forced onto Copilot at a client can use the same repo.

## Use on an engagement

```text
/new-engagement acme            # scaffolds clients/acme/ from clients/_template/
/semantic-model build the Sales model from clients/acme/spec.md
/review clients/acme/models/Sales.SemanticModel        # on pass → review report records model_commit
/report build "Sales Performance" for acme               # pins to that commit
/review "clients/acme/models/Sales Performance.Report"
```

The orchestrator refuses to build before a spec is approved and refuses to deploy to a workspace
tagged `prod` in `engagement.yaml` without an explicit human confirmation.

## Audit trail

Two trails, produced differently, both in the client folder so they travel with the client's repo:

- **Mechanical — what happened.** `hooks/audit.sh` runs on every prompt, tool call, subagent start/stop,
  hook block and turn end, appending one JSON line to `<client-root>/.audit/<date>.jsonl`. Metadata only
  (event, tool, path, truncated command, block reason, file fingerprint) — never file contents or query
  results. Read-only tools are skipped unless `engagement.yaml: audit.include_reads: true`. The agent
  cannot edit `.audit/` (hook-blocked). Roughly a few hundred lines per busy day.
- **Narrative — why.** Every task that changes `models/` ends with a decision record in
  `<client-root>/decisions/` (template: `skills/engagement-workflow/templates/decision.md`): request, what
  changed, rules and overrides applied, questions asked and answered, interventions, next gate. The Stop
  hook refuses to end a turn that changed models without one. Commit trailers `Decision:` and
  `Agent-Session:` tie the commit to both trails.

Human approvals (spec sign-off, review verdict, prod confirmation) stay in their artefacts and, on a
real engagement, in the pull request. `scripts/client-root.sh` is the one place that resolves where the
client folder is — set `FLA_CLIENT_ROOT` when the client content moves to its own repo.

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

The firm rules (§3–4 of each domain skill) are **drafts written to exercise the architecture**, not the practice's agreed
position; MOD-00 (no live edits) is the one rule that came from a stated requirement.

Sample / demonstration repo. Microsoft's skill is in **preview** — expect breaking changes; the
pinned SHA and the evals are the mitigation, not optional extras.

## Adding a domain

1. `skills/<domain>/SKILL.md` — an orchestrator only: context, layer order, subagents, output block.
2. `skills/<domain>/SKILL.md<domain>.md` — its rules with a new id prefix; `-00` is "diffable path, no live edits".
3. An overrides table at the top of that file for anything that contradicts the vendored Microsoft skill — and nothing that merely repeats it.
4. Register the Microsoft skills it uses in `.claude-plugin/plugin.json` (they are already in `vendor/`).
5. A reviewer subagent, a hook rule if something must be enforced, fixtures + evals.
