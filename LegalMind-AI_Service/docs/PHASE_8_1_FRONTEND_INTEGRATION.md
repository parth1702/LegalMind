# Phase 8.1 Frontend Evidence-Backed Risk Integration Document

## 1. Executive Summary & Core Rules

This document details the frontend integration connecting React `AnalysisPage.jsx` directly to the evidence-backed legal risk backend analysis.

### Core Frontend Guarantees
1. **NO SCORE GENERATION IN REACT**: React renders the exact score returned by the server (`rawReport.overallRiskScore ?? activeDocObj.riskScore`).
2. **NO MOCK ANALYSIS DATA**: Removed `mockAiAnalysisReport` and `mockAnalysisDocument` for score/analysis generation.
3. **NO FINDING WITHOUT EVIDENCE**: Findings without verifiable document text evidence are filtered out and hidden.
4. **DOCUMENT ID URL FLOW**: Reads `documentId` parameter directly from `/app/analysis/:documentId`.
5. **CONTROLLED ERROR STATE**: Displays a user-friendly error card (`"Analysis unavailable. Please retry."`) with a manual retry trigger if backend analysis fails.

---

## 2. Component Integration Architecture

Location: `LegalMind-Frontend/src/pages/AnalysisPage.jsx` & `LegalMind-Frontend/src/components/ai-analysis/EvidenceFindingsCard.jsx`

```
/app/analysis/:documentId
       │
       ▼
GET /api/documents/:documentId/analysis
       │
       ▼
Backend Returns Server Analysis Object
       │
       ▼
React AnalysisPage Renders:
  ├── 1. Overall Risk Score Gauge (RiskScoreCard)
  ├── 2. Risk Tier Badge (LOW, MEDIUM, HIGH, CRITICAL)
  ├── 3. Weighted Category Scores Grid (EvidenceFindingsCard)
  └── 4. Grounded Risk Findings Array (EvidenceFindingsCard)
        ├── Category Name & Rule ID
        ├── Severity Tier (LOW, MEDIUM, HIGH, CRITICAL)
        ├── Risk Finding Explanation
        ├── Verifiable Text Evidence Snippet ("quoted text...")
        ├── Page Number
        ├── Confidence Score (e.g. 94%)
        └── Actionable Recommendation
```

---

## 3. UI Display Example Concept

```
┌──────────────────────────────────────────────────────────────────┐
│  AI Legal Exposure Index                       Engine v2.4       │
│                                                                  │
│  72 / 100               [ HIGH RISK BADGE ]                     │
│  Uncapped Liability & Exposure                                   │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ WEIGHTED CATEGORY SCORES                                         │
│  Liability: 85.0 / 100      Termination: 50.0 / 100              │
│  Indemnification: 65.0 / 100 Data Protection: 45.0 / 100         │
├──────────────────────────────────────────────────────────────────┤
│ GROUNDED RISK FINDINGS (2)                                       │
│                                                                  │
│ [LIABILITY] • LIABILITY_UNLIMITED              [HIGH RISK • 94%] │
│ Finding: No general liability cap identified.                    │
│                                                                  │
│ 📄 Document Evidence Snippet (Page 8):                           │
│ "Party A shall indemnify and hold harmless Party B without any   │
│  monetary limitation..."                                         │
│                                                                  │
│ 💡 Recommendation: Negotiate a mutual liability cap equal to     │
│    12 months of fees paid.                                       │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Controlled Error State Specification

If backend response fails (`isAnalysisError === true`):

```jsx
<div className="card-base p-8 text-center space-y-4 border-rose-900/40 bg-rose-950/20 my-6">
  <AlertCircle className="w-6 h-6 text-rose-400 mx-auto" />
  <h3 className="text-base font-bold text-rose-200">Analysis unavailable. Please retry.</h3>
  <p className="text-xs text-slate-400">
    The server could not retrieve or complete evidence extraction for this document.
  </p>
  <button onClick={() => refetchAnalysis()} className="btn btn-secondary btn-sm mx-auto">
    <RefreshCw className="w-3.5 h-3.5" />
    <span>Retry Server Analysis</span>
  </button>
</div>
```

---

## 5. Verification Matrix
- `npm run build` on `LegalMind-Frontend`: **PASSED OK** (`✓ 2645 modules transformed in 10.92s`).
- Complete Python Test Suite (`python -m unittest discover tests`): **184 / 184 Tests PASSED OK**.
