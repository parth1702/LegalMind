"""
OCR Endpoint — delegates to document_service for full pipeline support.
POST /api/v1/ocr/extract
"""
from fastapi import APIRouter, UploadFile, File
from app.schemas.ocr import OCRResponse
from app.schemas.document import DocumentExtractionResponse
from app.services.document_service import document_service
from app.core.logging import get_logger

logger = get_logger("LegalMind.Endpoint.OCR")

router = APIRouter()


@router.post(
    "/extract",
    response_model=DocumentExtractionResponse,
    summary="OCR / Text Extraction",
    description=(
        "Upload any document (PDF, DOCX, TXT, or image). "
        "Extracts text using the full document pipeline including EasyOCR fallback "
        "for scanned pages. Identical to /document/extract."
    ),
)
async def extract_ocr(
    file: UploadFile = File(...),
):
    filename = file.filename or "uploaded_document"
    file_bytes = await file.read()
    logger.info(f"OCR endpoint request: '{filename}' ({len(file_bytes):,} bytes)")
    return await document_service.process_document(file_bytes, filename)
