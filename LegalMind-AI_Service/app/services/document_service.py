"""
Document Service — unified extraction pipeline.

Supported types:
  • PDF  – PyMuPDF text layer; EasyOCR fallback for scanned pages
  • DOCX – python-docx paragraph + table walker
  • TXT  – direct UTF-8 / latin-1 decode
  • Image (PNG / JPEG / TIFF / BMP / WEBP) – EasyOCR full page

Entry point for the API layer:
    document_service.process_document(file_bytes, filename)  →  DocumentExtractionResponse
"""
from __future__ import annotations

import io
import re
from pathlib import Path
from typing import List, Tuple

from app.core.logging import get_logger
from app.core.errors import OCRProcessingError
from app.schemas.document import DocumentExtractionResponse, PageExtraction
from app.services.ocr_service import ocr_service

logger = get_logger("LegalMind.DocumentService")

# ── MIME / magic-byte signatures ─────────────────────────────────────────────
_MAGIC: dict[bytes, str] = {
    b"%PDF": "pdf",
    b"PK\x03\x04": "docx",       # ZIP-based Office formats (DOCX, XLSX …)
    b"\xff\xd8\xff": "image",     # JPEG
    b"\x89PNG": "image",          # PNG
    b"II*\x00": "image",          # TIFF (little-endian)
    b"MM\x00*": "image",          # TIFF (big-endian)
    b"BM": "image",               # BMP
    b"RIFF": "image",             # WEBP (starts with RIFF)
}

_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".tiff", ".tif", ".bmp", ".webp"}
_TEXT_EXTENSIONS   = {".txt", ".text", ".log"}
_DOCX_EXTENSIONS  = {".docx", ".doc"}
_PDF_EXTENSIONS   = {".pdf"}

# Minimum chars on a PDF page to consider it "text-layer present"
_PDF_TEXT_MIN_CHARS = 20


# ═════════════════════════════════════════════════════════════════════════════
# Helpers
# ═════════════════════════════════════════════════════════════════════════════

def _detect_file_type(file_bytes: bytes, filename: str) -> str:
    """
    Determine file type by inspecting magic bytes first, then file extension.

    Returns one of: ``pdf`` | ``docx`` | ``txt`` | ``image``.
    """
    header = file_bytes[:8]
    for magic, ftype in _MAGIC.items():
        if header.startswith(magic):
            # DOCX is ZIP – verify the extension to avoid misidentifying XLSX etc.
            if ftype == "docx":
                ext = Path(filename).suffix.lower()
                if ext not in _DOCX_EXTENSIONS:
                    # Could be another ZIP-based format; treat as unknown
                    logger.warning(
                        f"ZIP magic found but extension '{ext}' not .docx – defaulting to 'docx'."
                    )
            return ftype

    # Fall back to extension
    ext = Path(filename).suffix.lower()
    if ext in _PDF_EXTENSIONS:
        return "pdf"
    if ext in _DOCX_EXTENSIONS:
        return "docx"
    if ext in _TEXT_EXTENSIONS:
        return "txt"
    if ext in _IMAGE_EXTENSIONS:
        return "image"

    logger.warning(f"Cannot determine type for '{filename}'; defaulting to 'txt'.")
    return "txt"


def _normalize_text(text: str) -> str:
    """
    Shared text normaliser applied to all extraction paths.

    Operations:
    - Normalise line endings
    - Collapse horizontal whitespace
    - Remove soft-hyphen / zero-width characters
    - Trim repeated blank lines
    - Strip leading / trailing whitespace
    """
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # Remove zero-width / soft-hyphen / non-breaking chars
    text = re.sub(r"[\u00ad\u200b\u200c\u200d\ufeff]", "", text)
    # Replace non-breaking space
    text = text.replace("\u00a0", " ")
    # Collapse multiple spaces/tabs on a line
    text = re.sub(r"[ \t]+", " ", text)
    # Collapse 3+ consecutive blank lines into 2
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


# ═════════════════════════════════════════════════════════════════════════════
# Extraction methods
# ═════════════════════════════════════════════════════════════════════════════

async def _extract_pdf(file_bytes: bytes, filename: str) -> Tuple[List[PageExtraction], List[str]]:
    """
    Extract text from a PDF using PyMuPDF.

    For each page:
    1. Attempt native text extraction.
    2. If fewer than ``_PDF_TEXT_MIN_CHARS`` characters are found,
       render the page to PNG and run EasyOCR.

    Returns (pages, warnings).
    """
    import fitz  # PyMuPDF

    pages: list[PageExtraction] = []
    warnings: list[str] = []
    doc = fitz.open(stream=file_bytes, filetype="pdf")

    logger.info(f"PDF '{filename}': {doc.page_count} page(s) detected.")

    for page_index in range(doc.page_count):
        page = doc[page_index]
        page_number = page_index + 1
        ocr_used = False

        # Native text layer
        raw_text = page.get_text("text")

        if len(raw_text.strip()) < _PDF_TEXT_MIN_CHARS:
            logger.info(
                f"  Page {page_number}: insufficient text ({len(raw_text.strip())} chars) - "
                "falling back to EasyOCR."
            )
            # Render page to PNG bytes at 2x resolution for better OCR accuracy
            mat = fitz.Matrix(2.0, 2.0)
            pix = page.get_pixmap(matrix=mat)
            png_bytes = pix.tobytes("png")

            ocr_result = await ocr_service.ocr_pdf_page(png_bytes, page_number)

            raw_text = ocr_result.text
            ocr_used = True
            if not raw_text.strip():
                warnings.append(f"Page {page_number}: OCR returned empty text.")

        pages.append(
            PageExtraction(
                page_number=page_number,
                text=raw_text,
                ocr_used=ocr_used,
                char_count=len(raw_text),
            )
        )

    doc.close()
    return pages, warnings


def _extract_docx(file_bytes: bytes) -> Tuple[List[PageExtraction], List[str]]:
    """
    Extract text from a DOCX file using python-docx.

    DOCX has no native page concept; we treat the whole document as one
    logical 'page' but walk paragraphs and table cells for completeness.
    """
    from docx import Document  # python-docx

    warnings: list[str] = []
    lines: list[str] = []

    doc = Document(io.BytesIO(file_bytes))

    for para in doc.paragraphs:
        stripped = para.text.strip()
        if stripped:
            lines.append(stripped)

    # Walk tables
    for table in doc.tables:
        for row in table.rows:
            cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
            if cells:
                lines.append("  |  ".join(cells))

    full_text = "\n".join(lines)
    if not full_text.strip():
        warnings.append("DOCX: no readable text found in paragraphs or tables.")

    pages = [
        PageExtraction(
            page_number=1,
            text=full_text,
            ocr_used=False,
            char_count=len(full_text),
        )
    ]
    return pages, warnings


def _extract_txt(file_bytes: bytes) -> Tuple[List[PageExtraction], List[str]]:
    """
    Decode a plain-text file.
    Tries UTF-8, then UTF-8-with-BOM, then latin-1 as fallback.
    """
    warnings: list[str] = []
    for encoding in ("utf-8-sig", "utf-8", "latin-1"):
        try:
            text = file_bytes.decode(encoding)
            break
        except (UnicodeDecodeError, LookupError):
            continue
    else:
        text = file_bytes.decode("latin-1", errors="replace")
        warnings.append("TXT: encoding detection failed; decoded with latin-1 replacement.")

    pages = [
        PageExtraction(
            page_number=1,
            text=text,
            ocr_used=False,
            char_count=len(text),
        )
    ]
    return pages, warnings


async def _extract_image(file_bytes: bytes, filename: str) -> Tuple[List[PageExtraction], List[str]]:
    """Extract text from a standalone image file via EasyOCR."""
    warnings: list[str] = []
    result = await ocr_service.ocr_image_file(file_bytes, filename)

    if not result.success:
        warnings.extend(result.warnings)
        pages = [
            PageExtraction(page_number=1, text="", ocr_used=True, char_count=0)
        ]
    else:
        pages = [
            PageExtraction(
                page_number=1,
                text=result.extracted_text,
                ocr_used=True,
                char_count=len(result.extracted_text),
            )
        ]
    return pages, warnings


# ═════════════════════════════════════════════════════════════════════════════
# DocumentService
# ═════════════════════════════════════════════════════════════════════════════

class DocumentService:
    """
    Orchestrates document text extraction across PDF / DOCX / TXT / image types.
    """

    def __init__(self) -> None:
        logger.info("Document Service initialised.")

    async def process_document(
        self, file_bytes: bytes, filename: str
    ) -> DocumentExtractionResponse:
        """
        Main entry point.

        Detects file type → routes to the correct extractor → normalises text
        → builds and returns a ``DocumentExtractionResponse``.
        """
        logger.info(f"Processing document '{filename}' ({len(file_bytes):,} bytes)")

        file_type = _detect_file_type(file_bytes, filename)
        logger.info(f"Detected type: {file_type}")

        warnings: list[str] = []
        pages: list[PageExtraction] = []

        try:
            if file_type == "pdf":
                pages, warnings = await _extract_pdf(file_bytes, filename)


            elif file_type == "docx":
                pages, warnings = _extract_docx(file_bytes)

            elif file_type == "txt":
                pages, warnings = _extract_txt(file_bytes)

            elif file_type == "image":
                pages, warnings = await _extract_image(file_bytes, filename)

            else:
                warnings.append(f"Unsupported file type: {file_type}")
                pages = [PageExtraction(page_number=1, text="", ocr_used=False, char_count=0)]

        except Exception as exc:
            logger.exception(f"Extraction failed for '{filename}': {exc}")
            raise OCRProcessingError(
                message=f"Failed to extract text from '{filename}'",
                details={"error": str(exc), "file_type": file_type},
            )

        # Aggregate
        raw_text = "\n\n".join(p.text for p in pages if p.text.strip())
        normalized = _normalize_text(raw_text)
        any_ocr = any(p.ocr_used for p in pages)

        response = DocumentExtractionResponse(
            success=True,
            filename=filename,
            file_type=file_type,
            total_pages=len(pages),
            ocr_used=any_ocr,
            raw_text=raw_text,
            normalized_text=normalized,
            word_count=len(normalized.split()) if normalized else 0,
            char_count=len(normalized),
            pages=pages,
            warnings=warnings,
        )

        logger.info(
            f"Extraction complete: {response.total_pages} page(s), "
            f"{response.word_count} words, OCR={'yes' if any_ocr else 'no'}, "
            f"{len(warnings)} warning(s)."
        )
        return response


# Module-level singleton
document_service = DocumentService()
