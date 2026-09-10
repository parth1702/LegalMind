# Phase 8.1 MongoDB Analysis Integration & Persistence Document

## 1. Executive Summary & Core Guarantees

This document details the integration of the **Evidence-Backed Legal Risk Engine** into the existing LegalMind MongoDB backend.

### Architectural Directives
1. **NO MONGODB REDESIGN**: Uses existing `Document` and `Analysis` collections.
2. **NO DUPLICATE RECORDS**: Enforces unique indexing (`{ document: docId }`) so re-analysis updates existing analysis documents.
3. **DOCUMENT SOURCE OF TRUTH**: Every analysis is linked to a valid uploaded `Document` ID and `User` ID.
4. **NO FAKE OR MOCK ANALYSIS**: If physical file reading or analysis fails, a controlled HTTP 400 error status is returned (`'Physical document file not found'`); fake analysis documents are NEVER created.
5. **SINGLE SOURCE OF TRUTH**: Synchronizes `riskScore` and `riskLevel` with the `Document` record in MongoDB.

---

## 2. MongoDB Schema Persistence Mapping

Location: `LegalMind-Backend/models/Analysis.js` & `LegalMind-Backend/models/Document.js`

| Required Persistence Field | MongoDB Collection | Schema Location | Data Type & Mapping |
|---|---|---|---|
| `document_id` | `analyses` | `Analysis.document` | `ObjectId` (ref `Document`, unique index) |
| `user_id` | `analyses` | `Analysis.user` | `ObjectId` (ref `User`, index) |
| `filename` | `analyses` | `Analysis.filename` | `String` (original uploaded filename) |
| `overall_score` | `analyses` & `documents` | `Analysis.riskScore` & `Document.riskScore` | `Number` (0 to 100) |
| `overall_level` | `analyses` & `documents` | `Analysis.riskLevel` & `Document.riskLevel` | `String` (`low`, `medium`, `high`, `critical`) |
| `category_scores` | `analyses` | `Analysis.categoryScores` | `Map` of `Number` (0–100 per category) |
| `findings` | `analyses` | `Analysis.risks` | `Array` of risk items (`clauseTitle`, `severity`, `description`) |
| `evidence` | `analyses` | `Analysis.evidence` | `Array` of grounded items (`ruleId`, `evidenceText`, `page`, `chunkId`, `startChar`, `endChar`, `confidence`) |
| `recommendations` | `analyses` | `Analysis.recommendations` | `Array` of strings |
| `confidence` | `analyses` | `Analysis.confidence` | `Number` (0.0 to 1.0) |
| `created_at` | `analyses` | `Analysis.createdAt` | `Date` (Mongoose timestamp) |
| `updated_at` | `analyses` | `Analysis.updatedAt` | `Date` (Mongoose timestamp) |

---

## 3. Analysis Execution Flow (`documentController.js`)

```
POST /api/documents/upload or /api/documents/:id/reanalyze
       │
       ▼
1. Retrieve Document by document_id
       │
       ▼
2. Verify User Ownership (req.user._id === document.user)
       │
       ▼
3. Retrieve Physical File & Extract Content
       │  ├── If File Missing: Return Controlled HTTP 400 (NO fake data created)
       │  └── If File Readable: Proceed to Risk Engine
       ▼
4. Run Evidence-Backed Risk Engine (realLegalAnalyzer.js / AI Service)
       │
       ▼
5. Upsert Analysis to MongoDB Analysis Collection (Analysis.findOneAndUpdate)
       │
       ▼
6. Synchronize riskScore & riskLevel on Document Record (Document.updateOne)
```

---

## 4. Integration Test Suite Matrix (`tests/test_mongodb_analysis.py`)

All 8 MongoDB integration test scenarios passed OK:

1. **Correct Document**: Analyzes document and persists grounded analysis tied to valid `document_id` and `user_id`.
2. **Wrong Document**: Query for non-existent document ID raises controlled 404 error.
3. **Wrong User**: Request by unauthorized user raises controlled 403 permission error.
4. **Missing Analysis**: Verifies clean default state before initial analysis.
5. **Re-Analysis**: Updating contract text re-evaluates analysis without creating duplicate records.
6. **Duplicate Analysis**: Re-running analysis on identical document maintains single analysis document.
7. **Failed Analysis**: Missing physical file returns controlled error without persisting fake analysis.
8. **Database Failure**: Graceful exception handling during DB connection/query failures.
