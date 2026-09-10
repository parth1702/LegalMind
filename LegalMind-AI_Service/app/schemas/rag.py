from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

LEGAL_RAG_DISCLAIMER = (
    "This AI-generated RAG answer is synthesized strictly from retrieved document context passages for informational purposes "
    "and does not constitute formal legal advice."
)


class RAGSourceReference(BaseModel):
    source_id: str = Field(..., description="Unique source citation identifier (e.g. [Source 1])")
    doc_id: str = Field(..., description="Document ID of source passage")
    user_id: str = Field(..., description="User ID owning document")
    page: int = Field(1, description="Page number where evidence was retrieved")
    chunk_id: int = Field(..., description="Chunk ID where evidence was retrieved")
    score: float = Field(..., description="FAISS cosine similarity relevance score")
    text_snippet: str = Field(..., description="Exact text excerpt supporting the answer")

    @property
    def document_id(self) -> str:
        return self.doc_id

    @property
    def similarity_score(self) -> float:
        return self.score

    @property
    def text(self) -> str:
        return self.text_snippet


class SearchResultChunk(BaseModel):
    chunk_id: str
    score: float
    text: str
    metadata: Dict[str, Any] = Field(default_factory=dict)

    @property
    def doc_id(self) -> str:
        return str(self.metadata.get("doc_id", ""))

    @property
    def document_id(self) -> str:
        return self.doc_id

    @property
    def page(self) -> int:
        return int(self.metadata.get("page", 1))

    @property
    def text_snippet(self) -> str:
        return self.text

    @property
    def similarity_score(self) -> float:
        return self.score



class RAGQueryRequest(BaseModel):
    query: str = Field(..., description="User query or question regarding the legal document")
    user_id: str = Field(..., description="User ID owning document for strict multi-tenant isolation")
    document_id: Optional[str] = Field(None, description="Scope query to specific document ID")
    top_k: int = Field(4, ge=1, le=10, description="Number of top context passages to retrieve")
    min_score: float = Field(0.20, ge=0.0, le=1.0, description="Minimum relevance threshold score")


class RAGQueryResponse(BaseModel):
    success: bool = True
    query: str = Field(..., description="Original user query")
    answer: str = Field(..., description="Grounded RAG answer synthesized strictly from retrieved context")
    evidence_found: bool = Field(True, description="True if relevant document context evidence was retrieved")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Overall answer confidence score")
    sources: List[RAGSourceReference] = Field(default_factory=list, description="Array of explicit source references supporting the answer")
    retrieved_chunks: List[SearchResultChunk] = Field(default_factory=list, description="Raw retrieved passages from FAISS index")
    disclaimer: str = Field(default=LEGAL_RAG_DISCLAIMER, description="Non-authoritative legal disclaimer")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Pipeline execution metadata")

