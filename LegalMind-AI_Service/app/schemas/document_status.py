from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class DocumentStatus(str, Enum):
    """
    Explicit document indexing state machine lifecycle statuses:
    UPLOADED   -> Document uploaded/received.
    PROCESSING -> Text extraction / OCR / preprocessing running.
    PROCESSED  -> Text extracted and preprocessed successfully.
    INDEXING   -> Vector embedding generation & FAISS index creation in progress.
    INDEXED    -> Vector index persisted, metadata stored, total_chunks > 0. RAG Enabled.
    FAILED     -> Extraction, embedding, FAISS creation, or persistence failed (or 0 chunks). RAG Disabled.
    """
    UPLOADED = "UPLOADED"
    PROCESSING = "PROCESSING"
    PROCESSED = "PROCESSED"
    INDEXING = "INDEXING"
    INDEXED = "INDEXED"
    FAILED = "FAILED"


class DocumentStatusInfo(BaseModel):
    """Document status tracking record."""
    doc_id: str = Field(..., description="Unique document ID")
    user_id: str = Field(..., description="Owner user ID for multi-tenant isolation")
    status: DocumentStatus = Field(DocumentStatus.UPLOADED, description="Current document processing status")
    total_chunks: int = Field(0, description="Number of indexed chunks (must be >0 for INDEXED)")
    error_message: Optional[str] = Field(None, description="Detailed error message if status is FAILED")
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat(), description="ISO timestamp of status update")
