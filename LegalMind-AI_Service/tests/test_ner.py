"""
Standalone & Dataset Tests for Step 24 — Legal NLP and Entity Extraction.

Run from LegalMind-AI_Service directory:
    python tests/test_ner.py
"""
import asyncio
import sys
import textwrap
from pathlib import Path

# Force UTF-8 output on Windows
if sys.stdout.encoding != "utf-8":
    import io as _io
    sys.stdout = _io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

# Allow imports relative to LegalMind-AI_Service root
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

SAMPLE_LEGAL_CONTRACT = textwrap.dedent("""\
    MASTER SERVICE AGREEMENT

    This Master Service Agreement ("Agreement") is made and entered into as of January 1, 2026 ("Effective Date"),
    by and between Acme Corporation ("Client"), a Delaware corporation having its principal place of business in
    New York, NY, and LegalTech Solutions Inc. ("Service Provider"), a California corporation.

    RECITALS:
    WHEREAS, John Doe, Chief Executive Officer of Client, has authorized Service Provider to perform legal AI analysis.

    1. COMPENSATION & FEES
       Client shall pay Service Provider a total fee of $150,000 USD for the services. Any overdue payments shall incur
       a penalty of 500 EUR per week.

    2. LIMITATION OF LIABILITY
       In accordance with Section 14.2 of the Delaware General Corporation Law, total liability under Section 4.1
       shall not exceed $500,000.

    3. GOVERNING LAW & JURISDICTION
       This Agreement shall be governed by the laws of the State of Delaware. All disputes shall be brought before
       the Delaware Chancery Court.
""")


async def run_ner_tests() -> None:
    from app.schemas.ner import NERRequest
    from app.services.ner_service import ner_service

    print("=" * 65)
    print("  STEP 24 - LEGAL NLP AND ENTITY EXTRACTION TEST SUITE")
    print("=" * 65)

    failures = []

    # Test 1: Full Entity Extraction
    print("\n--- TEST 1: Full Legal Entity Extraction ---")
    try:
        req = NERRequest(text=SAMPLE_LEGAL_CONTRACT)
        res = await ner_service.extract_entities(req)

        print(f"Total Entities Extracted: {res.total_entities}")
        for ent in res.entities:
            meta = f" ({ent.metadata})" if ent.metadata else ""
            print(f"  • [{ent.label:15s}] '{ent.text}'{meta}")

        labels = {e.label for e in res.entities}
        print(f"\nExtracted Label Set: {sorted(labels)}")

        assert res.success, "Extraction failed"
        assert "CONTRACT_PARTY" in labels or "ORGANIZATION" in labels, "Missing party/org"
        assert "DATE" in labels, "Missing date"
        assert "MONEY" in labels, "Missing money"
        assert "LEGAL_REF" in labels, "Missing legal ref"
        assert "LOCATION" in labels, "Missing location"

        print("  [PASS] TEST 1 PASSED\n")
    except Exception as exc:
        print(f"  [FAIL] TEST 1 FAILED: {exc}\n")
        failures.append(f"Test 1 (Full Extraction): {exc}")

    # Test 2: Filtered Entity Types
    print("\n--- TEST 2: Filtered Entity Extraction (MONEY & LEGAL_REF) ---")
    try:
        req_filter = NERRequest(text=SAMPLE_LEGAL_CONTRACT, entity_types=["MONEY", "LEGAL_REF"])
        res_filter = await ner_service.extract_entities(req_filter)

        print(f"Filtered Entities Count: {res_filter.total_entities}")
        filtered_labels = {e.label for e in res_filter.entities}
        for ent in res_filter.entities:
            print(f"  • [{ent.label:15s}] '{ent.text}'")

        assert all(l in ["MONEY", "LEGAL_REF"] for l in filtered_labels), f"Unexpected label in filtered set: {filtered_labels}"
        print("  [PASS] TEST 2 PASSED\n")
    except Exception as exc:
        print(f"  [FAIL] TEST 2 FAILED: {exc}\n")
        failures.append(f"Test 2 (Filtered Types): {exc}")

    # Test 3: Real Contract Dataset Extraction
    print("\n--- TEST 3: Real Contract Dataset Extraction ---")
    try:
        raw_dataset_file = ROOT.parent / "contract-nli" / "contract-nli" / "raw" / "01_Bosch-Automotive-Service-Solutions-Mutual-Non-Disclosure-Agreement-7-12-17.pdf"
        if raw_dataset_file.exists():
            from app.services.document_service import document_service

            with open(raw_dataset_file, "rb") as f:
                doc_bytes = f.read()

            doc_res = await document_service.process_document(doc_bytes, raw_dataset_file.name)
            ner_req = NERRequest(text=doc_res.normalized_text[:4000])  # Process first 4000 chars
            ner_res = await ner_service.extract_entities(ner_req)

            print(f"Dataset Contract: {raw_dataset_file.name}")
            print(f"Total Entities Identified: {ner_res.total_entities}")
            for ent in ner_res.entities[:12]:  # Print first 12
                print(f"  • [{ent.label:15s}] '{ent.text}'")

            assert ner_res.success
            assert ner_res.total_entities > 0, "No entities found in dataset contract"
            print("  [PASS] TEST 3 PASSED\n")
        else:
            print(f"  [SKIP] Dataset file not found at {raw_dataset_file}")
    except Exception as exc:
        print(f"  [FAIL] TEST 3 FAILED: {exc}\n")
        failures.append(f"Test 3 (Dataset Contract): {exc}")

    # Summary
    print("=" * 65)
    if failures:
        print(f"  [FAIL] {len(failures)} test(s) FAILED:")
        for f in failures:
            print(f"    - {f}")
        sys.exit(1)
    else:
        print("  [PASS] ALL STEP 24 NER TESTS PASSED SUCCESSFULLY!")
    print("=" * 65 + "\n")


if __name__ == "__main__":
    asyncio.run(run_ner_tests())
