# Phase 8.1 Evidence & Finding Data Model Implementation Document

## 1. Overview & Objective

This document details the implementation of the **Structured Evidence/Finding Data Model** for LegalMind AI.

### Core Principle
> **NO EVIDENCE = NO FINDING**
> No legal risk finding is generated or presented unless it is strictly traceable to actual extracted document text, paragraph offsets, and page numbers from the uploaded file. Keyword matches without verifiable document evidence text are assigned `status: insufficient_evidence` or `status: not_detected`.

---

## 2. Structured Data Model Specification

Location: `LegalMind-AI_Service/app/schemas/evidence.py` (`EvidenceFinding` Pydantic v2 Model)

| Attribute Field | Data Type | Validation Rules | Description |
|---|---|---|---|
| `document_id` | `str` | Required, non-empty, stripped | Unique document identifier |
| `user_id` | `str` | Required, non-empty, stripped | Unique user ID for multi-tenant isolation |
| `filename` | `str` | Non-empty string | Original filename of uploaded document |
| `category` | `str` | Required | Risk or clause category (e.g., `Liability`, `Indemnity`, `DPDP`) |
| `rule_id` | `str` | Required | Policy/rule rule ID (e.g., `RULE-INDEMNITY-01`) |
| `severity` | `str` | `Low`, `Medium`, `High`, or `Critical` | Risk severity tier |
| `finding` | `str` | Required | Non-empty finding description |
| `evidence_text` | `str` | Actual extracted text excerpt | Exact text evidence from uploaded file |
| `page` | `int` | `>= 1` | 1-indexed document page number |
| `chunk_id` | `str` | Required, non-empty | Sequence chunk ID referencing text segment |
| `start_char` | `int` | `>= 0` | Character start offset in document text |
| `end_char` | `int` | `>= start_char` | Character end offset in document text |
| `confidence` | `float` | `0.0` to `1.0` inclusive | Verification confidence score |
| `recommendation` | `str` | String | Actionable legal mitigation guidance |
| `status` | `str` | `valid`, `not_detected`, or `insufficient_evidence` | Verification status |

---

## 3. Strict Validation Logic & Rules

1. **Non-Empty Credentials & Tracing**:
   - `document_id`, `user_id`, and `chunk_id` MUST be valid non-empty strings.
2. **Page Number Integrity**:
   - `page` MUST be `>= 1`. Page numbers `<= 0` raise `ValidationError`.
3. **Offset Integrity**:
   - `start_char` MUST be `>= 0`.
   - `end_char` MUST be `>= start_char`. Offsets where `end_char < start_char` raise `ValidationError`.
4. **Confidence Bounds**:
   - `confidence` MUST be bounded between `0.0` and `1.0`. Values outside raise `ValidationError`.
5. **No Evidence Fallback (`NO EVIDENCE = NO FINDING`)**:
   - If `evidence_text` is empty or whitespace-only, the finding's `status` is automatically set to `"insufficient_evidence"`, `evidence_text` is assigned `"[INSUFFICIENT EVIDENCE: No valid text excerpt extracted]"`, and `is_valid_finding` returns `False`.

---

## 4. Test Suite Coverage (`tests/test_evidence_model.py`)

All 9 mandatory unit test cases passed OK:

1. `test_01_valid_evidence`: Validates creation and properties of a fully grounded evidence finding.
2. `test_02_missing_evidence`: Validates that `status='not_detected'` sets `is_valid_finding=False`.
3. `test_03_invalid_page`: Confirms that `page <= 0` raises `ValidationError`.
4. `test_04_invalid_chunk_id`: Confirms that empty or whitespace `chunk_id` raises `ValidationError`.
5. `test_05_empty_evidence`: Confirms that `evidence_text=""` sets status to `insufficient_evidence` and `is_valid_finding=False`.
6. `test_06_wrong_document_id`: Confirms that empty or whitespace `document_id` raises `ValidationError`.
7. `test_07_wrong_user_id`: Confirms that empty or whitespace `user_id` raises `ValidationError`.
8. `test_08_confidence_outside_range`: Confirms that `confidence < 0.0` or `confidence > 1.0` raises `ValidationError`.
9. `test_09_malformed_evidence_offsets`: Confirms that `start_char < 0` or `end_char < start_char` raises `ValidationError`.

---

## 5. Architectural Non-Distortion & Scope Safeguards

- Upload pipeline was **NOT** rewritten.
- RAG vector search and FAISS indexes were **NOT** rewritten.
- JWT authentication and role authorization were **NOT** touched.
- Frontend layout and components were **NOT** altered.
- Final risk score calculation was **NOT** altered in this step.
