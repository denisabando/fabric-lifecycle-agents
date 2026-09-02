---
client: <code>
model: <Model name>
status: draft   # draft | in-review | approved
approved_by: 
approved_on: 
storage_mode: Import   # Import | DirectQuery | DirectLake | Composite
storage_mode_rationale: 
---

# Model spec — <Model>

## Tables
| Table | Type | Grain | Source object | Notes |
| ----- | ---- | ----- | ------------- | ----- |
| Date | dim | day | generated | MS-02 |
| _Measures | measures | — | — | MS-03 |

## Relationships
| From (many) | To (one) | Direction | Justification if bi-directional |
| ----------- | -------- | --------- | ------------------------------- |

## Measures
| Name | Description (business) | Intent / formula sketch | Format |
| ---- | ---------------------- | ----------------------- | ------ |

## Calculation groups
- Time Calc: YTD, PY, YoY %, ... (or "disabled per client override")

## Security
| Role | Scope | Test users |
| ---- | ----- | ---------- |

## Glossary terms for synonyms (top 20)
