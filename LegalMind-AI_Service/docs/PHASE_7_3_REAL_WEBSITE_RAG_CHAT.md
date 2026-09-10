# PHASE 7.3 — REAL WEBSITE RAG CHAT INTEGRATION VERIFICATION

## Architecture Overview

LegalMind AI Phase 7.3 establishes and verifies the end-to-end multi-tenant Legal RAG Chat production pipeline linking the React UI, Express Node.js Backend, and Python FastAPI AI Service.

```
React UI (AssistantPage.jsx)
  └─> chatService.sendQuery({ conversationId, documentId, query })
        └─> POST /api/v1/chat/query (Express Node.js Backend)
              ├─> Auth Protection Middleware (req.user)
              ├─> Document Ownership Security Check (req.user._id vs Document.user)
              ├─> Mongo ChatHistory Persist (messages)
              └─> POST /api/v1/rag/query (FastAPI AI Service)
                    ├─> Document Status Verification (document_status_service)
                    ├─> Vector DB Search (storage/vector_store/{user_id}/{document_id}/)
                    ├─> Context & Source Quality Filter (rag_service._construct_context)
                    ├─> Grounded Answer Synthesis
                    ├─> Citation & Cross-Tenant / Cross-Doc Validation
                    └─> RAG Query Response
```

---

## Complete Request/Response Flow & Data Contracts

### 1. React Frontend Request
`chatService.sendQuery({ conversationId, documentId, query })` sends JSON to Express:
```json
{
  "conversationId": "65b1c8f92a10e40012a99101",
  "documentId": "65b1c8f92a10e40012a99102",
  "query": "What is the liability cap?"
}
```

### 2. Express Backend Request to FastAPI
Express validates JWT auth (`req.user._id`), verifies `Document.findById(documentId).user === req.user._id`, saves user message in `ChatHistory`, and posts to FastAPI:
```json
{
  "query": "What is the liability cap?",
  "user_id": "65b1c8f92a10e40012a99100",
  "document_id": "65b1c8f92a10e40012a99102",
  "top_k": 4,
  "min_score": 0.15
}
```

### 3. FastAPI FAISS Retrieval & RAG Response Contract
FastAPI loads `storage/vector_store/65b1c8f92a10e40012a99100/65b1c8f92a10e40012a99102/` and returns:
```json
{
  "success": true,
  "query": "What is the liability cap?",
  "answer": "Based on the contract text in [Source 1]: Total aggregate liability under this agreement shall be capped at $1,000,000 USD. [Source 1]",
  "evidence_found": true,
  "confidence_score": 0.88,
  "sources": [
    {
      "source_id": "[Source 1]",
      "doc_id": "65b1c8f92a10e40012a99102",
      "user_id": "65b1c8f92a10e40012a99100",
      "page": 1,
      "chunk_id": 1,
      "score": 0.88,
      "text_snippet": "Total aggregate liability under this agreement shall be capped at $1,000,000 USD."
    }
  ],
  "disclaimer": "LegalMind AI Co-Pilot analysis is for legal intelligence only."
}
```

### 4. Express Final Response to React
```json
{
  "success": true,
  "answer": "Based on the contract text in [Source 1]: Total aggregate liability under this agreement shall be capped at $1,000,000 USD. [Source 1]",
  "document_id": "65b1c8f92a10e40012a99102",
  "evidence_found": true,
  "confidence_score": 0.88,
  "sources": [
    {
      "document_id": "65b1c8f92a10e40012a99102",
      "chunk_id": 1,
      "page": 1,
      "text": "Total aggregate liability under this agreement shall be capped at $1,000,000 USD.",
      "similarity_score": 0.88
    }
  ],
  "conversationId": "65b1c8f92a10e40012a99101",
  "disclaimer": "LegalMind AI Co-Pilot analysis is for legal intelligence only."
}
```

### 5. No Evidence Response Contract
When a query asks about unmentioned topics ("What are the hazardous waste disposal penalties?"):
```json
{
  "success": true,
  "answer": "I cannot find relevant evidence in the provided contract to answer your question.",
  "document_id": "65b1c8f92a10e40012a99102",
  "evidence_found": false,
  "confidence_score": 0.0,
  "sources": []
}
```

---

## Security & Multi-Tenant Isolation Mechanics

1. **Document Ownership Enforcement**: Express `sendQuery` checks `doc.user.toString() === req.user._id.toString()`. Accessing another user's document returns HTTP 403 Forbidden.
2. **FAISS Storage Isolation**: Vector indices are saved at `storage/vector_store/{user_id}/{document_id}/index.faiss`.
3. **Citation & Leakage Guard**: `rag_service._validate_answer_citations()` verifies that all citations map to valid sources belonging to the requesting user and target document.

---

## Error Handling Matrix

| Error Scenario | Component | Action / Behavior |
| :--- | :--- | :--- |
| **FastAPI Unavailable** | Express Backend | Catches network exception, returns controlled error `success: false` without fabricating legal answers. |
| **Missing Document ID** | Express Backend | Scopes session to conversation's stored `document` ID if present. |
| **Unauthorized User** | Express Backend | Returns `HTTP 403 Forbidden: Access Denied: You do not own this document`. |
| **Document Not Indexed** | FastAPI AI Service | Returns `success: false` with `RAG search is disabled` message. |
| **Empty Search Results** | FastAPI AI Service | Returns `evidence_found: false`, `confidence_score: 0.0`, and `NO_EVIDENCE_ANSWER`. |
| **LLM Timeout** | FastAPI AI Service | Catches timeout, logs warning, returns safe `NO_EVIDENCE_ANSWER` fallback. |

---

## Test Metric Summary

```text
OLD TESTS: 130
NEW TESTS: 10 (test_fullstack_rag_chat.py)
TOTAL:     140
PASSED:    140
FAILED:    0
REGRESSIONS: 0
```

---

## Manual Website Testing Procedure

1. **Launch Services**:
   - Start FastAPI AI Service: `python -m uvicorn app.main:app --port 8000`
   - Start Node Backend: `npm run dev` (Port 5000)
   - Start React Frontend: `npm run dev` (Port 5173)
2. **Upload Contract Document**:
   - Navigate to `/app/upload` and upload a standard NDA or MSA PDF.
3. **Interact with AI Co-Pilot Chat**:
   - Open `/app/assistant`. Select the uploaded contract in the **Target Contract** dropdown.
   - Ask: *"What is the liability cap?"*
   - Verify that answer quotes the contract, displays citation badge `[Source 1]`, and shows expandable source preview card with page number and confidence match.
4. **Test No-Evidence Question**:
   - Ask: *"What are the hazardous waste disposal penalties?"*
   - Verify AI responds with *"I cannot find relevant evidence in the provided contract to answer your question."*, `evidence_found=false`, and zero citations.
