# LEGALMIND-AI — PHASE 0: SAFE BASELINE AND REGRESSION PROTECTION

**Document Version**: 1.0.0  
**Baseline Date**: August 8, 2026  
**Status**: Operational Baseline Verified

---

## 1. Executive Summary

This document establishes the safe, operational baseline for the **LegalMind-AI** platform prior to introducing advanced Transformer ML models (Legal-BERT, DeBERTa-v3) or new architecture.

All core microservices (`LegalMind-AI_Service`, `LegalMind-Backend`, `LegalMind-Frontend`) are fully operational and integrated.

---

## 2. Existing System Architecture & Technology Stack

```
LegalMind-AI/
├── LegalMind-AI_Service/      (FastAPI Python Microservice on Port 8000)
│   ├── app/
│   │   ├── api/v1/endpoints/  (11 REST API endpoint modules)
│   │   ├── core/              (Config, Logging, Exception Handlers)
│   │   ├── schemas/           (Pydantic validation schemas)
│   │   └── services/          (11 Core AI/NLP Service modules)
│   ├── main.py
│   └── requirements.txt
│
├── LegalMind-Backend/         (Node.js / Express Backend on Port 5000)
│   ├── controllers/           (documentController.js, chatController.js, etc.)
│   ├── models/                (Document, Analysis, ChatHistory, ActivityLog)
│   ├── routes/                (documentRoutes, chatRoutes, authRoutes)
│   └── server.js
│
└── LegalMind-Frontend/        (React Vite Web Application on Port 5173)
```

### Technology Matrix

| Layer | Component | Verified Technology Stack |
| :--- | :--- | :--- |
| **Microservice** | Python API Framework | FastAPI 0.109, Uvicorn, Pydantic v2 |
| **Document Processing** | Text Extraction & OCR | PyMuPDF (`fitz`), `python-docx`, EasyOCR (`easyocr.Reader(["en"])`) |
| **NLP & Preprocessing** | Text Cleanup & Segmentation | RegEx Normalizer, spaCy (`en_core_web_sm` sentencizer) |
| **NER Engine** | Entity Recognition | spaCy `en_core_web_sm` + HuggingFace `dslim/bert-base-NER` + RegEx Matchers |
| **Clause Extraction** | Contract Segmentation | RegEx Keyword & Priority Weighting (`_CATEGORY_PATTERNS`) |
| **Risk Engine** | Legal Risk Scoring | Deterministic Heuristic Risk Matrix + Evidence Traceability |
| **Summarization** | Executive Overview | HuggingFace DistilBART (`sshleifer/distilbart-cnn-12-6`) / Sentence-Ranker |
| **Embeddings** | Dense Vector Generation | Sentence Transformers (`all-MiniLM-L6-v2`, 384-dimensional vectors) |
| **Vector DB** | Vector Indexing & Search | FAISS CPU (`faiss.IndexFlatIP`, Cosine Similarity, Isolated Storage) |
| **RAG Engine** | Retrieval-Augmented QA | LangChain PromptTemplate + FAISS Context Retrieval + Source Citations |
| **Backend / DB** | API Gateway & Storage | Node.js Express, MongoDB / Mongoose, Multer, Axios |

---

## 3. Comprehensive Endpoints & Microservice Registry

| Service Module | Route | HTTP Method | Input Payload | Primary Responsibility |
| :--- | :--- | :--- | :--- | :--- |
| **Health Check** | `/api/v1/health/` | `GET` | None | Verify AI service status and loaded model states. |
| **Document Extraction** | `/api/v1/document/extract` | `POST` | Multipart File / Bytes | Extract text from PDF, DOCX, TXT, or Image files. |
| **OCR Engine** | `/api/v1/ocr/process` | `POST` | Image File / Bytes | Run EasyOCR on scanned images or low-text PDF pages. |
| **Preprocessing** | `/api/v1/preprocess/clean-and-chunk` | `POST` | Raw Text | Clean OCR artifacts and split text into 500-word chunks. |
| **NER Engine** | `/api/v1/ner/extract` | `POST` | Cleaned Text | Extract Organizations, People, Dates, Money, and Parties. |
| **Clause Extraction** | `/api/v1/clause/extract` | `POST` | Text | Segment and classify contract clauses into 9 categories. |
| **Summarization** | `/api/v1/summarize/generate` | `POST` | Document Text | Generate executive summary, key takeaways, and obligations. |
| **Risk Engine** | `/api/v1/risk/analyze` | `POST` | Document Text | Calculate risk score (0-100), severity, and page tracing. |
| **Embeddings** | `/api/v1/embeddings/generate` | `POST` | List of Texts | Generate 384d normalized float vectors using MiniLM. |
| **Vector Indexing** | `/api/v1/embeddings/index-document` | `POST` | Document Text, IDs | Index document chunks into isolated FAISS vector store. |
| **Vector Search** | `/api/v1/embeddings/search` | `POST` | Query, IDs, Top-K | Perform cosine similarity search on FAISS vector store. |
| **RAG Query** | `/api/v1/rag/query` | `POST` | Query, IDs | Retrieve FAISS context and synthesize grounded Q&A. |
| **Pipeline Orchestrator** | `/api/v1/analysis/process-pipeline` | `POST` | Document Bytes/Text | Execute complete 9-stage legal analysis pipeline. |

---

## 4. Full Inter-Module Dependency Map

```
USER UPLOAD (Frontend / API)
       │
       ▼
[Express Backend: documentController.js]
       │
       ▼ (POST /api/v1/analysis/process-pipeline)
[FastAPI Microservice: pipeline_service.py]
       │
       ├─► 1. document_service.py (PyMuPDF / python-docx)
       │         └─► Fallback: ocr_service.py (EasyOCR) if text < 20 chars
       │
       ├─► 2. preprocessing_service.py (RegEx Cleanup + spaCy Chunking)
       │
       ├─► 3. ner_service.py (spaCy en_core_web_sm + dslim/bert-base-NER)
       │
       ├─► 4. clause_service.py (RegEx Category Matcher)
       │
       ├─► 5. risk_service.py (Heuristic Risk Matrix + Evidence Traceability)
       │
       ├─► 6. summarization_service.py (DistilBART / Extractive Ranker)
       │
       ├─► 7. embedding_service.py (SentenceTransformers all-MiniLM-L6-v2)
       │
       ├─► 8. vector_db_service.py (FAISS IndexFlatIP + metadata.json)
       │
       └─► 9. Persistence to MongoDB (Document & Analysis collections)

CHATBOT QUERY (AssistantPage.jsx)
       │
       ▼
[Express Backend: chatController.js]
       │
       ▼ (POST /api/v1/rag/query)
[FastAPI Microservice: rag_service.py]
       │
       ├─► 1. vector_db_service.py (FAISS Cosine Similarity Search)
       │
       ├─► 2. Context Construction ([Source 1], [Source 2] with page & chunk ID)
       │
       ├─► 3. LangChain PromptTemplate + Answer Synthesis
       │
       └─► Fallback: Grounded MongoDB synthesis if FAISS is unindexed/offline
```

---

## 5. Regression Protection Checklist

- [x] **FastAPI Startup**: `uvicorn app.main:app --port 8000` launches without errors.
- [x] **Express Backend Startup**: `node server.js` binds to port 5000 and connects to MongoDB.
- [x] **Document Upload**: Receives PDF/DOCX files via Multer multipart upload.
- [x] **PDF Text Extraction**: Extracts text layers via PyMuPDF (`fitz`).
- [x] **DOCX Text Extraction**: Extracts paragraph and table text via `python-docx`.
- [x] **OCR Execution**: Renders low-text PDF pages to 2x resolution PNGs and runs EasyOCR.
- [x] **Text Preprocessing**: Cleans OCR noise, rejoins hyphenated words, and creates 500-word overlapping chunks.
- [x] **NER Entity Extraction**: Identifies Contracting Parties, Organizations, Money amounts, and Dates.
- [x] **Clause Classification**: Categorizes clauses across 9 contract dimensions.
- [x] **Risk Score Computation**: Computes deterministic risk score (0-100) with character/page offsets.
- [x] **Executive Summarization**: Generates overview and key takeaways.
- [x] **Vector Embedding Generation**: Produces 384-dimensional float vectors via `all-MiniLM-L6-v2`.
- [x] **FAISS Index Persistence**: Saves `index.faiss` and `metadata.json` under `storage/vector_store/{user_id}/{doc_id}/`.
- [x] **RAG Vector Search**: Performs cosine similarity search over FAISS index.
- [x] **Chatbot Source Grounding**: Returns grounded answers with explicit citations (`[Source 1]`, page, chunk ID).

---

## 6. Known Fallbacks & Limitations

1. **Rule-Based Clause Extraction**: Uses RegEx keyword patterns rather than a fine-tuned Transformer model.
2. **Deterministic Risk Matrix**: Risk scoring evaluates heuristic rules (+25 for uncapped liability, +20 for immediate termination) rather than ML probability logits.
3. **Legal-BERT & DeBERTa**: Absent from current codebase.
4. **Resilient Chatbot Fallback**: If FAISS is not yet populated for a newly uploaded file, `chatController.js` synthesizes grounded responses from MongoDB document metadata so the user is never stranded.

---

## 7. Safe Integration Points for Future ML Models

To preserve current application stability, future ML model implementations must plug into these exact isolated integration points:

- **Integration Point A (Legal-BERT Clause Classifier)**:
  - File: `app/services/clause_service.py`
  - Function: `_classify_clause_text(text: str)`
  - Strategy: Replace/augment `_CATEGORY_PATTERNS` regex matching with `nlpaueb/legal-bert-base-uncased` sequence classification logits.

- **Integration Point B (DeBERTa-v3 NLI Risk Engine)**:
  - File: `app/services/risk_service.py`
  - Function: `_evaluate_clause_risk(category: str, text: str)`
  - Strategy: Augment rule-based risk weights with `microsoft/deberta-v3-base` zero-shot NLI entailment / contradiction probabilities.

- **Integration Point C (Neural LLM Synthesis)**:
  - File: `app/services/rag_service.py`
  - Function: `_synthesize_answer(query: str, context_text: str, sources: List[RAGSourceReference])`
  - Strategy: Connect local Ollama (`llama3` / `mistral`) or cloud LLM client to process LangChain prompts.
