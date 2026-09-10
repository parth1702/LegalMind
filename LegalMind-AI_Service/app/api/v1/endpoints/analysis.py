from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from app.schemas.analysis import PipelineAnalysisRequest, PipelineAnalysisResponse
from app.services.pipeline_service import pipeline_service

router = APIRouter()


@router.post("/process-pipeline", response_model=PipelineAnalysisResponse, summary="Execute Full Legal Document Analysis Pipeline")
async def process_document_pipeline(request: PipelineAnalysisRequest):
    """
    Executes complete 9-stage legal analysis workflow:
    Text Extraction -> Preprocessing -> NER -> Clause Extraction -> Summarization -> Risk Analysis -> Embeddings -> FAISS Indexing.
    """
    return await pipeline_service.execute_full_pipeline(request)


@router.post("/upload-and-process", response_model=PipelineAnalysisResponse, summary="Upload File & Execute Analysis Pipeline")
async def upload_and_process_document(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    doc_id: str = Form(...),
    jurisdiction: Optional[str] = Form("US"),
):
    """
    Accepts raw multipart PDF / DOCX / TXT upload bytes, extracts text/OCR, and runs full 9-stage analysis pipeline.
    """
    file_bytes = await file.read()
    from app.core.logging import get_logger
    logger = get_logger("LegalMind.AnalysisAPI")
    logger.info(f"[AI-UPLOAD] filename={file.filename}")
    logger.info(f"[AI-UPLOAD] bytes={len(file_bytes)}")
    logger.info(f"[AI-UPLOAD] document_id={doc_id}")

    request = PipelineAnalysisRequest(
        user_id=user_id,
        doc_id=doc_id,
        filename=file.filename,
        jurisdiction=jurisdiction,
    )
    return await pipeline_service.execute_full_pipeline(request, file_bytes=file_bytes)
