# LEGALMIND-AI — PHASE 4: HYBRID LEGAL RISK ENGINE

**Document Version**: 4.0.0  
**Release Date**: August 8, 2026  
**Status**: Fully Integrated & Verified

---

## 1. Executive Summary

Phase 4 upgrades the risk engine in `LegalMind-AI_Service` ([app/services/risk_service.py](file:///c:/Users/Hp/OneDrive/Desktop/sgp-7/LegalMind-AI_Service/app/services/risk_service.py)) to a **Hybrid Legal Risk Engine** integrating deterministic rule-based evidence, Legal-BERT ML clause predictions, clause severity weighting, and confidence metrics.

All core safety objectives were satisfied:
- **Reproducible & Deterministic Scoring Formula**: Overall risk score is computed from evidence-grounded risk items ($\text{OverallRiskScore} = \min(100.0, \sum \text{ItemScore})$) with transparent categorization thresholds. Same document + model configuration always yields identical output.
- **Canonical Risk Item Output Schema**: Every risk item explicitly returns `category`, `severity`, `score`, `confidence`, `reason`, `evidence`, `page`, and `source` (`"rule"`, `"ml"`, or `"hybrid"`).
- **Fault Isolation & Graceful Fallback**: If ML classification fails or is offline, the deterministic rule engine continues executing cleanly (`source="rule"`). If one risk category evaluation throws an exception, it is isolated so other categories continue. One bad clause will **NEVER** crash document analysis.

---

## 2. Risk Output Schema & Contract

```json
{
  "category": "Liability",
  "severity": "Critical",
  "score": 25.0,
  "confidence": 0.95,
  "reason": "Uncapped Liability Exposure: Clause exposes party to unlimited monetary damages without any liability ceiling.",
  "evidence": "Neither party's liability under this Agreement shall be capped or limited in any manner whatsoever.",
  "page": 1,
  "source": "hybrid"
}
```

---

## 3. Reproducible Risk Scoring Formula & Matrix

$$\text{RawScore} = \sum_{i=1}^{N} \text{RiskItem}_i.\text{score\_impact}$$

$$\text{OverallRiskScore} = \min\left(100.0, \text{round}(\text{RawScore}, 1)\right)$$

| Overall Risk Category | Score Range | Critical Risks Count | Actionable Recommendation Level |
| :--- | :--- | :--- | :--- |
| **Low** | `0.0` – `25.0` | `0` | Standard commercial terms; standard review |
| **Medium** | `26.0` – `50.0` | `0` | Minor non-standard terms; legal review recommended |
| **High** | `51.0` – `75.0` | `1` | Significant risk exposure; negotiation required |
| **Critical** | `76.0` – `100.0` | $\ge 2$ | Severe contractual exposure; immediate revision required |

---

## 4. Source Attribution Logic

1. **`"hybrid"`**: Triggered when both deterministic rule match AND high-confidence Legal-BERT ML classification (`ml_confidence >= 0.70`) concur on clause risk.
2. **`"ml"`**: Triggered when high-confidence Legal-BERT ML classification (`ml_confidence >= 0.75`) flags a risky clause category that was missed by standard keywords.
3. **`"rule"`**: Triggered when deterministic rule keywords flag a risk, or when ML microservice is offline/unavailable.

---

## 5. Test Suite Verification Results

All 7 test scenarios in [tests/test_hybrid_risk_engine.py](file:///c:/Users/Hp/OneDrive/Desktop/sgp-7/LegalMind-AI_Service/tests/test_hybrid_risk_engine.py) passed:

1. **Low-Risk Document Evaluation**: Evaluates low-risk contract (`Score <= 25.0`, Category `Low`) (`PASS`).
2. **High-Risk Document Evaluation**: Evaluates high-risk contract (`Score >= 50.0`, Category `High`/`Critical`) (`PASS`).
3. **Uncapped Liability Detection**: Flags uncapped liability clause (`Score 25.0`, Severity `Critical`) (`PASS`).
4. **Immediate Termination Detection**: Flags immediate termination without notice (`PASS`).
5. **Clean Document (No Obvious Risk)**: Evaluates clean NDA with zero missing protections (`PASS`).
6. **Malformed Document Handling**: Safely handles empty string and whitespace without crashing (`PASS`).
7. **ML Unavailable Fallback**: Operates cleanly with `source="rule"` when ML is offline (`PASS`).
