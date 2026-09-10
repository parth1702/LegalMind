from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from app.schemas.document import DocumentExtractionResponse
from app.schemas.preprocessing import PreprocessingResponse
from app.schemas.ner import NERResponse
from app.schemas.clause import ClauseExtractionResponse
from app.schemas.summarization import SummarizationResponse
from app.schemas.risk import RiskAnalysisResponse
from app.schemas.embeddings import DocumentIndexResponse

LEGAL_ANALYSIS_DISCLAIMER = (
    "This legal document analysis is produced by AI-assisted automated machine learning systems. "
    "It is provided for preliminary review and informational purposes only and does not constitute formal legal advice."
)


class PipelineAnalysisRequest(BaseModel):
    user_id: str = Field(..., description="User ID owning document for strict multi-tenant isolation")
    doc_id: str = Field(..., description="Unique document ID")
    raw_text: Optional[str] = Field(None, description="Raw text string if already extracted")
    filename: Optional[str] = Field("document.pdf", description="Original file name")
    jurisdiction: Optional[str] = Field("US", description="Legal jurisdiction governing context")
    chunk_size: Optional[int] = Field(500, description="Word limit per chunk")


class PipelineStageMetrics(BaseModel):
    extraction_ms: float = 0.0
    preprocessing_ms: float = 0.0
    ner_ms: float = 0.0
    clause_extraction_ms: float = 0.0
    summarization_ms: float = 0.0
    risk_analysis_ms: float = 0.0
    faiss_indexing_ms: float = 0.0
    total_pipeline_ms: float = 0.0


class PipelineAnalysisResponse(BaseModel):
    success: bool = True
    status: str = Field("completed", description="Status: pending | processing | completed | failed")
    doc_id: str = Field(..., description="Analyzed document ID")
    user_id: str = Field(..., description="Document owner user ID")
    filename: str = Field("document.pdf", description="File name")
    
    # 9 Pipeline Extraction Results
    extraction: Optional[DocumentExtractionResponse] = None
    preprocessing: Optional[PreprocessingResponse] = None
    ner: Optional[NERResponse] = None
    clauses: Optional[ClauseExtractionResponse] = None
    summarization: Optional[SummarizationResponse] = None
    risk_analysis: Optional[RiskAnalysisResponse] = None
    faiss_indexing: Optional[DocumentIndexResponse] = None

    # Consolidated High-Level Executive Metrics
    overall_risk_score: float = 0.0
    overall_risk_category: str = "Low"
    total_clauses_extracted: int = 0
    total_entities_extracted: int = 0
    total_chunks_indexed: int = 0
    
    metrics: PipelineStageMetrics = Field(default_factory=PipelineStageMetrics)
    disclaimer: str = Field(default=LEGAL_ANALYSIS_DISCLAIMER)
    error_message: Optional[str] = None
