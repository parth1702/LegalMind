"""
Document Extraction Endpoint
POST /api/v1/document/extract
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.schemas.document import DocumentExtractionResponse
from app.services.document_service import document_service
from app.core.logging import get_logger

logger = get_logger("LegalMind.Endpoint.Document")

router = APIRouter()

# Allowed MIME types / extensions
_ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt", ".text", ".log",
                       ".png", ".jpg", ".jpeg", ".tiff", ".tif", ".bmp", ".webp"}


@router.post(
    "/extract",
    response_model=DocumentExtractionResponse,
    summary="Extract Text from Document",
    description=(
        "Accepts PDF, DOCX, TXT, or image uploads. "
        "Extracts text via PyMuPDF (PDF), python-docx (DOCX), UTF-8 decode (TXT), "
        "or EasyOCR (images / scanned pages). Returns a structured extraction response."
    ),
)
async def extract_document_text(
    file: UploadFile = File(..., description="Document file to extract text from"),
):
    filename = file.filename or "uploaded_document"
    from pathlib import Path
    ext = Path(filename).suffix.lower()

    if ext not in _ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type '{ext}'. Allowed: {sorted(_ALLOWED_EXTENSIONS)}",
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    logger.info(f"Document extract request: '{filename}' ({len(file_bytes):,} bytes)")
    return await document_service.process_document(file_bytes, filename)
