"""
Production FAISS Vector DB Service with Multi-Tenant User/Document Isolation.
Pipeline: Document text -> Chunking -> Embeddings -> FAISS Index (IndexFlatIP) -> Separate Metadata (JSON).

Supports:
- Document ID
- User ID (Isolation)
- Page
- Chunk ID
- Text
- Vector reference
"""
from __future__ import annotations

import os
import json
import re
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
import faiss

from app.core.config import settings
from app.core.logging import get_logger
from app.schemas.embeddings import (
    DocumentIndexRequest,
    DocumentIndexResponse,
    VectorSearchRequest,
    VectorSearchResponse,
    VectorSearchResult,
    ChunkMetadata,
)
from app.schemas.document_status import DocumentStatus
from app.services.document_status_service import document_status_service
from app.schemas.preprocessing import PreprocessingRequest
from app.services.preprocessing_service import preprocessing_service
from app.services.embedding_service import embedding_service

logger = get_logger("LegalMind.VectorDBService")


class VectorDBService:
    """
    Production FAISS Vector Store Manager providing strict per-user/per-document isolation,
    binary FAISS index persistence (`index.faiss`), and separate metadata storage (`metadata.json`).
    """

    def __init__(self) -> None:
        self.base_storage_dir = Path(getattr(settings, "FAISS_INDEX_PATH", "storage/vector_store"))
        os.makedirs(self.base_storage_dir, exist_ok=True)
        logger.info(f"VectorDB Service initialized (Base Storage: {self.base_storage_dir}).")

    def _get_isolated_paths(self, user_id: str, doc_id: str) -> Tuple[Path, Path, Path]:
        """
        Get isolated storage directory, index path, and metadata path for given user_id and doc_id.
        Enforces user/document isolation: storage/vector_store/{user_id}/{doc_id}/
        """
        clean_user = re.sub(r'[^a-zA-Z0-9_\-]', '_', user_id or "default_user")
        clean_doc = re.sub(r'[^a-zA-Z0-9_\-]', '_', doc_id or "default_doc")

        doc_dir = self.base_storage_dir / clean_user / clean_doc
        os.makedirs(doc_dir, exist_ok=True)

        index_path = doc_dir / "index.faiss"
        metadata_path = doc_dir / "metadata.json"

        return doc_dir, index_path, metadata_path

    def _save_index_and_metadata(
        self, index: faiss.Index, metadata: List[Dict[str, Any]], index_path: Path, metadata_path: Path
    ) -> None:
        """Save FAISS binary index and separate JSON metadata store to disk."""
        faiss.write_index(index, str(index_path))
        with open(metadata_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        logger.info(f"Saved FAISS index ({index.ntotal} vectors) and metadata ({len(metadata)} items) to {index_path.parent}")

    def _load_index_and_metadata(
        self, index_path: Path, metadata_path: Path
    ) -> Tuple[Optional[faiss.Index], List[Dict[str, Any]]]:
        """Load FAISS binary index and separate JSON metadata store from disk."""
        if not index_path.exists() or not metadata_path.exists():
            return None, []

        try:
            index = faiss.read_index(str(index_path))
            with open(metadata_path, "r", encoding="utf-8") as f:
                metadata = json.load(f)
            return index, metadata
        except Exception as exc:
            logger.error(f"Failed to load vector index or metadata from {index_path.parent}: {exc}")
            return None, []

    async def index_document(self, request: DocumentIndexRequest) -> DocumentIndexResponse:
        """
        Deterministic Pipeline:
        Document text -> Chunking -> Embeddings -> FAISS index -> Separate Metadata Store -> INDEXED.
        Fails deterministically if text is empty, chunking yields 0 chunks, embeddings fail, or FAISS fails.
        """
        document_status_service.set_status(request.user_id, request.doc_id, DocumentStatus.INDEXING)

        raw_text = (request.raw_text or "").strip()
        if not raw_text:
            document_status_service.set_status(
                request.user_id, request.doc_id, DocumentStatus.FAILED, error_message="Empty document text provided for indexing."
            )
            return DocumentIndexResponse(
                success=False,
                doc_id=request.doc_id,
                user_id=request.user_id,
                total_chunks=0,
                dimensions=384,
                index_saved_path="",
                status=DocumentStatus.FAILED,
                error_message="Empty document text provided for indexing.",
            )

        logger.info(f"Indexing document '{request.doc_id}' for user '{request.user_id}' (Length: {len(raw_text)} chars)")

        # 1. Chunking Document Text
        try:
            prep_res = await preprocessing_service.preprocess(
                PreprocessingRequest(
                    raw_text=raw_text,
                    clean_whitespace=True,
                    normalize_ocr=True,
                    chunk_size=request.chunk_size or 500,
                    chunk_overlap=request.chunk_overlap or 50,
                )
            )
            chunks = prep_res.chunks or []
        except Exception as exc:
            document_status_service.set_status(
                request.user_id, request.doc_id, DocumentStatus.FAILED, error_message=f"Text chunking failed: {exc}"
            )
            return DocumentIndexResponse(
                success=False,
                doc_id=request.doc_id,
                user_id=request.user_id,
                total_chunks=0,
                dimensions=384,
                index_saved_path="",
                status=DocumentStatus.FAILED,
                error_message=f"Text chunking failed: {exc}",
            )

        if not chunks:
            document_status_service.set_status(
                request.user_id, request.doc_id, DocumentStatus.FAILED, error_message="No valid chunks generated from document text."
            )
            return DocumentIndexResponse(
                success=False,
                doc_id=request.doc_id,
                user_id=request.user_id,
                total_chunks=0,
                dimensions=384,
                index_saved_path="",
                status=DocumentStatus.FAILED,
                error_message="No valid chunks generated from document text.",
            )

        chunk_texts = [c.text for c in chunks]

        # 2. Embedding Generation (Sentence Transformers 384d L2 normalized)
        try:
            matrix = embedding_service.encode_texts(chunk_texts)
            dimensions = matrix.shape[1] if matrix.ndim > 1 else 384
        except Exception as exc:
            document_status_service.set_status(
                request.user_id, request.doc_id, DocumentStatus.FAILED, error_message=f"Embedding model unavailable or embedding generation failed: {exc}"
            )
            return DocumentIndexResponse(
                success=False,
                doc_id=request.doc_id,
                user_id=request.user_id,
                total_chunks=0,
                dimensions=384,
                index_saved_path="",
                status=DocumentStatus.FAILED,
                error_message=f"Embedding model unavailable or embedding generation failed: {exc}",
            )

        # 3. FAISS Index Creation & Persistence
        try:
            index = faiss.IndexFlatIP(dimensions)
            index.add(matrix)
        except Exception as exc:
            document_status_service.set_status(
                request.user_id, request.doc_id, DocumentStatus.FAILED, error_message=f"FAISS vector database engine error: {exc}"
            )
            return DocumentIndexResponse(
                success=False,
                doc_id=request.doc_id,
                user_id=request.user_id,
                total_chunks=0,
                dimensions=dimensions,
                index_saved_path="",
                status=DocumentStatus.FAILED,
                error_message=f"FAISS vector database engine error: {exc}",
            )

        # 4. Separate Metadata Assembly (Document ID, Page, Chunk, Text, Vector Ref)
        metadata_list: List[Dict[str, Any]] = []
        request_pages = getattr(request, "pages", None)

        for idx, c in enumerate(chunks):
            # Real Page metadata preservation or fallback to estimation (~2500 chars per page)
            if getattr(c, "page", None) is not None:
                page_num = c.page
            elif request_pages and idx < len(request_pages) and request_pages[idx] is not None:
                page_num = request_pages[idx]
            else:
                page_num = (c.start_char // 2500) + 1

            chunk_meta = ChunkMetadata(
                vector_ref=idx,  # 0-indexed FAISS vector position reference
                doc_id=request.doc_id,
                document_id=request.doc_id,
                filename=request.filename or "document.pdf",
                user_id=request.user_id,
                page=page_num,
                chunk_id=c.chunk_id,
                text=c.text,
                start_char=c.start_char,
                end_char=c.end_char,
            )
            metadata_list.append(chunk_meta.model_dump())

        # 5. Save to Isolated Per-User/Per-Document Storage Path & Update Status to INDEXED
        try:
            doc_dir, index_path, metadata_path = self._get_isolated_paths(request.user_id, request.doc_id)
            self._save_index_and_metadata(index, metadata_list, index_path, metadata_path)
            document_status_service.set_status(request.user_id, request.doc_id, DocumentStatus.INDEXED, total_chunks=len(chunks))
        except Exception as exc:
            document_status_service.set_status(
                request.user_id, request.doc_id, DocumentStatus.FAILED, error_message=f"Failed to persist vector index to storage: {exc}"
            )
            return DocumentIndexResponse(
                success=False,
                doc_id=request.doc_id,
                user_id=request.user_id,
                total_chunks=0,
                dimensions=dimensions,
                index_saved_path="",
                status=DocumentStatus.FAILED,
                error_message=f"Failed to persist vector index to storage: {exc}",
            )

        return DocumentIndexResponse(
            success=True,
            doc_id=request.doc_id,
            user_id=request.user_id,
            total_chunks=len(chunks),
            dimensions=dimensions,
            index_saved_path=str(doc_dir),
            status=DocumentStatus.INDEXED,
        )

    def _deduplicate_and_sort_results(
        self, results: List[VectorSearchResult]
    ) -> List[VectorSearchResult]:
        """
        Deduplicate retrieved FAISS candidate chunks and enforce deterministic ordering.
        Rules:
        1. Remove exact duplicate chunks with same (doc_id, chunk_id, start_char, end_char).
        2. Remove exact text content duplicates (normalized case/whitespace), retaining highest similarity score.
        3. Remove heavy character overlap duplicates (>80% overlap) for same document, retaining highest score.
        4. Preserve legitimate adjacent chunks.
        5. Sort deterministically by relevance score (descending), then start_char (ascending).
        """
        if not results:
            return []

        # 1. Exact Key & Exact Text Content Deduplication
        deduped_map: Dict[Any, VectorSearchResult] = {}
        for r in results:
            chunk_key = (r.doc_id, r.chunk_id)
            text_key = (r.doc_id, r.text.strip().lower())

            existing = deduped_map.get(chunk_key) or deduped_map.get(text_key)

            if existing is None:
                deduped_map[chunk_key] = r
                deduped_map[text_key] = r
            else:
                if r.score > existing.score:
                    deduped_map[chunk_key] = r
                    deduped_map[text_key] = r

        unique_candidates = list({id(v): v for v in deduped_map.values()}.values())

        # 2. Overlapping Character Span Resolution (Rejecting >80% overlap duplicates while preserving adjacent chunks)
        candidates_by_score = sorted(unique_candidates, key=lambda x: -x.score)
        selected: List[VectorSearchResult] = []

        for cand in candidates_by_score:
            overlap_duplicate = False
            for sel in selected:
                if cand.doc_id == sel.doc_id:
                    c_start = getattr(cand, "start_char", 0)
                    c_end = getattr(cand, "end_char", 0)
                    s_start = getattr(sel, "start_char", 0)
                    s_end = getattr(sel, "end_char", 0)

                    if c_end > c_start and s_end > s_start:
                        intersect = max(0, min(c_end, s_end) - max(c_start, s_start))
                        min_len = min(c_end - c_start, s_end - s_start)
                        if min_len > 0 and (intersect / min_len) > 0.80:
                            overlap_duplicate = True
                            break

            if not overlap_duplicate:
                selected.append(cand)

        # 3. Deterministic Final Ordering (score desc, then start_char / chunk_id asc)
        selected.sort(
            key=lambda x: (
                -x.score,
                getattr(x, "start_char", getattr(x, "chunk_id", 0)),
            )
        )

        return selected

    async def search_vectors(self, request: VectorSearchRequest) -> VectorSearchResponse:
        """
        Execute similarity search on isolated vector index for specific user_id and doc_id (or all docs of user_id if doc_id is empty).
        Query -> Embeddings -> FAISS Search -> Separate Metadata Lookup.
        """
        query = (request.query or "").strip()
        if not query:
            return VectorSearchResponse(success=True, query=query, total_results=0, results=[])

        logger.info(f"Vector similarity search for user '{request.user_id}', doc '{request.doc_id}' (Query: '{query[:50]}')")

        try:
            target_dirs: List[Tuple[Path, Path, Path]] = []

            if request.doc_id and str(request.doc_id).strip():
                doc_dir, index_path, metadata_path = self._get_isolated_paths(request.user_id, request.doc_id)
                target_dirs.append((doc_dir, index_path, metadata_path))
            else:
                clean_user = re.sub(r'[^a-zA-Z0-9_\-]', '_', request.user_id or "default_user")
                user_base = self.base_storage_dir / clean_user
                if user_base.exists() and user_base.is_dir():
                    for sub_dir in user_base.iterdir():
                        if sub_dir.is_dir():
                            idx_p = sub_dir / "index.faiss"
                            meta_p = sub_dir / "metadata.json"
                            if idx_p.exists() and meta_p.exists():
                                target_dirs.append((sub_dir, idx_p, meta_p))

            if not target_dirs:
                logger.warning(f"No isolated vector index directories found for user '{request.user_id}', doc '{request.doc_id}'")
                return VectorSearchResponse(success=True, query=query, total_results=0, results=[])

            # 1. Encode Query Vector
            query_matrix = embedding_service.encode_texts([query])

            search_results: List[VectorSearchResult] = []

            for doc_dir, index_path, metadata_path in target_dirs:
                index, metadata = self._load_index_and_metadata(index_path, metadata_path)
                if index is None or not metadata or index.ntotal <= 0:
                    continue

                top_k = min(request.top_k or 4, index.ntotal)
                scores, indices = index.search(query_matrix, top_k)

                raw_scores = scores[0]
                raw_indices = indices[0]

                for score, vec_ref in zip(raw_scores, raw_indices):
                    if vec_ref == -1 or vec_ref >= len(metadata):
                        continue

                    score_val = round(float(score), 4)
                    if score_val < request.min_score:
                        continue

                    meta_item = metadata[vec_ref]
                    if not isinstance(meta_item, dict):
                        continue

                    if request.user_id and meta_item.get("user_id") != request.user_id:
                        continue
                    if request.doc_id and meta_item.get("doc_id") != request.doc_id:
                        continue

                    search_results.append(
                        VectorSearchResult(
                            vector_ref=int(vec_ref),
                            score=score_val,
                            doc_id=meta_item.get("doc_id", request.doc_id or ""),
                            user_id=meta_item.get("user_id", request.user_id),
                            page=meta_item.get("page", 1),
                            chunk_id=meta_item.get("chunk_id", 1),
                            text=meta_item.get("text", ""),
                            start_char=meta_item.get("start_char", 0),
                            end_char=meta_item.get("end_char", 0),
                        )
                    )

            # 2. Post-Retrieval Deduplication & Deterministic Ordering
            final_results = self._deduplicate_and_sort_results(search_results)
            if request.top_k and len(final_results) > request.top_k:
                final_results = final_results[: request.top_k]

            logger.info(f"Vector search returned {len(final_results)} relevant chunks after deduplication across {len(target_dirs)} indices.")

            return VectorSearchResponse(
                success=True,
                query=query,
                total_results=len(final_results),
                results=final_results,
            )
        except Exception as exc:
            logger.warning(f"Error during vector similarity search: {exc}")
            return VectorSearchResponse(success=True, query=query, total_results=0, results=[])

    def verify_index_availability(self, user_id: str, doc_id: str) -> Tuple[bool, Any]:
        """
        Helper method to verify if document index is available and RAG ready.
        """
        return document_status_service.verify_rag_readiness(user_id, doc_id)


vector_db_service = VectorDBService()


