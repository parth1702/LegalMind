"""
OCR Service — EasyOCR engine with lazy model loading.
Handles image files and PDF page rendering for scanned document support.
"""
from __future__ import annotations

import io
from typing import Optional, List, Any
from app.core.logging import get_logger
from app.schemas.ocr import OCRResponse, PageOCRResult

logger = get_logger("LegalMind.OCRService")


class OCRService:
    """
    EasyOCR-powered text extraction for image files and scanned page images.

    The EasyOCR ``Reader`` object is heavy (downloads ~200 MB weights on first run),
    so it is initialised lazily on first use rather than at import time.
    """

    def __init__(self) -> None:
        self._reader: Optional[Any] = None  # easyocr.Reader – loaded lazily
        logger.info("OCR Service initialised (model not yet loaded - lazy init).")

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _get_reader(self) -> Any:
        """Return (or lazily initialise) the EasyOCR reader."""
        if self._reader is None:
            logger.info("Loading EasyOCR model (first use – may take a moment)...")
            try:
                import easyocr  # type: ignore[import-untyped]  # noqa: PLC0415
                self._reader = easyocr.Reader(["en"], gpu=False, verbose=False)
                logger.info("EasyOCR model loaded successfully.")
            except ImportError:
                raise RuntimeError(
                    "easyocr is not installed. Run: pip install easyocr"
                )
        return self._reader

    def _ocr_image_bytes(self, image_bytes: bytes) -> tuple[str, float]:
        """
        Run EasyOCR on raw image bytes.

        Returns
        -------
        text : str
            Concatenated text from all detected regions.
        avg_confidence : float
            Mean detection confidence across all regions (0–1).
        """
        reader = self._get_reader()
        results = reader.readtext(image_bytes, detail=1, paragraph=False)

        texts: list[str] = []
        confidences: list[float] = []
        for (_bbox, text, conf) in results:
            clean = text.strip()
            if clean:
                texts.append(clean)
                confidences.append(float(conf))

        joined = " ".join(texts)
        avg_conf = (sum(confidences) / len(confidences)) if confidences else 0.0
        return joined, avg_conf

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def ocr_image_file(
        self, file_bytes: bytes, filename: str = "image"
    ) -> OCRResponse:
        """
        Extract text from an image file (JPEG, PNG, TIFF, BMP, etc.).
        """
        logger.info(f"OCR: processing image '{filename}' ({len(file_bytes):,} bytes)")

        try:
            text, confidence = self._ocr_image_bytes(file_bytes)
        except Exception as exc:
            logger.error(f"OCR failed for '{filename}': {exc}")
            return OCRResponse(
                success=False,
                filename=filename,
                file_type="image",
                warnings=[f"OCR error: {str(exc)}"],
            )

        page = PageOCRResult(page_number=1, text=text, confidence=round(confidence, 4))
        return OCRResponse(
            success=True,
            filename=filename,
            file_type="image",
            total_pages=1,
            ocr_used=True,
            extracted_text=text,
            word_count=len(text.split()),
            pages=[page],
        )

    async def ocr_pdf_page(
        self, page_image_bytes: bytes, page_number: int
    ) -> PageOCRResult:
        """
        Run EasyOCR on a single rendered PDF page (as PNG bytes).
        Used as a fallback when PyMuPDF finds no text layer on a page.
        """
        logger.debug(f"OCR fallback on PDF page {page_number}")
        try:
            text, confidence = self._ocr_image_bytes(page_image_bytes)
        except Exception as exc:
            logger.warning(f"OCR page {page_number} failed: {exc}")
            text, confidence = "", 0.0

        return PageOCRResult(
            page_number=page_number,
            text=text,
            confidence=round(confidence, 4),
        )


# Module-level singleton
ocr_service = OCRService()
