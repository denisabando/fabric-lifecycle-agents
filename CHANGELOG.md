# Changelog

## [0.6.1] - 2026-09-02
### Changed
- Audit folder renamed `.audit/` → `audit/` so it is visible in Finder / Explorer. Hook protection now targets the `.jsonl` log files inside it.

## [0.6.0] - 2026-09-02
### Added — audit trail
- `hooks/audit.sh` on UserPromptSubmit / PreToolUse / PostToolUse / SubagentStart / SubagentStop / Stop
  and on every hook block: one JSON line per event in `<client-root>/.audit/<date>.jsonl`, metadata only.
- `hooks/stop-check.sh`: a turn that changed `models/` must leave a decision record in `decisions/`.
- `skills/engagement-workflow/templates/decision.md`; §6 of both domain skills now writes it.
- `scripts/client-root.sh`: single resolver for the client folder (`FLA_CLIENT_ROOT` → nearest
  `engagement.yaml` → sole non-template `clients/*`). The seam for moving client content to its own repo.
- `.audit/` is hook-protected; `engagement.yaml: audit:` settings; demo decision record + audit day.

## [0.5.0] - 2026-09-02
### Changed — one file per domain
- `skills/standards/` removed. Each domain's rules now live inside its own orchestrator,
  `skills/<domain>/SKILL.md`, in fixed sections: §1 context · §2 layers · §3 overrides of Microsoft ·
  §4 firm additions · §5 subagents · §6 output. `naming.yaml`, `bpa-rules.json` and
  `references/rls-patterns.md` sit beside the model skill; `theme.json` beside the report skill.
- Convention: a `SKILL.md` exists only where the agent is meant to be invoked.

## [0.4.2] - 2026-09-02
### Changed — standards are now the firm's delta on Microsoft
- Removed every rule that merely repeated Microsoft's vendored guidance (star schema, hidden keys,
  relationship direction, calc groups, display folders, technical prefixes, `VAR`, `DIVIDE`, DAX
  anti-patterns, Copilot readiness, page archetypes, accessibility). The agent gets those from `vendor/`.
- Fixed three unlogged conflicts by adopting Microsoft's position: count measures are `# Baskets` not
  `Baskets #`; date table from source when available; `/` allowed inside iterators (DIVIDE BPA rule removed).
- Overrides table moved from `standards/SKILL.md` into the top of each domain file; `SKILL.md` is now a
  plain index. RPT-02 reclassified as an addition (Microsoft is silent on report measures); RPT-07
  (readable PBIR names) logged as the override it always was.
- Both standards files marked as drafts written to exercise the architecture.

## [0.4.1] - 2026-09-02
### Changed — fewer files
- `skills/<domain>/SKILL.md` is now `SKILL.md` (index + overrides table), `semantic-model.md`, `report.md`,
  plus the two machine-readable rule files moved in from `rules/` (folder removed).
- `/build-report` removed (the `report` orchestrator covers it); `/review-model` → `/review`, handles
  models and reports.

## [0.4.0] - 2026-09-02
### Changed — genericised for more domains
- Dropped the `fsm-` prefix everywhere; plugin renamed `fabric-lifecycle-agents`.
- One `skills/<domain>/SKILL.md` folder holds every firm rule (`modeling.md`, `dax.md`, `report.md`) and
  **`overrides.md`** — the single list of departures from Microsoft (replaces `rules/precedence.md`).
  Domain orchestrators (`skills/semantic-model`, `skills/report`) contain routing only.
- Rule ids are domain-prefixed and no longer look like Microsoft's: `MS-*` → `MOD-*`, `DX-*` → `DAX-*`,
  `RP-*` → `RPT-*`. TMDL/PBIR annotations and BPA rule ids lose the `fsm_` prefix.

## [0.3.0] - 2026-09-02
### Changed — simplification pass
- **Model contract file removed.** The handoff to the report domain is now the `model_commit`
  recorded by a passing model review; reports read TMDL at that sha (Microsoft's own path) and bind
  to visible objects. `scripts/check-report-bindings.py --at <sha>` replaces the contract generator +
  contract check. Change requests move to `clients/<code>/<Model>.model-change-requests.md`.
- `fsm-review` and `fsm-deployment` skills folded into the `reviewer` and `deployer` agents (they were
  only ever read by those agents). Four firm skills remain for the model domain.
- Removed `.mcp.json` (duplicate of the plugin manifest), two brittle hook heuristics (DAX data-read
  regex, FSM_DOMAIN TMDL guard) and the speculative upstream "rule snapshot" step.

## [0.2.0] - 2026-09-02
### Added
- Report-authoring domain: `report` entry skill (RPT-00..RPT-08), `report-reviewer`
  subagent, `/build-report`, firm theme, review checklist; vendored Microsoft `powerbi-report-*`
  skills registered in the plugin manifest.
- Model contract handoff: `scripts/gen-model-contract.py` (TMDL → YAML at end of model review) and
  `scripts/check-report-contract.py` (boundary test, RPT-01/RPT-02); `contracts/` folder per client.
- Demo `Sales Performance.Report` (PBIR) bound to the `acme-demo` Sales contract, a bad-report
  fixture, evals 007–009 (build from contract, contract violation, contract drift).
- Hooks: RPT-00 (.pbix never written), report JSON edits trigger the contract check + PBIR validate.

## [0.1.0] - 2026-09-02
### Added
- **MOD-00** rule zero: TMDL/PBIP is the only authoring path, no live edits; Modeling MCP is read-only.
  Overrides Microsoft's Tier 1 (logged in `skills/<domain>/SKILL.mdSKILL.md § Overrides`); enforced by `hooks/pre-tool-use.sh`.
- Initial sample repo: orchestrator skill, firm standards, engagement workflow, review/deploy skills,
  subagents, hooks, commands, rules, evals scaffold, upstream sync workflow.
- Vendored `microsoft/skills-for-fabric` as a pinned submodule.
