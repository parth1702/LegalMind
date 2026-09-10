# Phase 8.1 Baseline Audit & System Diagnostic Report

## 1. Executive Summary & Verification Metrics

- **Python AI Service Unittest Result**: **146 / 146 Tests PASSED (OK)** (`Ran 146 tests in 84.193s`)
- **Frontend Production Build**: **PASSED (0 Errors)** (`2649 modules transformed, built in 13.20s`)
- **Backend Node.js Check**: **PASSED (0 Errors)** (`node -c server.js` completed cleanly)
- **Git Status**: Git repository not initialized; no Git modifications executed per system safety instructions.

---

## 2. Architecture Overview

```
[React/Vite Frontend]
       │
       ▼ (REST APIs via Axios / React Query)
[Express / Node.js Backend] ──► [MongoDB Atlas / Local DB]
       │
       ▼ (Internal HTTP / FormData Pipeline)
[FastAPI / Python AI Service]
       │
       ├──► Legal-BERT / Transformers (Clause Analysis & Risk Scoring)
       ├──► SpaCy / Rule Matchers (NER Entity Extraction)
       └──► SentenceTransformers + FAISS Vector Engine (RAG Indexing)
```

---

## 3. Current Pipelines & Data Flows

### A. Document Upload Pipeline
1. **Frontend**: User drops contract file on `UploadModal.jsx` / `DocumentsPage.jsx`. Sends `POST /api/documents/upload` with FormData.
2. **Backend**: `uploadMiddleware.js` (Multer) stores physical file in `/uploads/`. `Document` document created in MongoDB.
3. **AI Pipeline Delegation**: `documentController.js` calls `executeBackgroundAnalysis` -> posts file to FastAPI `LegalMind-AI_Service` `/api/v1/analysis/upload-and-process` or fallback local engine (`realLegalAnalyzer.js`).

### B. Document Analysis Pipeline
1. **FastAPI Endpoints**: Handled in `LegalMind-AI_Service/app/api/v1/endpoints/` (`analysis.py`, `preprocessing.py`, `clause.py`).
2. **Execution Steps**:
   - PDF / Document Text Extraction (`app/services/pdf_service.py`)
   - Clause Segmentation & Categorization (`app/services/clause_service.py`)
   - Named Entity Recognition (`app/services/ner_service.py`)
   - Legal Risk Assessment (`app/services/risk_engine.py` / `hybrid_risk_engine.py`)
   - Executive Summarization (`app/services/summarization_service.py`)
   - Vector Embedding Indexing (`app/services/vector_store.py`)

### C. Risk Scoring Implementation
- **Python Service Location**: `LegalMind-AI_Service/app/services/risk_engine.py` & `hybrid_risk_engine.py`.
- **Backend Service Location**: `LegalMind-Backend/utils/realLegalAnalyzer.js`.
- **Scoring Method**: Evaluates clause risk candidates (Uncapped Indemnification, Section 27 Restraint of Trade, DPDP Act 2023 Data Principal Rules, Liquidated Damages, Termination Notice). Scores are normalized between 0 and 100 and assigned to risk levels (`low`, `medium`, `high`, `critical`).

### D. MongoDB Storage
- **Models**:
  - `User` ([User.js](file:///c:/Users/Hp/OneDrive/Desktop/sgp-7/LegalMind-Backend/models/User.js)): User credentials, roles (`admin`, `attorney`, `paralegal`, `client`).
  - `Document` ([Document.js](file:///c:/Users/Hp/OneDrive/Desktop/sgp-7/LegalMind-Backend/models/Document.js)): Metadata, fileUrl, fileSize, status, riskScore, riskLevel.
  - `Analysis` ([Analysis.js](file:///c:/Users/Hp/OneDrive/Desktop/sgp-7/LegalMind-Backend/models/Analysis.js)): Linked via `document`, stores `summary`, `riskScore`, `riskLevel`, `risks`, `keyEntities`, `clauses`.
  - `ContactSubmission` & `ActivityLog`: Support tickets & audit trails.

### E. Frontend Analysis Reception
- **Page**: `LegalMind-Frontend/src/pages/AnalysisPage.jsx`.
- **API Function**: `getDocumentAnalysisApi(id)` in `src/services/documentService.js`.
- **Endpoint**: `GET /api/documents/:id/analysis`.
- **State Handling**: React Query `useQuery(['analysis', selectedDocId], ...)` populates `reportData` for display in `RiskScoreCard`, `ExecutiveSummaryCard`, `EntityCard`, and `AiInsightsPanel`.

### F. RAG Pipeline & FAISS Storage
- **Service**: `LegalMind-AI_Service/app/services/rag_service.py` & `vector_store.py`.
- **Embedding Model**: `SentenceTransformer('all-MiniLM-L6-v2')`.
- **Storage Location**: `LegalMind-AI_Service/data/faiss_index/user_<userID>/doc_<docID>/`.
- **Access Control**: Strict user & document isolation filters applied prior to retrieval.

---

## 4. Test Suite Map (146 Passed Tests)

1. `test_clause_extraction.py`
2. `test_complete_pipeline.py`
3. `test_dataset_extraction.py`
4. `test_extraction.py`
5. `test_fullstack_chat.py`
6. `test_fullstack_rag_chat.py`
7. `test_hybrid_clause_extraction.py`
8. `test_hybrid_risk_engine.py`
9. `test_legal_bert.py`
10. `test_legal_ner.py`
11. `test_ner.py`
12. `test_ner_normalization.py`
13. `test_nlp_and_ner.py`
14. `test_production_hardening.py`
15. `test_rag_grounding.py`
16. `test_rag_indexing_hardening.py`
17. `test_rag_pipeline.py`
18. `test_rag_retrieval_hardening.py`
19. `test_real_document_ner_validation.py`
20. `test_real_document_rag.py`
21. `test_real_pdf_upload_pipeline.py`
22. `test_risk_analysis.py`
23. `test_summarization.py`
24. `test_vector_search.py`

---

## 5. Protected Critical Files (Do NOT Unnecessarily Modify)

- `LegalMind-AI_Service/app/services/vector_store.py` (FAISS indexing core)
- `LegalMind-AI_Service/app/services/rag_service.py` (RAG citation & security isolation engine)
- `LegalMind-Backend/middleware/authMiddleware.js` (JWT & RBAC security)
- `LegalMind-Backend/config/db.js` (Mongoose DB connectivity)
- `LegalMind-Frontend/src/context/AuthContext.jsx` (Session & auth state)
- `LegalMind-Frontend/src/App.jsx` (Application routing)
