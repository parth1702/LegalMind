# PHASE 7.2.2 — REAL DOCUMENT RAG CO-PILOT AND CITATION VERIFICATION

## Architecture Overview

LegalMind AI Phase 7.2.2 establishes an enterprise-grade, zero-hallucination Legal RAG Co-Pilot workflow featuring strict multi-tenant isolation, automated citation validation, and source quality enforcement.

```
Question -> FAISS Search -> Source Quality Filter -> Multi-Tenant & Doc Isolation -> Context Construction -> Grounded Answer Synthesis -> Citation Validation -> RAG Response
```

### Key RAG Co-Pilot Invariants
1. **Multi-Tenant Isolation**: RAG search is locked to `storage/vector_store/{user_id}/{document_id}/`. Cross-user (`USER_A` vs `USER_B`) and cross-document (`DOC_A` vs `DOC_B`) access is blocked at both vector search and citation validation layers.
2. **Zero Hallucination Policy**: Unsubstantiated or unmentioned queries return `evidence_found=False`, `confidence_score=0.0`, and standardized `NO_EVIDENCE_ANSWER` fallback.
3. **Citation Integrity**: Inline citation tags (`[Source N]`) are strictly checked against retrieved valid sources. Invalid citations (`[Source 99]`) trigger safe fallback.
4. **Source Quality Filtering**: Malformed sources (missing `doc_id`/`user_id`, non-positive `page`, missing `chunk_id`, empty text, or out-of-range similarity score `<= 0.0` or `> 1.0`) are automatically filtered out.

---

## Files Modified & Created

### Core Service Files Modified
- **`app/services/rag_service.py`**:
  - Enhanced `_construct_context` with Task 6 source quality validation.
  - Hardened `_validate_answer_citations` and `answer_query` for zero-hallucination anti-spurious fallback.

### Test Files Created & Updated
- **`tests/test_real_document_rag.py`**:
  - `test_task1_real_document_rag_query`: Validates real contract RAG execution, source fields, and exact document/user ID matching.
  - `test_task2_citation_validation`: Validates inline `[Source 1]` citations and rejection of invalid `[Source 99]` citations.
  - `test_task3_no_evidence_query`: Tests unmentioned query ("What are the hazardous waste disposal penalties?") returning `evidence_found=False` and zero confidence score.
  - `test_task4_cross_document_isolation`: Verifies `USER_A/DOC_A` vs `USER_A/DOC_B` isolation.
  - `test_task5_cross_user_isolation`: Verifies `USER_A/DOC_A` vs `USER_B/DOC_B` tenant isolation.
  - `test_task6_source_quality_rejection`: Tests filtering of malformed chunks (missing IDs, invalid pages, out-of-range scores).
  - `test_task7_real_uploaded_pdf_rag`: End-to-end integration test from binary PDF bytes through PyMuPDF, FastAPI pipeline, FAISS vector store, retrieval, and RAG citation answer.

---

## Citation Validation Rules

- **Inline Tag Requirement**: Any generated citation must take the exact form `[Source N]` where `N` is an integer index mapping to `res.sources`.
- **Validation Check**: `_validate_answer_citations()` matches all regex-extracted `[Source N]` tags against `valid_source_ids = {src.source_id for src in sources}`.
- **Mismatch Rejection**: If an inline citation references a non-existent source index (`[Source 99]`), or if a source has a mismatched `user_id` or `doc_id`, `_validate_answer_citations()` returns `(False, NO_EVIDENCE_ANSWER)`.

---

## Anti-Hallucination & No-Evidence Behavior

- If FAISS retrieval yields no matching chunks above the `min_score` threshold (default 0.20), RAG immediately returns `evidence_found=False`, `confidence_score=0.0`, and:
  > *"I cannot find relevant evidence in the provided contract to answer your question."*
- Unmentioned domain questions (such as environmental penalties or stock options in a standard MSA) trigger this safe fallback without generating speculative text or fake citations.

---

## Tenant & Document Isolation Mechanics

- **Vector Database**: FAISS binary indices (`index.faiss`) and JSON metadata (`metadata.json`) are stored strictly under `storage/vector_store/{clean_user_id}/{clean_doc_id}/`.
- **Retrieval Scoping**: `vector_db_service.search_vectors` only loads index files from the requested `user_id` and `doc_id` directory.
- **Source Inspection**: `rag_service._validate_answer_citations` verifies that every retrieved chunk's `user_id` matches `request_user_id` and `doc_id` matches `request_doc_id`.

---

## Test Metrics & Execution Summary

- **Baseline Tests**: 123
- **New Tests Added**: 7 (7 test cases inside `test_real_document_rag.py`)
- **Total Test Suite Count**: 130
- **Passed**: 130
- **Failed**: 0
- **Regressions**: 0

---

## Known Limitations & Considerations

1. **OCR Processing Time**: Image-only or scanned PDF documents rely on EasyOCR, which adds processing latency during initial indexing.
2. **Context Window Length**: Chunking size defaults to 500 words with 50-word overlap; very large contractual tables across multiple pages are chunked across page boundaries.
