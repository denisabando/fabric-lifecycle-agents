# Changelog

## [0.2.0] - 2026-09-02
### Added
- Report-authoring domain: `fsm-report-authoring` entry skill (RP-00..RP-08), `report-reviewer`
  subagent, `/build-report`, firm theme, review checklist; vendored Microsoft `powerbi-report-*`
  skills registered in the plugin manifest.
- Model contract handoff: `scripts/gen-model-contract.py` (TMDL → YAML at end of model review) and
  `scripts/check-report-contract.py` (boundary test, RP-01/RP-02); `contracts/` folder per client.
- Demo `Sales Performance.Report` (PBIR) bound to the `acme-demo` Sales contract, a bad-report
  fixture, evals 007–009 (build from contract, contract violation, contract drift).
- Hooks: RP-00 (.pbix never written), report JSON edits trigger the contract check + PBIR validate.

## [0.1.0] - 2026-09-02
### Added
- **MS-00** rule zero: TMDL/PBIP is the only authoring path, no live edits; Modeling MCP is read-only.
  Overrides Microsoft's Tier 1 (logged in `rules/precedence.md`); enforced by `hooks/pre-tool-use.sh`.
- Initial sample repo: orchestrator skill, firm standards, engagement workflow, review/deploy skills,
  subagents, hooks, commands, rules, evals scaffold, upstream sync workflow.
- Vendored `microsoft/skills-for-fabric` as a pinned submodule.
