from app.services.document_service import document_service, DocumentService
from app.services.ocr_service import ocr_service, OCRService

from app.services.preprocessing_service import preprocessing_service, PreprocessingService
from app.services.ner_service import ner_service, NERService
from app.services.clause_service import clause_service, ClauseService
from app.services.summarization_service import summarization_service, SummarizationService
from app.services.risk_service import risk_service, RiskService
from app.services.embedding_service import embedding_service, EmbeddingService
from app.services.vector_db_service import vector_db_service, VectorDBService
from app.services.rag_service import rag_service, RAGService

__all__ = [
    "document_service", "DocumentService",
    "ocr_service", "OCRService",
    "preprocessing_service", "PreprocessingService",
    "ner_service", "NERService",
    "clause_service", "ClauseService",
    "summarization_service", "SummarizationService",
    "risk_service", "RiskService",
    "embedding_service", "EmbeddingService",
    "vector_db_service", "VectorDBService",
    "rag_service", "RAGService",
]
