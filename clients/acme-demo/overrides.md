# Client overrides — Acme Retail (demo)

| Id | Overrides | Rule | Reason |
| -- | --------- | ---- | ------ |
| CO-01 | No calculation groups; hand-write YTD / PY measures | MOD-07 (and Microsoft's calc-group guidance) | Acme's BI team maintains models in Desktop only, no Tabular Editor licence |
| CO-02 | Fiscal year starts 1 July | MOD-02 | Acme reports on FY Jul–Jun |
| CO-03 | Currency suffix `(AUD)` on all monetary measures | naming.measures.units_in_name | Multi-entity group, AUD is the reporting currency |
