from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.schemas.document_status import DocumentStatus


class EmbeddingRequest(BaseModel):
    texts: List[str] = Field(..., description="List of text strings to convert into vector embeddings")
    model_name: Optional[str] = Field(None, description="Optional override for Sentence Transformers model")


class VectorItem(BaseModel):
    index: int = Field(..., description="0-indexed position in list")
    dimension: int = Field(..., description="Vector dimension size (e.g. 384)")
    embedding: List[float] = Field(..., description="High-dimensional dense float vector")


class EmbeddingResponse(BaseModel):
    success: bool = True
    model_used: str = Field(..., description="Sentence Transformers model used")
    dimensions: int = Field(..., description="Vector embedding dimensions")
    embeddings: List[VectorItem] = Field(default_factory=list, description="Array of vector items")


class ChunkMetadata(BaseModel):
    vector_ref: int = Field(..., description="FAISS 0-indexed vector reference position")
    doc_id: str = Field(..., description="Unique document identifier")
    document_id: str = Field("", description="Unique document identifier alias")
    filename: str = Field("", description="Original filename of document")
    user_id: str = Field(..., description="Unique user identifier for multi-tenant isolation")
    page: int = Field(1, description="Estimated page number in document")
    chunk_id: int = Field(..., description="1-indexed chunk sequence identifier")
    text: str = Field(..., description="Exact chunk text snippet")
    start_char: int = Field(0, description="Character start offset in contract")
    end_char: int = Field(0, description="Character end offset in contract")


class DocumentIndexRequest(BaseModel):
    doc_id: str = Field(..., description="Unique document ID to index")
    user_id: str = Field(..., description="User ID owning document for strict multi-tenant isolation")
    filename: Optional[str] = Field("document.pdf", description="Original filename of document")
    raw_text: str = Field(..., description="Raw legal document text")
    chunk_size: Optional[int] = Field(500, description="Word limit per chunk")
    chunk_overlap: Optional[int] = Field(50, description="Overlap between consecutive chunks")
    pages: Optional[List[int]] = Field(None, description="Optional explicit page number mapping per chunk")


class DocumentIndexResponse(BaseModel):
    success: bool = True
    doc_id: str = Field(..., description="Indexed document ID")
    user_id: str = Field(..., description="Document owner user ID")
    total_chunks: int = Field(..., description="Total chunks indexed in FAISS")
    dimensions: int = Field(..., description="Vector embedding dimensions")
    index_saved_path: str = Field(..., description="Isolated storage directory path for index & metadata")
    status: DocumentStatus = Field(DocumentStatus.INDEXED, description="Explicit document status")
    error_message: Optional[str] = Field(None, description="Detailed error message if indexing failed")


class VectorSearchRequest(BaseModel):
    query: str = Field(..., description="Natural language search query")
    user_id: str = Field(..., description="User ID for multi-tenant isolation search")
    doc_id: Optional[str] = Field(None, description="Optional specific document ID filter")
    top_k: int = Field(4, ge=1, le=20, description="Number of top matching chunks to return")
    min_score: float = Field(0.0, ge=0.0, le=1.0, description="Minimum similarity score threshold")


class VectorSearchResult(BaseModel):
    vector_ref: int = Field(..., description="FAISS vector reference index")
    score: float = Field(..., description="Cosine similarity score (0.0 to 1.0)")
    doc_id: str = Field(..., description="Document ID of match")
    user_id: str = Field(..., description="User ID owning matched document")
    page: int = Field(..., description="Page number of chunk match")
    chunk_id: int = Field(..., description="Chunk ID of match")
    text: str = Field(..., description="Exact chunk text snippet")
    start_char: Optional[int] = Field(0, description="Start character offset in document")
    end_char: Optional[int] = Field(0, description="End character offset in document")


class VectorSearchResponse(BaseModel):
    success: bool = True
    query: str = Field(..., description="Search query string")
    total_results: int = Field(..., description="Total matching chunks found")
    results: List[VectorSearchResult] = Field(default_factory=list, description="Array of matching chunks")

