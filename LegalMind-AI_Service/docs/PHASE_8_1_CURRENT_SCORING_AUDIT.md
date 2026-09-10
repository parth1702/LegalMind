# Forensic Audit Report: Current LegalRisk Scoring Pipeline & Data Flow

## 1. Executive Summary

This read-only forensic audit maps the end-to-end architecture, score calculations, keyword heuristics, hardcoded fallbacks, and data persistence paths across `LegalMind-Backend`, `LegalMind-AI_Service`, and `LegalMind-Frontend`.

---

## 2. Complete End-to-End Tracing Path

```
REAL UPLOADED PDF
  │
  ├─► 1. Upload Endpoint: POST /api/documents/upload (LegalMind-Backend/routes/documentRoutes.js)
  │
  ├─► 2. Document Controller: uploadDocument (LegalMind-Backend/controllers/documentController.js)
  │
  ├─► 3. File Buffer: fs.readFileSync(req.file.path) (Multer storage at /uploads/filename.pdf)
  │
  ├─► 4. Text Extraction & Pipeline Delegation:
  │      ├─► AI Service: POST /api/v1/analysis/upload-and-process (LegalMind-AI_Service)
  │      └─► Local Engine: realLegalAnalyzer.js (LegalMind-Backend/utils/realLegalAnalyzer.js)
  │
  ├─► 5. Risk Calculation:
  │      ├─► Python AI Service: risk_service.py (LegalMind-AI_Service/app/services/risk_service.py)
  │      └─► Backend Engine: realLegalAnalyzer.js (LegalMind-Backend/utils/realLegalAnalyzer.js)
  │
  ├─► 6. MongoDB Persistence:
  │      ├─► Document Model: document.riskScore, document.riskLevel, document.status = 'analyzed'
  │      └─► Analysis Model: Analysis.findOneAndUpdate({ document: docId }, { riskScore, riskLevel, summary, risks })
  │
  ├─► 7. Frontend API Retrieval:
  │      ├─► Document List: GET /api/documents (documentService.js -> getDocumentsApi)
  │      └─► Report Analysis: GET /api/documents/:id/analysis (documentService.js -> getDocumentAnalysisApi)
  │
  └─► 8. UI Rendering (AnalysisPage.jsx):
         ├─► RiskScoreCard.jsx: Displays overallRiskScore (e.g. 28/100)
         └─► ExecutiveSummaryCard.jsx: Displays overview text & primary counsel takeaways
```

---

## 3. Detailed Audit Inventory Findings

### 1. Where `risk_score` / `riskScore` is Created

| Location | File Path | Function / Line | Implementation Details |
|---|---|---|---|
| **Python Risk Engine** | `LegalMind-AI_Service/app/services/risk_service.py` | `analyze_risk` (Line 326) | `overall_risk_score = min(100.0, round(total_risk_score_points, 1))` |
| **Backend Real Analyzer** | `LegalMind-Backend/utils/realLegalAnalyzer.js` | `analyzeContractFileRealTime` (Line 123) | `finalRiskScore = Math.min(98, Math.max(8, Math.round(calculatedScore)))` |
| **Backend Document Model** | `LegalMind-Backend/models/Document.js` | Mongoose Schema (Line 81) | Default schema property `riskScore: { type: Number, default: 28 }` |
| **Backend Analysis Model** | `LegalMind-Backend/models/Analysis.js` | Mongoose Schema (Line 59) | Default schema property `riskScore: { type: Number, default: 0 }` |
| **Backend Document Controller** | `LegalMind-Backend/controllers/documentController.js` | `uploadDocument` (Line 49) & `getAnalysisByDocumentId` (Line 791) | Evaluates `realAnalysis.riskScore` and assigns to `document.riskScore` |
| **Frontend Documents Page** | `LegalMind-Frontend/src/pages/DocumentsPage.jsx` | `useMemo` mapper (Line 72) | `riskScore: doc.riskScore !== undefined ? doc.riskScore : 28` |
| **Frontend Admin Console** | `LegalMind-Frontend/src/pages/AdminDashboardPage.jsx` | Document Table (Line 505) | `Score: {d.riskScore !== undefined ? d.riskScore : 28}%` |
| **Frontend Analysis Page** | `LegalMind-Frontend/src/pages/AnalysisPage.jsx` | `reportData` memo (Lines 142, 163) | `overallRiskScore: activeDocObj.riskScore ?? rawReport.overallRiskScore ?? 28` |

---

### 2. Where `risk_level` / `riskLevel` is Created

- `LegalMind-AI_Service/app/services/risk_service.py` (Lines 331–338):
  - `>= 76.0`: `Critical`
  - `>= 51.0`: `High`
  - `>= 26.0`: `Medium`
  - Otherwise: `Low`
- `LegalMind-Backend/utils/realLegalAnalyzer.js` (Lines 126–129):
  - `> 75`: `critical`
  - `> 50`: `high`
  - `> 30`: `medium`
  - Otherwise: `low`
- Mongoose Schema Defaults: `Document.js` (Line 87: `'low'`), `Analysis.js` (Line 65: `'low'`).

---

### 3. Hardcoded, Fallback & Default Values Audit

- **Hardcoded Default Schema Values**: `Document.js` defaults `riskScore: 28`, `riskLevel: 'low'`, `status: 'analyzed'`.
- **Backend Fallback**: In `documentController.js` (Line 791), if document or analysis riskScore is missing, falls back to `realEval.riskScore` or `28`.
- **Frontend Fallbacks**: `AnalysisPage.jsx` (Line 177) uses `mockAiAnalysisReport` (`overallRiskScore: 32` / `28`) if no active document ID is selected.
- **Random Scores Check**: **0 random risk scores** (`Math.random()`) are used for risk scoring anywhere in the codebase. `Math.random()` is only used for temporary ticket and DOM upload IDs.

---

### 4. Keyword Scoring & Filename Bias Audit

- **Keyword Risk Rules in Python Engine (`risk_service.py`)**:
  - Missing Limitation of Liability: +18.0
  - Missing Confidentiality: +12.0
  - Missing Governing Law: +10.0
  - Missing Force Majeure: +6.0
  - Uncapped Liability (`"uncapped"`, `"no cap"`): +25.0
  - Waiver of Remedies (`"sole remedy"`, `"waive"`): +15.0
  - Broad Indemnification (`"indemnify"`, `"hold harmless"`): +18.0
  - Duty to Defend (`"defend"`): +10.0
  - Unilateral Termination (`"convenience"`, `"immediate"`): +20.0
  - Penalty Interest (`"late fee"`, `"1.5%"`): +14.0
  - Auto-Renewal Trap (`"auto-renew"`): +14.0
  - Non-Compete / Restrictive Covenant (`"non-compete"`): +16.0

- **Keyword & Filename Bias in Backend (`realLegalAnalyzer.js`)**:
  - Base Score: +15
  - Keyword Indemnification: +28
  - Keyword Non-Compete: +22
  - Keyword DPDP Data Principal: +12 (or +18 if missing)
  - Keyword Immediate Termination: +20
  - **Filename Bias**:
    - `.includes('msa')` or `.includes('master')`: +5
    - `.includes('nda')`: -8
    - `.includes('employment')`: +14

---

### 5. Evidence, Page & Chunk Traceability

- **Python Service (`risk_service.py`)**: `RiskItem` includes `supporting_clause` and `location` (`paragraph`, `start_char`, `end_char`, `page`).
- **FAISS Vector Database (`vector_db_service.py` & `vector_store.py`)**: Document text chunks indexed with metadata (`doc_id`, `user_id`, `chunk_id`, `page_number`, `start_char`, `end_char`, `text`).

---

### 6. MongoDB Persistence vs Frontend Display Verification

- **Saved to MongoDB**: **YES**. Uploaded contract scores and risk levels are persisted in MongoDB `documents` collection (`document.riskScore`, `document.riskLevel`) and `analyses` collection (`analysis.riskScore`, `analysis.riskLevel`, `analysis.summary`, `analysis.risks`).
- **Frontend Display**: `AnalysisPage.jsx`, `DocumentsPage.jsx`, and `AdminDashboardPage.jsx` query MongoDB endpoints (`GET /api/documents` and `GET /api/documents/:id/analysis`) and render the MongoDB persisted data. (Only falls back to mock dataset if backend is unreachable or no document is selected).

---

## 4. Protected Files & Next Step Modification Targets

### Files to REMAIN UNTOUCHED
- `LegalMind-AI_Service/app/services/vector_store.py` (FAISS vector engine)
- `LegalMind-AI_Service/app/services/rag_service.py` (RAG citation & user security isolation)
- `LegalMind-Backend/middleware/authMiddleware.js` (JWT & RBAC authorization)
- `LegalMind-Backend/config/db.js` (Mongoose DB connection)

### Target Files for Next Step (Evidence-Backed Scoring Engine)
1. `LegalMind-AI_Service/app/services/risk_service.py` (Enhance evidence-backed scoring engine)
2. `LegalMind-Backend/utils/realLegalAnalyzer.js` (Upgrade to evidence-grounded risk evaluator)
3. `LegalMind-Backend/controllers/documentController.js` (Persist evidence-backed risk analysis)
4. `LegalMind-Frontend/src/pages/AnalysisPage.jsx` (Render verified evidence citations and paragraph anchors)
