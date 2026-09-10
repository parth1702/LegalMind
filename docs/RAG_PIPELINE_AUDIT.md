# LEGALMIND-AI — PHASE 5.1 RAG PIPELINE AUDIT

**Document Version**: 5.1.0  
**Audit Date**: August 8, 2026  
**Status**: Comprehensive Technical Audit Completed (Baseline Frozen: 92/92 PASS)

---

## 1. Audit Status

A full technical audit of the **RAG (Retrieval-Augmented Generation)** pipeline in `LegalMind-AI_Service` was performed across all service modules, schemas, endpoints, and test suites.

- **Baseline Status**: **92 / 92 PASS** (All previous phases frozen).
- **Code Modification State**: **0 Lines Modified** during Phase 5.1 audit.
- **Overall Pipeline Status**: **OPERATIONAL** with isolated FAISS persistence, L2-normalized SentenceTransformers embeddings, structured LangChain prompt templates, and strict anti-hallucination fallback policies.

---

## 2. Current Architecture

```
DOCUMENT TEXT / CONTRACT
          │
          ▼
 [preprocessing_service.py] (Chunking: 500 chars, 50 overlap)
          │
          ▼
 [embedding_service.py] (SentenceTransformers: all-MiniLM-L6-v2, 384d, L2 normalized)
          │
          ▼
 [vector_db_service.py] (FAISS IndexFlatIP + metadata.json persistence)
          │             Path: storage/vector_store/{user_id}/{doc_id}/
          ▼
    USER QUESTION
          │
          ▼
 [vector_db_service.py] (Cosine Similarity Search top_k=4, min_score=0.20)
          │
          ▼
 [rag_service.py] (Context Construction & Source Reference Tags [Source 1])
          │
          ▼
 [langchain prompt] (System prompt: Strict context grounding & Zero-hallucination)
          │
          ▼
   GROUNDED ANSWER + INLINE CITATIONS + SOURCE METADATA ARRAY
```

---

## 3. Existing Components

| Component Module | File Path | Responsibilities & Implementations | Audit Status |
| :--- | :--- | :--- | :--- |
| **Vector DB Service** | [app/services/vector_db_service.py](file:///c:/Users/Hp/OneDrive/Desktop/sgp-7/LegalMind-AI_Service/app/services/vector_db_service.py) | FAISS `IndexFlatIP` creation, binary persistence (`index.faiss`), separate JSON metadata storage (`metadata.json`), per-user/doc isolation. | `IMPLEMENTED` |
| **Embedding Service** | [app/services/embedding_service.py](file:///c:/Users/Hp/OneDrive/Desktop/sgp-7/LegalMind-AI_Service/app/services/embedding_service.py) | Dense 384d vector generation via `all-MiniLM-L6-v2`, L2 normalization, deterministic offline fallback encoder. | `IMPLEMENTED` |
| **RAG Service** | [app/services/rag_service.py](file:///c:/Users/Hp/OneDrive/Desktop/sgp-7/LegalMind-AI_Service/app/services/rag_service.py) | End-to-end RAG orchestrator, context builder, LangChain prompt formatting, answer synthesis, anti-hallucination fallback. | `IMPLEMENTED` |
| **RAG Schemas** | [app/schemas/rag.py](file:///c:/Users/Hp/OneDrive/Desktop/sgp-7/LegalMind-AI_Service/app/schemas/rag.py) | `RAGQueryRequest`, `RAGQueryResponse`, `RAGSourceReference`, `SearchResultChunk`, `LEGAL_RAG_DISCLAIMER`. | `IMPLEMENTED` |
| **Embedding Schemas** | [app/schemas/embeddings.py](file:///c:/Users/Hp/OneDrive/Desktop/sgp-7/LegalMind-AI_Service/app/schemas/embeddings.py) | `DocumentIndexRequest`, `DocumentIndexResponse`, `VectorSearchRequest`, `VectorSearchResponse`, `ChunkMetadata`. | `IMPLEMENTED` |
| **RAG API Endpoint** | [app/api/v1/endpoints/rag.py](file:///c:/Users/Hp/OneDrive/Desktop/sgp-7/LegalMind-AI_Service/app/api/v1/endpoints/rag.py) | REST endpoint `/api/v1/rag/query` serving interactive RAG queries. | `IMPLEMENTED` |
| **Embedding API Endpoints** | [app/api/v1/endpoints/embeddings.py](file:///c:/Users/Hp/OneDrive/Desktop/sgp-7/LegalMind-AI_Service/app/api/v1/endpoints/embeddings.py) | REST endpoints `/api/v1/embeddings/index-document` and `/search`. | `IMPLEMENTED` |

---

## 4. Detailed Feature Audit (20 Key Metrics)

| Audit Item | Categorization | Technical Description & Findings |
| :--- | :--- | :--- |
| **1. FAISS Index Creation & Persistence** | `IMPLEMENTED` | Creates `faiss.IndexFlatIP(384)`. Persists binary index (`index.faiss`) & JSON metadata (`metadata.json`) in `storage/vector_store/{user_id}/{doc_id}/`. |
| **2. Embedding Model & Vector Dimensions** | `IMPLEMENTED` | Uses `all-MiniLM-L6-v2` producing 384-dimensional float32 dense vectors (`dimensions=384`). |
| **3. Similarity Metric & Normalization** | `IMPLEMENTED` | Uses Inner Product (`IndexFlatIP`) with L2-normalized embeddings (`normalize_embeddings=True`), yielding exact Cosine Similarity scores ($0.0$ to $1.0$). |
| **4. Top-k Retrieval** | `IMPLEMENTED` | Configurable parameter (default $k=4$). Bound check `min(top_k, index.ntotal)` prevents vector out-of-bounds errors. |
| **5. Relevance Filtering** | `IMPLEMENTED` | Chunks with similarity score $< \text{min\_score}$ (default $0.20$) are strictly filtered out before context assembly. |
| **6. Duplicate Retrieval** | `PARTIAL` | Top-k chunks are retrieved directly from FAISS. No post-retrieval deduplication step exists for overlapping chunk text. |
| **7. User/Tenant Isolation** | `IMPLEMENTED` | Enforces subdirectory path segregation (`storage/vector_store/{clean_user}/{clean_doc}/`) plus metadata `user_id` verification. |
| **8. Document Isolation** | `IMPLEMENTED` | Dedicated subdirectories per document ID. Vector search enforces `doc_id` matching. |
| **9. Metadata Preservation** | `IMPLEMENTED` | `metadata.json` stores `vector_ref`, `doc_id`, `user_id`, `page`, `chunk_id`, `text`, `start_char`, `end_char`. |
| **10. Page / Paragraph Tracking** | `PARTIAL` | `chunk_id` and offsets (`start_char`, `end_char`) are exact. `page` is estimated via heuristic (`start_char // 2500 + 1`). Paragraph numbers are not stored in chunk metadata. |
| **11. Source Attribution** | `IMPLEMENTED` | Constructs structured `[Source N]` tags containing `doc_id`, `page`, `chunk_id`, `score`, and `text_snippet`. |
| **12. Citation Generation** | `IMPLEMENTED` | Injects inline source tags (`[Source 1]`) into answer text and attaches `RAGSourceReference` objects in response payload. |
| **13. No-Evidence Handling** | `IMPLEMENTED` | Returns `NO_EVIDENCE_ANSWER` ("I cannot find relevant evidence in the provided contract..."), `evidence_found=False`, `confidence_score=0.0`, `sources=[]`. |
| **14. LLM Grounding** | `PARTIAL` | `PromptTemplate` enforces strict grounding. However, when external LLM endpoint is unconfigured, fallback sentence matching is used. |
| **15. Hallucination Protection** | `IMPLEMENTED` | When FAISS returns 0 matches above `min_score`, system short-circuits immediately without generating ungrounded answers. |
| **16. Empty Query Handling** | `IMPLEMENTED` | Empty or whitespace query returns `NO_EVIDENCE_ANSWER` with `metadata={"reason": "Empty query"}`. |
| **17. Empty Document Handling** | `IMPLEMENTED` | Empty document text creates index with 0 chunks. Queries safely return `NO_EVIDENCE_ANSWER`. |
| **18. Missing / Corrupted Index Handling** | `IMPLEMENTED` | `_load_index_and_metadata` catches read exceptions, logs error, and returns `None, []`. RAG query returns `NO_EVIDENCE_ANSWER` cleanly without crashing. |
| **19. LLM Failure Handling** | `PARTIAL` | Catch-all `try...except` around prompt formatting logs warning and falls back to deterministic context sentence extraction. |
| **20. Cross-Document Leakage Protection** | `IMPLEMENTED` | Isolated file paths + metadata filter prevent query for `doc_A` from accessing vector chunks of `doc_B`. |

---

## 5. Existing RAG Test Coverage

Existing test file [tests/test_rag_pipeline.py](file:///c:/Users/Hp/OneDrive/Desktop/sgp-7/LegalMind-AI_Service/tests/test_rag_pipeline.py) covers:
1. `test_successful_rag_query_with_sources`: Verifies FAISS retrieval, inline citation insertion (`[Source 1]`), and structured `RAGSourceReference` attributes (`doc_id`, `user_id`, `page`, `chunk_id`, `score`).
2. `test_no_evidence_fallback_anti_hallucination`: Verifies high `min_score` filter returning `NO_EVIDENCE_ANSWER`, `confidence_score=0.0`, and empty sources array.
3. `test_non_existent_document_rag_query`: Verifies missing FAISS index directory returning `NO_EVIDENCE_ANSWER` without raising exceptions.

---

## 6. Missing Test Coverage & Gaps

The following test scenarios are currently **missing** from `tests/test_rag_pipeline.py`:
1. Empty query string (`""` or `"   "`).
2. Large document multi-chunk retrieval ($k=10$).
3. Multi-tenant cross-user isolation test (verifying User A cannot query User B's index).
4. Cross-document isolation test (verifying Doc A index cannot leak into Doc B query).
5. Corrupted `metadata.json` recovery test.
6. Empty document indexing and query test.
7. Relevance threshold boundary test (`min_score=0.99` vs `min_score=0.01`).

---

## 7. Recommended Work for Phase 5.2 (Future Expansion)

1. **Exact Page Boundary Tracking**: Upgrade chunk page estimation from character heuristic (`start_char // 2500`) to exact PDF page layout bounds from OCR / PDF extraction metadata.
2. **Chunk Content Deduplication**: Implement post-retrieval deduplication for overlapping chunks to prevent repeating near-identical text snippets in context assembly.
3. **Paragraph Metadata Storage**: Include 1-indexed paragraph number in `ChunkMetadata`.
4. **Dedicated Test Suite Expansion**: Expand `test_rag_pipeline.py` with multi-tenant isolation, corrupted index recovery, and empty query boundary test cases.

---

## 8. Regression Baseline Status

> **BASELINE STATUS: 100% INTACT & OPERATIONAL**  
> All 92 pre-existing test cases passed with **0 failures and 0 regressions**.
