# contracts/

Handoff artefacts between domains. Generated, versioned, reviewed — never hand-edited.

- `<Model>.model-contract.yaml` — written by the semantic-model domain at the end of a passing
  review (`scripts/gen-model-contract.py ... --status approved`). The report domain may bind
  only to names in here (RP-01).
- `<Model>.change-requests.md` — the report domain asks for model changes here (RP-02) instead
  of working around them in the report.
