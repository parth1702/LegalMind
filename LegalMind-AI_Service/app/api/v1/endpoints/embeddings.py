from fastapi import APIRouter
from app.schemas.embeddings import (
    EmbeddingRequest,
    EmbeddingResponse,
    DocumentIndexRequest,
    DocumentIndexResponse,
    VectorSearchRequest,
    VectorSearchResponse,
)
from app.services.embedding_service import embedding_service
from app.services.vector_db_service import vector_db_service

router = APIRouter()


@router.post("/generate", response_model=EmbeddingResponse, summary="Generate Text Embeddings")
async def generate_text_embeddings(request: EmbeddingRequest):
    """
    Generates high-dimensional dense vector embeddings using Sentence Transformers.
    """
    return await embedding_service.generate_embeddings(request)


@router.post("/index-document", response_model=DocumentIndexResponse, summary="Index Document into FAISS Vector Store")
async def index_legal_document(request: DocumentIndexRequest):
    """
    Executes Document Chunking -> Embeddings -> FAISS Index -> Separate Metadata storage with multi-tenant isolation.
    """
    return await vector_db_service.index_document(request)


@router.post("/search", response_model=VectorSearchResponse, summary="Search FAISS Vector Store")
async def search_vector_store(request: VectorSearchRequest):
    """
    Executes FAISS inner-product vector similarity search on isolated document index.
    """
    return await vector_db_service.search_vectors(request)

