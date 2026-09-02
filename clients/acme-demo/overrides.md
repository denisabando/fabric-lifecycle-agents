# Client overrides — Acme Retail (demo)

| Id | Overrides | Rule | Reason |
| -- | --------- | ---- | ------ |
| CO-01 | No calculation groups; hand-write YTD / PY measures | MS-07, DX-11 | Acme's BI team maintains models in Desktop only, no Tabular Editor licence |
| CO-02 | Fiscal year starts 1 July | MS-02 | Acme reports on FY Jul–Jun |
| CO-03 | Currency suffix `(AUD)` on all monetary measures | naming.measures.units_in_name | Multi-entity group, AUD is the reporting currency |
