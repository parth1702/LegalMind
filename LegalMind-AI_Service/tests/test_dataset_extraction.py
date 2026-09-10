"""
Dataset extraction test for Step 23 — Document Text Extraction.
Executes text extraction pipeline against real dataset contracts from contract-nli/contract-nli/raw.
"""
import asyncio
import os
import sys
from pathlib import Path

# Allow imports relative to the LegalMind-AI_Service root
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

# Path to contract-nli dataset raw directory
DATASET_RAW_DIR = ROOT.parent / "contract-nli" / "contract-nli" / "raw"


async def test_dataset_files():
    from app.services.document_service import document_service

    print("=" * 65)
    print("  STEP 23 - TESTING DOCUMENT TEXT EXTRACTION ON REAL DATASET FILES")
    print("=" * 65)

    if not DATASET_RAW_DIR.exists():
        print(f"Dataset directory not found at: {DATASET_RAW_DIR}")
        return

    # Select representative files of different types: PDF, TXT, HTM
    sample_files = [
        "01_Bosch-Automotive-Service-Solutions-Mutual-Non-Disclosure-Agreement-7-12-17.pdf",
        "064-19 Non Disclosure Agreement 2019.pdf",
        "1002276_0001036050-99-002047_document_13.txt",
        "1001113_0000950134-07-005231_f27921orexv99wxdyx3y.htm",
    ]

    passed = 0
    total = len(sample_files)

    for filename in sample_files:
        file_path = DATASET_RAW_DIR / filename
        if not file_path.exists():
            print(f"[SKIP] File {filename} does not exist in dataset raw directory.")
            continue

        print(f"\nProcessing Dataset File: {filename}")
        with open(file_path, "rb") as f:
            file_bytes = f.read()

        res = await document_service.process_document(file_bytes, filename)

        print(f"  -> File Type        : {res.file_type}")
        print(f"  -> Total Pages      : {res.total_pages}")
        print(f"  -> OCR Used         : {res.ocr_used}")
        print(f"  -> Word Count       : {res.word_count}")
        print(f"  -> Char Count       : {res.char_count}")
        print(f"  -> Normalized Snippet: {res.normalized_text[:180].replace(chr(10), ' ')}...")

        assert res.success, f"Failed extraction for {filename}"
        assert res.word_count > 0 or res.total_pages > 0, "No content extracted"
        passed += 1

    print("\n" + "=" * 65)
    print(f"  DATASET EXTRACTION TEST RESULT: {passed}/{total} files extracted successfully")
    print("=" * 65)


if __name__ == "__main__":
    asyncio.run(test_dataset_files())
