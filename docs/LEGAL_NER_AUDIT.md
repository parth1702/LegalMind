# LEGALMIND-AI — PHASE 3.1: LEGAL NER — EXISTING PIPELINE AUDIT REPORT

**Document Version**: 3.1.0  
**Audit Date**: August 8, 2026  
**Status**: AUDIT ONLY COMPLETE (No Production Code Modified)

---

## 1. Executive Summary

This report completes **Phase 3.1: Legal NER Pipeline Audit**.

The existing `LegalMind-AI` platform baseline remains **100% intact and operational** with **42 / 42 passing tests**. Zero production code files were modified, zero package upgrades were made, and no new dependencies were installed.

---

## 2. Task 1 — Current NER Architecture Inspection

### Operational NER Engines
The current entity extraction engine ([app/services/ner_service.py](file:///c:/Users/Hp/OneDrive/Desktop/sgp-7/LegalMind-AI_Service/app/services/ner_service.py)) combines three distinct extraction strategies:

1. **spaCy Engine**:
   - Model: `en_core_web_sm` (with fallback to `spacy.blank("en")` if uninstalled).
   - Extracted Labels: `PERSON`, `ORGANIZATION` (`ORG`/`NORP`), `LOCATION` (`GPE`/`LOC`), `DATE` (`DATE`/`TIME`), `MONEY`.
   - Base Confidence: `0.88`.

2. **HuggingFace Transformers Engine**:
   - Model: `dslim/bert-base-NER` (BERT token classification pipeline).
   - Execution: CPU inference (`device=-1`), `aggregation_strategy="simple"`.
   - Extracted Labels: `PER` -> `PERSON`, `ORG` -> `ORGANIZATION`, `LOC` -> `LOCATION`.
   - Model-Derived Confidence: `float(res.get("score"))`.

3. **Legal Rule & RegEx Matcher Engine**:
   - `_PARTY_PATTERN`: Captures contracting parties and roles (`Client`, `Vendor`, `Licensor`, `Company`, `Executive`, `Tenant`, etc.) -> `CONTRACT_PARTY` (Confidence `0.96`).
   - `_LEGAL_REF_PATTERN`: Captures sections, statutory citations, U.S.C., Acts (`GDPR`, `IT Act 2000`, `DPDP Act 2023`) -> `LEGAL_REF` (Confidence `0.93`).
   - `_MONEY_PATTERN`: Captures currencies (`$`, `€`, `£`, `₹`, `INR`, `USD`) -> `MONEY` (Confidence `0.92`).
   - `_JURISDICTION_PATTERN`: Captures state courts & jurisdictions -> `LOCATION` (Confidence `0.94`).
   - `_LEGAL_DATE_PATTERN`: Captures formal legal date expressions -> `DATE` (Confidence `0.93`).

4. **Span Overlap Resolution & Priority Order**:
   - `_resolve_overlapping_spans()` resolves character offset collisions prioritizing:
     `CONTRACT_PARTY` (10) > `LEGAL_REF` (9) > `LOCATION` (8.5) > `MONEY` (8) > `DATE` (7) > `PERSON` (6) > `ORGANIZATION` (5).

---

## 3. Task 2 — Complete Data Flow & Integration Points

```
[Document Upload / File Bytes]
       │
       ▼
[document_service.py] (PyMuPDF / python-docx / EasyOCR text layer)
       │
       ▼
[preprocessing_service.py] (RegEx cleanup & 500-word chunking)
       │
       ▼
[pipeline_service.py] ───► Calls ner_service.extract_entities(NERRequest)
       │                        │
       │                        ├─► 1. spaCy (en_core_web_sm)
       │                        ├─► 2. HuggingFace (dslim/bert-base-NER)
       │                        └─► 3. Legal RegEx Pattern Matchers
       │                                  │
       │                                  ▼
       │                    [Span Overlap Resolution]
       │                                  │
       │                                  ▼
       │                    [EntityItem Pydantic Array]
       │                                  │
       ▼ ◄────────────────────────────────┘
[Express Backend: documentController.js] (Stores entities in MongoDB)
       │
       ▼
[React Frontend: PartiesAndEntitiesCard.jsx] (Displays Parties & Entities)
```

### Safe Integration Point for Legal-Domain NER
- **File**: `app/services/ner_service.py`
- **Method**: `extract_entities(request: NERRequest)`
- **Hook Position**: Introduce `_extract_legal_ner_entities(text: str)` between spaCy (Step 1) and HuggingFace General (Step 2).
- **Isolation Guarantee**: Executed behind a try/except lazy-loader. If the Legal NER model is offline or uninitialized, execution continues silently with spaCy + `dslim/bert-base-NER` + Rule Matchers.

---

## 4. Task 3 — Schema Compatibility Contract

### Established Pydantic Entity Model ([app/schemas/ner.py](file:///c:/Users/Hp/OneDrive/Desktop/sgp-7/LegalMind-AI_Service/app/schemas/ner.py#L9-L21))

```python
class EntityItem(BaseModel):
    text: str                  # Canonical extracted entity text
    label: str                 # PERSON, ORGANIZATION, LOCATION, DATE, MONEY, LEGAL_REF, CONTRACT_PARTY
    start_char: int            # 0-indexed character start offset
    end_char: int              # 0-indexed character end offset
    confidence: float          # Model confidence score (0.0 to 1.0)
    source: str                # Engine source ('spacy', 'huggingface', 'legal_matcher', 'legal_ner')
    metadata: Dict[str, Any]   # Context metadata (e.g. {"role": "Vendor"}, {"page": 1})
```

### Field Mapping Audit Table

| Requested Contract Field | Current Established Field | Status in Project Schema |
| :--- | :--- | :--- |
| `entity` / `text` | `text` | **EXISTS** (`text: str`) |
| `label` | `label` | **EXISTS** (`label: str`) |
| `start` | `start_char` | **EXISTS** (`start_char: int`) |
| `end` | `end_char` | **EXISTS** (`end_char: int`) |
| `page` | `metadata["page"]` | **EXISTS inside `metadata` dictionary** |
| `confidence` | `confidence` | **EXISTS** (`confidence: float`) |
| `source_model` | `source` | **EXISTS** (`source: str`) |

---

## 5. Task 4 — Legal NER Model Selection & Research

### Recommended Model: `subugoe/legal-bert-base-uncased-ner`

- **HuggingFace Identifier**: `subugoe/legal-bert-base-uncased-ner`
- **Architecture**: `BertForTokenClassification` fine-tuned on Legal-BERT (`nlpaueb/legal-bert-base-uncased`).
- **Genuinely Supported Labels**:
  - `PER` -> Mapped to `PERSON` (Individual legal actors, judges, signatories)
  - `ORG` -> Mapped to `ORGANIZATION` (Corporations, law firms, institutions)
  - `LOC` -> Mapped to `LOCATION` (Jurisdictions, governing law venues)
  - `LAW` -> Mapped to `LEGAL_REF` (Statate codes, Acts, legal citations)
- **Legal Fine-Tuning Evidence**: Trained specifically on English legal documents and court cases (EUR-Lex / LegalNER corpora).
- **Input / Output Format**: Takes raw legal text (truncated to 512 tokens), returns token span entities with start/end character offsets and softmax probability scores.
- **Model Confidence**: Fully available via HuggingFace `score` parameter (0.0 to 1.0).
- **Tokenizer Requirements**: `AutoTokenizer.from_pretrained("subugoe/legal-bert-base-uncased-ner")`.
- **Resource Requirements**: ~440 MB model weights. Runs efficiently on CPU (Windows Python 3.10 environment).

---

## 6. Task 5 — Failure Isolation Strategy

```
                          ┌───────────────────────────┐
                          │    INPUT CONTRACT TEXT    │
                          └─────────────┬─────────────┘
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 ▼                                             ▼
       [Legal NER Engine]                             [Existing NER Engines]
   (subugoe/legal-bert-base-uncased-ner)              (spaCy + General BERT + Rules)
                 │                                             │
      ┌──────────┴──────────┐                                  │
      │                     │                                  │
   SUCCESS               FAILURE / OFFLINE                     │
      │                     │                                  │
      ▼                     ▼                                  │
Legal Entity Spans    Log Warning & Skip ──────────────────────┤
      │                     │                                  │
      └─────────────────────┼──────────────────────────────────┘
                            │
                            ▼
              [Span Overlap Resolution Engine]
                            │
                            ▼
            [Consolidated EntityItem Array]
```

---

## 7. Task 6 — Phase 3.2 Integration File Plan

When Phase 3.2 is explicitly authorized, the following files will be modified or added:

1. **[NEW] `app/services/legal_ner_service.py`**:
   - Encapsulates `subugoe/legal-bert-base-uncased-ner` with lazy initialization and zero-crash fallback.
2. **[MODIFY] `app/services/ner_service.py`**:
   - Connects `legal_ner_service` into `extract_entities` behind a feature flag (`use_legal_ner`).
   - Maps `subugoe` labels (`PER`, `ORG`, `LOC`, `LAW`) into established schema labels.
   - Preserves existing spaCy, `dslim/bert-base-NER`, and legal regex matchers 100% unchanged.
3. **[NEW] `tests/test_legal_ner.py`**:
   - Unit tests covering model loading, inference, empty text, long text, and fallback states.

---

## 8. Task 7 — Phase 3.2 Test Plan (10 Test Scenarios)

1. **Test 1 — Model Loading**: Verify lazy initialization of `subugoe/legal-bert-base-uncased-ner`.
2. **Test 2 — Legal Entity Inference**: Verify extraction of legal actors and statutory citations.
3. **Test 3 — Existing Engine Preservation**: Verify spaCy, `dslim/bert-base-NER`, and rules run in parallel.
4. **Test 4 — Fallback Handling**: Verify simulated offline model returns `"source": "spacy/rules"` without throwing exceptions.
5. **Test 5 — Malformed / Empty Text**: Verify `""` returns `total_entities: 0` safely.
6. **Test 6 — Long Document Truncation**: Verify text > 1000 words truncates at 512 tokens smoothly.
7. **Test 7 — Entity Deduplication**: Verify `_resolve_overlapping_spans()` resolves duplicate spans correctly.
8. **Test 8 — Schema Compliance**: Verify returned items conform to `EntityItem(text, label, start_char, end_char, confidence, source, metadata)`.
9. **Test 9 — Regression Protection**: Verify all 42 existing baseline tests pass cleanly (`42 / 42 PASSED`).
10. **Test 10 — Multi-Document Validation**: Test on sample non-disclosure agreement and master services agreement.

---

## 9. Audit Confirmation

> **CONFIRMATION**:
> - **Zero production code files were modified.**
> - **Zero new packages were installed.**
> - **All 42 baseline tests remain 100% passing.**
> - **Phase 3.2 implementation HAS NOT BEEN STARTED.**
