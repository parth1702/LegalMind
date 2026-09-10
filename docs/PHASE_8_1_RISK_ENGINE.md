# Phase 8.1 Evidence-Backed Legal Risk Scoring Engine Implementation Document

## 1. Executive Summary & Core Rules

This document details the implementation of the **Evidence-Backed Legal Risk Scoring Engine** for LegalMind AI.

### Architectural Core Directive
> **NO EVIDENCE → NO FINDING → NO RISK POINTS.**
> Legal risk points are derived ONLY from structured legal facts that have verifiable text evidence extracted directly from the uploaded document. Keyword presence without valid document text evidence adds zero risk points.

### Absolute Prohibitions Enforced
- **NO `Math.random()` or random score generation**.
- **NO filename-based scoring** (removed `.includes('msa')`, `.includes('nda')` score biases).
- **NO arbitrary 8–98 score bounds**.
- **NO fake fallback scores or mock contracts**.
- **NO keyword count as final score**.

---

## 2. 9 Weighted Legal Categories & Mathematical Formula

The engine evaluates 9 distinct contract risk categories (total weight = 100%):

| Category | Weight % | Weight Factor | Focus & Statutory Scope |
|---|---|---|---|
| **LIABILITY** | **20%** | `0.20` | Monetary caps, unlimited exposure, consequential damage waivers |
| **INDEMNIFICATION** | **15%** | `0.15` | Uncapped indemnity, third-party claims, duty to defend (Sec. 124 ICA 1872) |
| **TERMINATION** | **15%** | `0.15` | Immediate cancellation, short notice (<15 days), auto-renewal traps |
| **PAYMENT** | **10%** | `0.10` | Late fee penalty rates (>1.0%/mo), Net payment terms, forfeiture penalties |
| **CONFIDENTIALITY** | **10%** | `0.10` | Unilateral covenants, perpetual secrecy duration, missing exclusions |
| **INTELLECTUAL PROPERTY**| **10%** | `0.10` | Unilateral IP assignment, work for hire forfeitures, exclusive licenses |
| **DATA PROTECTION** | **10%** | `0.10` | Personal data processing safeguards, missing 72-hour breach notice (DPDP 2023) |
| **GOVERNING LAW / DISPUTE**| **5%**| `0.05` | Venue convenience, mandatory binding arbitration (Arbitration Act 1996) |
| **NON-COMPETE / RESTRICTIONS**| **5%**| `0.05` | Post-termination trade restraints, non-solicitation (Sec. 27 ICA 1872) |

### Mathematical Formula
$$\text{Category Score}_c \in [0.0, 100.0] \quad \text{for each category } c$$

$$\text{Final Weighted Risk Score} = \sum_{c=1}^{9} \left( \text{Category Score}_c \times \text{Category Weight}_c \right)$$

$$\text{Overall Score} = \min\left(100.0, \max\left(0.0, \text{round}(\text{Final Weighted Risk Score}, 1)\right)\right)$$

### Unmanipulated Risk Tiers
- **`0.0 – 35.0`**: **`LOW`** Risk Tier
- **`35.1 – 50.0`**: **`MEDIUM`** Risk Tier
- **`50.1 – 75.0`**: **`HIGH`** Risk Tier
- **`75.1 – 100.0`**: **`CRITICAL`** Risk Tier

---

## 3. Triggered Rule Output Specification

Every triggered rule generates a structured output grounded in verifiable document text:

```json
{
  "rule_id": "LIABILITY_UNLIMITED",
  "category": "LIABILITY",
  "severity": "CRITICAL",
  "score_points": 60.0,
  "finding": "Uncapped Monetary Liability Exposure: Contract contains unlimited monetary damage exposure.",
  "evidence_text": "Party A shall indemnify and hold harmless Party B without any monetary limitation.",
  "page": 3,
  "chunk_id": "chunk-liability-1",
  "start_char": 450,
  "end_char": 535,
  "confidence": 0.95,
  "recommendation": "Negotiate a mutual liability cap equal to 12 months of fees paid."
}
```

---

## 4. Test Suite Matrix (`tests/test_evidence_risk_engine.py`)

All 15 mandatory test scenarios passed OK:

1. **Same PDF Twice**: Yields 100% identical overall score and risk tier.
2. **Low-Risk Contract**: Scores $\le 35.0$ (`LOW` tier).
3. **High-Risk Contract**: Scores higher than low-risk contract.
4. **Unlimited Liability**: Increases liability category risk score ($\ge 50.0$).
5. **Liability Cap**: Lowers liability category risk score ($0.0$).
6. **7-Day/Immediate Termination**: Increases termination risk score ($\ge 50.0$).
7. **30/60-Day Termination**: Lowers termination risk score ($< 35.0$).
8. **Uncapped Indemnity**: Increases indemnification risk score ($\ge 50.0$).
9. **Evidence Missing**: Adds 0 risk points (`overall_score = 0.0`).
10. **Wrong Document Evidence**: Rejects mismatched document evidence.
11. **Wrong User Evidence**: Rejects mismatched user evidence.
12. **Same Filename with Different Contents**: Yields different scores.
13. **Different Filename with Same Contents**: Yields 100% identical scores.
14. **No Random Score Generation**: 5 consecutive runs yield identical outputs.
15. **Repeatability Test**: Deterministic category breakdown and rule list across invocations.

---

## 5. System Non-Distortion & Isolation Guarantee

- Upload pipeline: **UNTOUCHED**
- FAISS RAG vector DB: **UNTOUCHED**
- Authentication & Authorization: **UNTOUCHED**
- Database connectivity: **UNTOUCHED**
