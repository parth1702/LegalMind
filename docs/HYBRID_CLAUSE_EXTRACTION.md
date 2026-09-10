# LEGALMIND-AI — PHASE 2: HYBRID ML + RULE CLAUSE EXTRACTION

**Document Version**: 2.0.0  
**Release Date**: August 8, 2026  
**Status**: Fully Operational & Verified

---

## 1. Executive Summary

Phase 2 upgrades the clause extraction engine of `LegalMind-AI_Service` from keyword/rule-only matching to a transparent **Hybrid ML + Rule Engine**.

It combines operational RegEx pattern matchers with **Legal-BERT** ML sequence predictions (`nlpaueb/legal-bert-base-uncased`) behind a resilient decision boundary:
- **Rule Evidence Priority**: Ground-truth rule evidence is never silently overwritten by unrelated ML predictions.
- **Extended Category Taxonomy**: Covers 13 contract clause categories including `Intellectual Property`, `Non-Compete`, `Notice`, `Compensation`, and `Indemnification`.
- **Transparent Audit Payload**: Every extracted clause includes a full decision payload (`rule_match`, `rule_category`, `ml_label`, `ml_confidence`, `final_label`, `evidence`).
- **Zero-Crash Graceful Fallback**: If Legal-BERT is offline or unavailable, the pipeline falls back to rule-based extraction automatically.

---

## 2. Category Taxonomy & Pattern Engine

| Category | Detection Strategy | High-Risk Indicators |
| :--- | :--- | :--- |
| **Termination** | RegEx + Legal-BERT | Termination for convenience, immediate cancellation |
| **Liability** | RegEx + Legal-BERT | Uncapped liability, consequential damage waiver |
| **Indemnity / Indemnification** | RegEx + Legal-BERT | Broad hold-harmless, missing gross negligence limit |
| **Confidentiality** | RegEx + Legal-BERT | Perpetual confidentiality duration |
| **Payment** | RegEx + Legal-BERT | Compounding late interest fees |
| **Compensation** | RegEx + Legal-BERT | Equity grants, severance consideration |
| **Intellectual Property** | RegEx + Legal-BERT | Broad work-for-hire IP assignments, patent rights |
| **Non-Compete** | RegEx + Legal-BERT | Restraint of trade, employee/client non-solicitation |
| **Notice** | RegEx + Legal-BERT | Strict advance written notice deadlines |
| **Renewal** | RegEx + Legal-BERT | Automatic renewal provisions |
| **Dispute Resolution** | RegEx + Legal-BERT | Mandatory arbitration waiving jury trial |
| **Governing Law** | RegEx + Legal-BERT | Specific state court jurisdiction |
| **Obligations** | RegEx + Legal-BERT | Audit rights, mandatory insurance coverage |

---

## 3. Hybrid Decision Logic Matrix

```
                          ┌───────────────────────────┐
                          │   INPUT CONTRACT BLOCK    │
                          └─────────────┬─────────────┘
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 ▼                                             ▼
     [Rule-Based RegEx Engine]                    [Legal-BERT ML Classifier]
                 │                                             │
                 ├─────────────► Rule Match Found? ◄───────────┤
                 │                      │                      │
        ┌────────┴────────┐             │            ┌─────────┴────────┐
        │                 │             │            │                  │
       YES                NO            │           YES                 NO
        │                 │             │            │                  │
        ▼                 ▼             │            ▼                  ▼
  Rule Category      Check ML Signal ───┴───► Consensus Match?    Fallback Mode
        │                 │                          │            (Rules Only)
        │           (Conf >= 0.70)            ┌──────┴──────┐
        ▼                 │                   │             │
  Rule Priority           ▼                  YES            NO
  (No Overwrite)     ML Discovery             │             │
        │                 │                   ▼             ▼
        └────────┬────────┴────────────► Consensus Boost   Rule Evidence
                 │                        (Conf <= 0.98)   Priority
                 ▼
       [HYBRID CLAUSE RESULT]
```

---

## 4. Hybrid Result Audit Schema

Every clause returned by `clause_service.extract_clauses()` populates `metadata` with:

```json
{
  "clause_id": "clause_001",
  "category": "Termination",
  "title": "SECTION 12. TERMINATION",
  "text": "Either party may terminate this agreement upon 30 days prior written notice for convenience.",
  "location": { "paragraph": 12, "start_char": 3200, "end_char": 3310, "page": 2 },
  "importance": "high",
  "is_risk_candidate": true,
  "risk_reason": "Unilateral right to terminate for convenience without cause.",
  "confidence": 0.95,
  "metadata": {
    "rule_match": true,
    "rule_category": "Termination",
    "ml_label": "Termination",
    "ml_confidence": 0.89,
    "final_label": "Termination",
    "evidence": "Consensus: Rule pattern matched 'Termination' and Legal-BERT predicted 'Termination' (conf: 0.89).",
    "page": 2,
    "word_count": 14,
    "char_count": 110
  }
}
```

---

## 5. Test Suite Verification

All 8 test scenarios in `tests/test_hybrid_clause_extraction.py` passed:

1. **Termination Clause**: Correctly extracted with consensus evidence (`PASS`).
2. **Confidentiality Clause**: Correctly extracted with rule match (`PASS`).
3. **Liability Clause & Risk Tagging**: Identified uncapped risk candidate (`PASS`).
4. **Payment & Compensation Clauses**: Categorized compensation and payment clauses (`PASS`).
5. **Intellectual Property & Non-Compete Clauses**: Extracted IP assignments and non-compete restraints (`PASS`).
6. **Unrelated Paragraph**: Filtered non-legal text (`0 clauses extracted`) (`PASS`).
7. **Ambiguous Clause**: Resolved multi-intent dispute/notice clause (`PASS`).
8. **Legal-BERT Offline Fallback**: Simulated offline state executed rule-based extraction cleanly (`PASS`).
