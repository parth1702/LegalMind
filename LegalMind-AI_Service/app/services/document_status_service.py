"""
Document Status Tracking Service.
Manages explicit document lifecycle state transitions and persistent disk manifests (doc_status.json).
"""
from __future__ import annotations

import os
import json
import re
from pathlib import Path
from typing import Dict, Tuple, Optional
from datetime import datetime

from app.core.config import settings
from app.core.logging import get_logger
from app.schemas.document_status import DocumentStatus, DocumentStatusInfo

logger = get_logger("LegalMind.DocumentStatusService")


class DocumentStatusService:
    """
    Centralized, thread-safe document status tracking service.
    Persists state transitions to `storage/vector_store/{user_id}/{doc_id}/doc_status.json`.
    """

    def __init__(self) -> None:
        self.base_storage_dir = Path(getattr(settings, "FAISS_INDEX_PATH", "storage/vector_store"))
        os.makedirs(self.base_storage_dir, exist_ok=True)
        self._memory_registry: Dict[Tuple[str, str], DocumentStatusInfo] = {}
        logger.info(f"DocumentStatusService initialized (Base path: {self.base_storage_dir}).")

    def _get_status_file_path(self, user_id: str, doc_id: str) -> Tuple[Path, Path]:
        """Returns (doc_dir, status_file_path) for given user_id and doc_id."""
        clean_user = re.sub(r'[^a-zA-Z0-9_\-]', '_', user_id or "default_user")
        clean_doc = re.sub(r'[^a-zA-Z0-9_\-]', '_', doc_id or "default_doc")

        doc_dir = self.base_storage_dir / clean_user / clean_doc
        status_file = doc_dir / "doc_status.json"
        return doc_dir, status_file

    def clear_memory(self) -> None:
        """Helper to clear in-memory cache to simulate app restart in tests."""
        self._memory_registry.clear()

    def set_status(
        self,
        user_id: str,
        doc_id: str,
        status: DocumentStatus,
        total_chunks: int = 0,
        error_message: Optional[str] = None,
    ) -> DocumentStatusInfo:
        """
        Updates in-memory registry and persists document status manifest to disk.
        """
        doc_dir, status_file = self._get_status_file_path(user_id, doc_id)
        os.makedirs(doc_dir, exist_ok=True)

        info = DocumentStatusInfo(
            doc_id=doc_id,
            user_id=user_id,
            status=status,
            total_chunks=total_chunks,
            error_message=error_message,
            updated_at=datetime.utcnow().isoformat(),
        )

        # 1. Memory update
        key = (user_id, doc_id)
        self._memory_registry[key] = info

        # 2. Disk persistence
        try:
            with open(status_file, "w", encoding="utf-8") as f:
                json.dump(info.model_dump(), f, indent=2, ensure_ascii=False)
            logger.info(f"Document '{doc_id}' (User: '{user_id}') status updated to {status.value} (Chunks: {total_chunks})")
        except Exception as exc:
            logger.error(f"Failed to persist status file to {status_file}: {exc}")

        return info

    def get_status(self, user_id: str, doc_id: str) -> DocumentStatusInfo:
        """
        Retrieve document status from in-memory registry or load from disk `doc_status.json`.
        Resilient across application restarts.
        """
        key = (user_id, doc_id)
        if key in self._memory_registry:
            return self._memory_registry[key]

        doc_dir, status_file = self._get_status_file_path(user_id, doc_id)
        if status_file.exists():
            try:
                with open(status_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                info = DocumentStatusInfo(**data)
                self._memory_registry[key] = info
                return info
            except Exception as exc:
                logger.warning(f"Failed to load status manifest from {status_file}: {exc}")

        # Default fallback if not found
        default_info = DocumentStatusInfo(
            doc_id=doc_id,
            user_id=user_id,
            status=DocumentStatus.UPLOADED,
            total_chunks=0,
        )
        return default_info

    def verify_rag_readiness(self, user_id: str, doc_id: str) -> Tuple[bool, DocumentStatusInfo]:
        """
        Strictly verifies whether a document is RAG ready:
        1. Status MUST be INDEXED.
        2. total_chunks MUST be > 0.
        3. Physical disk files (index.faiss, metadata.json, doc_status.json) MUST exist.
        """
        info = self.get_status(user_id, doc_id)

        doc_dir, status_file = self._get_status_file_path(user_id, doc_id)
        index_path = doc_dir / "index.faiss"
        metadata_path = doc_dir / "metadata.json"

        if info.status != DocumentStatus.INDEXED:
            logger.warning(f"RAG readiness rejected for doc '{doc_id}': status is {info.status.value}")
            return False, info

        if info.total_chunks <= 0:
            logger.warning(f"RAG readiness rejected for doc '{doc_id}': total_chunks is {info.total_chunks}")
            return False, info

        if not index_path.exists() or not metadata_path.exists():
            logger.warning(f"RAG readiness rejected for doc '{doc_id}': index file or metadata file missing on disk.")
            # Set status to FAILED if files missing on disk
            updated_info = self.set_status(
                user_id, doc_id, DocumentStatus.FAILED, error_message="Persisted index or metadata file missing from storage."
            )
            return False, updated_info

        try:
            import faiss
            index = faiss.read_index(str(index_path))
            if index.ntotal <= 0:
                updated_info = self.set_status(
                    user_id, doc_id, DocumentStatus.FAILED, error_message="FAISS index on disk is empty (ntotal=0)."
                )
                return False, updated_info
        except Exception as exc:
            logger.warning(f"RAG readiness rejected for doc '{doc_id}': FAISS index corrupt or load failed: {exc}")
            updated_info = self.set_status(
                user_id, doc_id, DocumentStatus.FAILED, error_message=f"FAISS index load failed: {exc}"
            )
            return False, updated_info

        return True, info


document_status_service = DocumentStatusService()
