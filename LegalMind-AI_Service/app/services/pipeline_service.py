"""
Production LegalMind Document Analysis Pipeline Service.
Orchestrates 9 pipeline stages:
1. Upload & Text Extraction
2. OCR when required
3. Preprocessing
4. Entity extraction
5. Clause extraction
6. Summarization
7. Risk analysis
8. Embeddings
9. FAISS indexing & metadata persistence

Includes status tracking, execution metrics, and sanitized error boundaries.
"""
from __future__ import annotations

import time
from app.core.logging import get_logger
from app.schemas.document import DocumentExtractionResponse
from app.schemas.analysis import (
    PipelineAnalysisRequest,
    PipelineAnalysisResponse,
    PipelineStageMetrics,
    LEGAL_ANALYSIS_DISCLAIMER,
)
from app.schemas.preprocessing import PreprocessingRequest
from app.schemas.ner import NERRequest
from app.schemas.clause import ClauseExtractionRequest
from app.schemas.summarization import SummarizationRequest
from app.schemas.risk import RiskAnalysisRequest
from app.schemas.embeddings import DocumentIndexRequest

from app.schemas.document_status import DocumentStatus
from app.services.document_status_service import document_status_service
from app.services.document_service import document_service
from app.services.preprocessing_service import preprocessing_service
from app.services.ner_service import ner_service
from app.services.clause_service import clause_service
from app.services.summarization_service import summarization_service
from app.services.risk_service import risk_service
from app.services.vector_db_service import vector_db_service

logger = get_logger("LegalMind.PipelineService")


class PipelineService:
    """
    Unified Production Legal Document Analysis Pipeline Service.
    Integrates all AI extraction modules into a cohesive end-to-end workflow.
    """

    def __init__(self) -> None:
        logger.info("Pipeline Orchestration Service initialized.")

    async def execute_full_pipeline(
        self,
        request: PipelineAnalysisRequest,
        file_bytes: Optional[bytes] = None,
    ) -> PipelineAnalysisResponse:
        t_start = time.time()
        metrics = PipelineStageMetrics()

        user_id = request.user_id
        doc_id = request.doc_id
        filename = request.filename or "document.pdf"
        raw_text = (request.raw_text or "").strip()

        logger.info(f"Starting complete document analysis pipeline for doc '{doc_id}' (User: {user_id})")
        document_status_service.set_status(user_id, doc_id, DocumentStatus.UPLOADED)

        try:
            # Stage 1: Document Text Extraction & OCR
            document_status_service.set_status(user_id, doc_id, DocumentStatus.PROCESSING)
            t0 = time.time()
            if file_bytes and len(file_bytes) > 0:
                extraction_res = await document_service.process_document(file_bytes, filename)
                raw_text = extraction_res.normalized_text or extraction_res.raw_text
            elif raw_text:
                # Direct raw_text input fallback
                extraction_res = DocumentExtractionResponse(
                    success=True,
                    filename=filename,
                    file_type="pdf" if filename.endswith(".pdf") else "txt",
                    total_pages=1,
                    ocr_used=False,
                    raw_text=raw_text,
                    normalized_text=raw_text,
                    word_count=len(raw_text.split()),
                    char_count=len(raw_text),
                )
            else:
                extraction_res = None
            metrics.extraction_ms = round((time.time() - t0) * 1000, 2)

            if not raw_text:
                document_status_service.set_status(
                    user_id, doc_id, DocumentStatus.FAILED, error_message="Could not extract readable text content from document."
                )
                return PipelineAnalysisResponse(
                    success=False,
                    status="failed",
                    doc_id=doc_id,
                    user_id=user_id,
                    filename=filename,
                    error_message="Could not extract readable text content from the uploaded document.",
                )

            # Stage 2 & 3: Preprocessing (Sentence segmentation, paragraph stats, OCR line normalization)
            t0 = time.time()
            prep_res = await preprocessing_service.preprocess(
                PreprocessingRequest(
                    raw_text=raw_text,
                    clean_whitespace=True,
                    normalize_ocr=True,
                    chunk_size=request.chunk_size or 500,
                )
            )
            metrics.preprocessing_ms = round((time.time() - t0) * 1000, 2)

            # Stage 4: Entity Extraction (NER: Parties, Legal Refs, Money, Dates, Locations)
            t0 = time.time()
            ner_res = await ner_service.extract_entities(
                NERRequest(text=raw_text)
            )
            metrics.ner_ms = round((time.time() - t0) * 1000, 2)

            # Stage 5: Clause Extraction & Classification
            t0 = time.time()
            clause_res = await clause_service.extract_clauses(
                ClauseExtractionRequest(text=raw_text)
            )
            metrics.clause_extraction_ms = round((time.time() - t0) * 1000, 2)

            # Stage 6: Safe Long-Document Summarization (Map-Reduce)
            t0 = time.time()
            summary_res = await summarization_service.summarize(
                SummarizationRequest(text=raw_text, use_huggingface=False)
            )
            metrics.summarization_ms = round((time.time() - t0) * 1000, 2)

            # Stage 7: Transparent 9-Factor Risk Analysis
            t0 = time.time()
            risk_res = await risk_service.analyze_risk(
                RiskAnalysisRequest(text=raw_text, jurisdiction=request.jurisdiction or "US")
            )
            metrics.risk_analysis_ms = round((time.time() - t0) * 1000, 2)

            document_status_service.set_status(user_id, doc_id, DocumentStatus.PROCESSED)

            snippet = raw_text[:150].replace('\n', ' ') if raw_text else ""
            logger.info(f"Extracted text snippet for doc '{doc_id}' ({len(raw_text)} chars): '{snippet}...'")

            # Stage 8 & 9: Sentence Transformers Embeddings + FAISS Vector Indexing & Separate Metadata Storage
            t0 = time.time()
            faiss_res = await vector_db_service.index_document(
                DocumentIndexRequest(
                    doc_id=doc_id,
                    user_id=user_id,
                    filename=filename,
                    raw_text=raw_text,
                    chunk_size=request.chunk_size or 500,
                )
            )
            metrics.faiss_indexing_ms = round((time.time() - t0) * 1000, 2)

            metrics.total_pipeline_ms = round((time.time() - t_start) * 1000, 2)

            if not faiss_res.success or faiss_res.total_chunks == 0 or faiss_res.status == DocumentStatus.FAILED:
                return PipelineAnalysisResponse(
                    success=False,
                    status="failed",
                    doc_id=doc_id,
                    user_id=user_id,
                    filename=filename,
                    error_message=faiss_res.error_message or "FAISS indexing failed or zero chunks were indexed.",
                    metrics=metrics,
                    disclaimer=LEGAL_ANALYSIS_DISCLAIMER,
                )

            logger.info(
                f"Complete analysis pipeline finished successfully in {metrics.total_pipeline_ms}ms "
                f"(Risk Score: {risk_res.overall_risk_score}, Clauses: {len(clause_res.clauses)}, "
                f"Entities: {len(ner_res.entities)}, FAISS Chunks: {faiss_res.total_chunks})"
            )

            return PipelineAnalysisResponse(
                success=True,
                status="completed",
                doc_id=doc_id,
                user_id=user_id,
                filename=filename,
                extraction=extraction_res,
                preprocessing=prep_res,
                ner=ner_res,
                clauses=clause_res,
                summarization=summary_res,
                risk_analysis=risk_res,
                faiss_indexing=faiss_res,
                overall_risk_score=risk_res.overall_risk_score,
                overall_risk_category=risk_res.overall_risk_category,
                total_clauses_extracted=len(clause_res.clauses),
                total_entities_extracted=len(ner_res.entities),
                total_chunks_indexed=faiss_res.total_chunks,
                metrics=metrics,
                disclaimer=LEGAL_ANALYSIS_DISCLAIMER,
            )

        except Exception as exc:
            logger.error(f"Pipeline execution failed for doc '{doc_id}': {exc}", exc_info=True)
            document_status_service.set_status(user_id, doc_id, DocumentStatus.FAILED, error_message=str(exc))
            
            # Sanitized error response - no internal stack trace exposure
            sanitized_error = "An error occurred during legal document extraction and risk analysis processing."
            if "extract" in str(exc).lower():
                sanitized_error = "Document text extraction failed. Please verify that the file is not corrupted or password-protected."
            elif "memory" in str(exc).lower() or "cuda" in str(exc).lower():
                sanitized_error = "The document exceeded processing memory limits. Please try uploading a smaller file segment."

            return PipelineAnalysisResponse(
                success=False,
                status="failed",
                doc_id=doc_id,
                user_id=user_id,
                filename=filename,
                error_message=sanitized_error,
                metrics=metrics,
                disclaimer=LEGAL_ANALYSIS_DISCLAIMER,
            )


pipeline_service = PipelineService()
