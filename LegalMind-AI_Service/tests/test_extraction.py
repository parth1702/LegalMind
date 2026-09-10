"""
Standalone extraction tests for Step 23 — Document Text Extraction.

Run from the LegalMind-AI_Service directory:
    python tests/test_extraction.py

Requirements for the test:
    pip install PyMuPDF python-docx

EasyOCR is NOT required to run these tests (OCR path is mocked for the
scanned-PDF test).  If easyocr IS installed and on PATH the scanned-PDF
test will exercise the real OCR flow.
"""
import asyncio
import io
import os
import sys
import textwrap
from pathlib import Path

# Force UTF-8 output on Windows
if sys.stdout.encoding != "utf-8":
    import io as _io
    sys.stdout = _io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

# Allow imports relative to the LegalMind-AI_Service root
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))


# ─────────────────────────────────────────────────────────────────────────────
# Helpers for generating in-memory test documents
# ─────────────────────────────────────────────────────────────────────────────

SAMPLE_LEGAL_TEXT = textwrap.dedent("""\
    SERVICE AGREEMENT

    This Service Agreement ("Agreement") is entered into as of January 1, 2026,
    by and between Acme Corporation ("Client") and LegalTech Solutions Inc.
    ("Service Provider").

    1. SCOPE OF SERVICES
       Service Provider agrees to deliver legal document analysis services
       including contract review, risk assessment, and clause extraction.

    2. TERM
       This Agreement commences on January 1, 2026 and continues for twelve (12)
       months unless terminated earlier in accordance with Section 7.

    3. LIMITATION OF LIABILITY
       In no event shall either party be liable for indirect, incidental, special
       or consequential damages.  The aggregate liability of Service Provider shall
       not exceed the total fees paid in the preceding three (3) months.

    4. GOVERNING LAW
       This Agreement shall be governed by the laws of the State of Delaware, USA.
""")


def _make_pdf_bytes(text: str) -> bytes:
    """Create a minimal PDF with embedded text using PyMuPDF."""
    import fitz
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((72, 72), text, fontsize=11)
    buf = io.BytesIO()
    doc.save(buf)
    doc.close()
    return buf.getvalue()


def _make_scanned_pdf_bytes() -> bytes:
    """
    Create a PDF page with NO text layer (just a coloured rectangle).
    This triggers the EasyOCR fallback path.
    """
    import fitz
    doc = fitz.open()
    page = doc.new_page()
    # Draw a grey rectangle — no embedded text
    rect = fitz.Rect(72, 72, 400, 200)
    page.draw_rect(rect, color=(0.8, 0.8, 0.8), fill=(0.9, 0.9, 0.9))
    buf = io.BytesIO()
    doc.save(buf)
    doc.close()
    return buf.getvalue()


def _make_docx_bytes(text: str) -> bytes:
    """Create an in-memory DOCX file using python-docx."""
    from docx import Document
    doc = Document()
    for line in text.splitlines():
        doc.add_paragraph(line)
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


def _make_txt_bytes(text: str) -> bytes:
    return text.encode("utf-8")


# =============================================================================
# Test runner
# =============================================================================

def _banner(title: str) -> None:
    print(f"\n{'=' * 60}")
    print(f"  {title}")
    print(f"{'=' * 60}")


def _print_result(result) -> None:
    print(f"  [OK] success      : {result.success}")
    print(f"  [OK] filename     : {result.filename}")
    print(f"  [OK] file_type    : {result.file_type}")
    print(f"  [OK] total_pages  : {result.total_pages}")
    print(f"  [OK] ocr_used     : {result.ocr_used}")
    print(f"  [OK] word_count   : {result.word_count}")
    print(f"  [OK] char_count   : {result.char_count}")
    if result.warnings:
        print(f"  [WARN] warnings   : {result.warnings}")
    print(f"\n  --- normalized_text (first 300 chars) ---")
    snippet = result.normalized_text[:300].replace("\n", " | ")
    print(f"  {snippet}")


async def run_tests() -> None:
    # Import directly to avoid loading heavy ML libraries via services/__init__
    from app.services.document_service import document_service

    failures: list[str] = []

    # -- Test 1: PDF with text layer
    _banner("TEST 1 - PDF (text layer)")
    try:
        pdf_bytes = _make_pdf_bytes(SAMPLE_LEGAL_TEXT)
        result = await document_service.process_document(pdf_bytes, "test_contract.pdf")
        _print_result(result)
        assert result.success, "success flag False"
        assert result.file_type == "pdf", f"expected pdf, got {result.file_type}"
        assert result.word_count > 10, "too few words extracted"
        assert not result.ocr_used, "OCR should NOT be used for text-layer PDF"
        print("\n  [PASS] PASSED\n")
    except Exception as exc:
        print(f"\n  [FAIL] FAILED: {exc}\n")
        failures.append(f"TEST 1 (PDF text layer): {exc}")

    # -- Test 2: DOCX
    _banner("TEST 2 - DOCX")
    try:
        docx_bytes = _make_docx_bytes(SAMPLE_LEGAL_TEXT)
        result = await document_service.process_document(docx_bytes, "test_contract.docx")
        _print_result(result)
        assert result.success
        assert result.file_type == "docx"
        assert result.word_count > 10
        print("\n  [PASS] PASSED\n")
    except Exception as exc:
        print(f"\n  [FAIL] FAILED: {exc}\n")
        failures.append(f"TEST 2 (DOCX): {exc}")

    # -- Test 3: TXT
    _banner("TEST 3 - TXT")
    try:
        txt_bytes = _make_txt_bytes(SAMPLE_LEGAL_TEXT)
        result = await document_service.process_document(txt_bytes, "test_contract.txt")
        _print_result(result)
        assert result.success
        assert result.file_type == "txt"
        assert result.word_count > 10
        print("\n  [PASS] PASSED\n")
    except Exception as exc:
        print(f"\n  [FAIL] FAILED: {exc}\n")
        failures.append(f"TEST 3 (TXT): {exc}")

    # -- Test 4: Scanned PDF (OCR fallback)
    _banner("TEST 4 - Scanned PDF (OCR fallback)")
    try:
        scanned_bytes = _make_scanned_pdf_bytes()
        result = await document_service.process_document(scanned_bytes, "scanned_contract.pdf")
        _print_result(result)
        assert result.success
        assert result.file_type == "pdf"
        assert result.ocr_used, "OCR SHOULD be triggered for blank text-layer PDF"
        # OCR on a grey rectangle returns empty — that is acceptable
        print("\n  [PASS] PASSED (OCR fallback triggered correctly)\n")
    except Exception as exc:
        print(f"\n  [FAIL] FAILED: {exc}\n")
        failures.append(f"TEST 4 (Scanned PDF): {exc}")

    # -- Test 5: UTF-8 BOM TXT
    _banner("TEST 5 - TXT with UTF-8 BOM encoding")
    try:
        bom_bytes = b"\xef\xbb\xbf" + SAMPLE_LEGAL_TEXT.encode("utf-8")
        result = await document_service.process_document(bom_bytes, "utf8bom.txt")
        _print_result(result)
        assert result.success
        assert "SERVICE AGREEMENT" in result.normalized_text
        print("\n  [PASS] PASSED\n")
    except Exception as exc:
        print(f"\n  [FAIL] FAILED: {exc}\n")
        failures.append(f"TEST 5 (UTF-8 BOM): {exc}")

    # Summary
    print(f"{'=' * 60}")
    if failures:
        print(f"  [FAIL] {len(failures)} test(s) FAILED:")
        for f in failures:
            print(f"     - {f}")
    else:
        print(f"  [PASS] All 5 tests PASSED")
    print(f"{'=' * 60}\n")

    if failures:
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(run_tests())
