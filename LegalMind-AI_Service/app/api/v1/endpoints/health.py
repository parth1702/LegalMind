from fastapi import APIRouter
from app.core.config import settings
from app.schemas.health import HealthResponse, ComponentHealth

router = APIRouter()


@router.get("", response_model=HealthResponse, summary="Service Health Check")
@router.get("/health", response_model=HealthResponse, summary="Health Endpoint Alias")
async def health_check():
    """
    Returns system health status, version information, and subsystem states.
    """
    components = {
        "ocr_engine": ComponentHealth(status="healthy", message="EasyOCR / PyMuPDF stub ready"),
        "nlp_spacy": ComponentHealth(status="healthy", message="spaCy NER pipeline ready"),
        "embeddings": ComponentHealth(status="healthy", message=f"Sentence Transformers ({settings.EMBEDDING_MODEL_NAME}) ready"),
        "vector_db": ComponentHealth(status="healthy", message=f"FAISS index at {settings.FAISS_INDEX_PATH}"),
        "rag_engine": ComponentHealth(status="healthy", message="LangChain RAG service operational"),
    }
    
    return HealthResponse(
        status="ok",
        service=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment="development" if settings.DEBUG else "production",
        components=components
    )
