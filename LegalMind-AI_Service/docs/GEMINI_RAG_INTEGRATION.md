# LegalMind AI - Gemini API & Grounded RAG Integration Architecture

## Overview
This document describes the technical architecture and integration of the Google Gemini API into LegalMind AI's production RAG (Retrieval-Augmented Generation) pipeline.

---

## Key Architecture & Integration Flow

```
+------------------+         +-------------------------+         +----------------------------+
|  User PDF / Doc  |  ---->  |  Document Extractor &   |  ---->  |  FAISS Vector Store &      |
|    Upload        |         |  PyMuPDF / OCR Pipeline |         |  Per-User/Doc Storage      |
+------------------+         +-------------------------+         +----------------------------+
                                                                               |
                                                                               v
+------------------+         +-------------------------+         +----------------------------+
|  React Frontend  |  <----  | Express Backend Proxy & |  <----  |  Gemini Grounded Reasoning |
|  Citations & UI  |         | Document Security Check |         |  & Anti-Hallucination RAG  |
+------------------+         +-------------------------+         +----------------------------+
```

1. **Document Upload & Ingestion**: Real user PDF/DOCX files are ingested, parsed, text-extracted, chunked, and stored into isolated FAISS vector indices under `data/faiss_index/{user_id}/{doc_id}/`.
2. **Strict Isolation**: Multi-tenant isolation is enforced at vector storage and search levels by indexing and querying explicitly by `user_id` and `doc_id`.
3. **Retrieval**: FAISS vector similarity search retrieves top relevant contract chunks. Malformed, out-of-range, or cross-tenant sources are automatically filtered out.
4. **Gemini Grounded Reasoning (`gemini_service.py`)**:
   - Uses the official `google-genai` Python SDK.
   - Enforces strict anti-hallucination prompts (`SYSTEM_GROUNDED_PROMPT`).
   - Requires inline citations (`[Source 1]`, `[Source 2]`) for all factual assertions.
   - If no relevant evidence is found, returns standardized fallback: `"I cannot find relevant evidence in the uploaded document."`
5. **Deterministic Risk Scoring**:
   - Fact extraction & risk analysis derive strictly from grounded contract evidence quotes.
   - Weighted score formula across 9 legal categories (Liability 20%, Indemnification 15%, Termination 15%, Payment 10%, Confidentiality 10%, IP 10%, Data Protection 10%, Governing Law 5%, Non-Compete 5%).
6. **Graceful Fallback & Zero Downtime**:
   - If `GEMINI_API_KEY` is omitted or Gemini API is offline, the service automatically falls back to rule-grounded synthesis without breaking production operations or test suites.

---

## Configuration & Environment Variables

Configure the following environment variables in `.env` or system environment:

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

> **Security Note**: `GEMINI_API_KEY` is maintained exclusively in server-side configuration and is NEVER exposed to the client browser or logged in stdout/stderr.

---

## Verification & Test Execution

Run the complete AI Service test suite:

```bash
cd LegalMind-AI_Service
python -m unittest discover tests
```

Expected Output:
```
Ran 211 tests in ~75s
OK
```
