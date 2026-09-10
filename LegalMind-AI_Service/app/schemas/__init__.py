from app.schemas.health import HealthResponse, ComponentHealth
from app.schemas.document import DocumentExtractionResponse, PageExtraction
from app.schemas.ocr import OCRRequest, OCRResponse, PageOCRResult
from app.schemas.preprocessing import PreprocessingRequest, PreprocessingResponse, TextChunk
from app.schemas.ner import NERRequest, NERResponse, EntityItem
from app.schemas.clause import ClauseExtractionRequest, ClauseExtractionResponse, ExtractedClause
from app.schemas.summarization import SummarizationRequest, SummarizationResponse
from app.schemas.risk import RiskAnalysisRequest, RiskAnalysisResponse, RiskItem
from app.schemas.embeddings import EmbeddingRequest, EmbeddingResponse, VectorItem
from app.schemas.rag import RAGQueryRequest, RAGQueryResponse, SearchResultChunk
from app.schemas.evidence import EvidenceFinding
from app.schemas.fact_extraction import (
    LiabilityFact,
    IndemnificationFact,
    TerminationFact,
    PaymentFact,
    ConfidentialityFact,
    IntellectualPropertyFact,
    DataProtectionFact,
    GoverningLawDisputeFact,
    NonCompeteRestrictionsFact,
    DocumentFactExtractionResult,
)
from app.schemas.evidence_risk_engine import (
    TriggeredRiskRule,
    CategoryRiskBreakdown,
    EvidenceRiskAnalysisReport,
)

__all__ = [
    "HealthResponse",
    "ComponentHealth",
    "DocumentExtractionResponse",
    "PageExtraction",
    "OCRRequest",
    "OCRResponse",
    "PageOCRResult",
    "PreprocessingRequest",
    "PreprocessingResponse",
    "TextChunk",
    "NERRequest",
    "NERResponse",
    "EntityItem",
    "ClauseExtractionRequest",
    "ClauseExtractionResponse",
    "ExtractedClause",
    "SummarizationRequest",
    "SummarizationResponse",
    "RiskAnalysisRequest",
    "RiskAnalysisResponse",
    "RiskItem",
    "EmbeddingRequest",
    "EmbeddingResponse",
    "VectorItem",
    "RAGQueryRequest",
    "RAGQueryResponse",
    "SearchResultChunk",
    "EvidenceFinding",
    "LiabilityFact",
    "IndemnificationFact",
    "TerminationFact",
    "PaymentFact",
    "ConfidentialityFact",
    "IntellectualPropertyFact",
    "DataProtectionFact",
    "GoverningLawDisputeFact",
    "NonCompeteRestrictionsFact",
    "DocumentFactExtractionResult",
    "TriggeredRiskRule",
    "CategoryRiskBreakdown",
    "EvidenceRiskAnalysisReport",
]
