"""
Hybrid Retriever Service for LegalMind Advanced RAG Pipeline.
Combines:
1. Dense Vector Search (FAISS) — semantic similarity via sentence-transformers embeddings
2. Sparse Keyword Search (BM25) — term-frequency matching for exact legal terminology
3. Reciprocal Rank Fusion (RRF) — merges ranked lists from both retrievers

Why hybrid? Dense embeddings miss exact legal terms like "Section 14(b)", "force majeure",
or "DPDP Act 2023". BM25 catches keyword-exact matches that semantic search misses.
The RRF fusion combines the strengths of both approaches.
"""
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass, field

from app.core.logging import get_logger
from app.core.config import settings
from app.schemas.embeddings import VectorSearchRequest, VectorSearchResult
from app.services.vector_db_service import vector_db_service
from app.services.embedding_service import embedding_service

logger = get_logger("LegalMind.HybridRetrieverService")


@dataclass
class RetrievedChunk:
    """Unified chunk representation from any retrieval source."""
    text: str
    doc_id: str
    user_id: str
    page: int
    chunk_id: Any
    score: float  # Final fused/reranked score
    source: str = "dense"  # "dense", "bm25", or "hybrid"
    start_char: int = 0
    end_char: int = 0
    metadata: Dict[str, Any] = field(default_factory=dict)


class HybridRetrieverService:
    """
    Hybrid retrieval combining FAISS dense vector search with BM25 sparse keyword search.
    Uses Reciprocal Rank Fusion (RRF) to merge ranked result lists into a unified ranking.
    """

    def __init__(self) -> None:
        self._bm25_indices: Dict[str, Any] = {}  # Cache: "{user_id}_{doc_id}" -> (BM25, tokenized_corpus, metadata)
        logger.info("Hybrid Retriever Service initialized.")

    def _get_bm25_index(self, user_id: str, doc_id: str) -> Optional[Tuple[Any, List[List[str]], List[Dict]]]:
        """
        Load or build BM25 index from stored chunk metadata for a specific document.
        Returns (BM25Okapi instance, tokenized_corpus, metadata_list) or None.
        """
        cache_key = f"{user_id}_{doc_id}"

        if cache_key in self._bm25_indices:
            return self._bm25_indices[cache_key]

        # Load chunk metadata from the same storage path as FAISS
        clean_user = re.sub(r'[^a-zA-Z0-9_\-]', '_', user_id or "default_user")
        clean_doc = re.sub(r'[^a-zA-Z0-9_\-]', '_', doc_id or "default_doc")
        base_dir = Path(getattr(settings, "FAISS_INDEX_PATH", "storage/vector_store"))
        metadata_path = base_dir / clean_user / clean_doc / "metadata.json"

        if not metadata_path.exists():
            logger.warning(f"No metadata file found for BM25 index: {metadata_path}")
            return None

        try:
            with open(metadata_path, "r", encoding="utf-8") as f:
                metadata_list = json.load(f)

            if not metadata_list:
                return None

            # Tokenize all chunk texts for BM25
            tokenized_corpus = []
            for meta in metadata_list:
                text = (meta.get("text", "") or "").lower()
                # Simple legal-aware tokenization
                tokens = re.findall(r'\b[a-zA-Z0-9]+(?:[.-][a-zA-Z0-9]+)*\b', text)
                tokenized_corpus.append(tokens)

            if not tokenized_corpus:
                return None

            # Build BM25 index
            from rank_bm25 import BM25Okapi
            bm25 = BM25Okapi(tokenized_corpus)

            self._bm25_indices[cache_key] = (bm25, tokenized_corpus, metadata_list)
            logger.info(f"BM25 index built for user='{user_id}', doc='{doc_id}' ({len(metadata_list)} chunks)")
            return (bm25, tokenized_corpus, metadata_list)

        except Exception as exc:
            logger.warning(f"Failed to build BM25 index: {exc}")
            return None

    def _bm25_search(
        self, query: str, user_id: str, doc_id: str, top_k: int = 10
    ) -> List[RetrievedChunk]:
        """
        Execute BM25 sparse keyword search over stored document chunks.
        Returns ranked list of RetrievedChunk objects.
        """
        bm25_data = self._get_bm25_index(user_id, doc_id)
        if bm25_data is None:
            return []

        bm25, tokenized_corpus, metadata_list = bm25_data

        # Tokenize the query
        query_tokens = re.findall(r'\b[a-zA-Z0-9]+(?:[.-][a-zA-Z0-9]+)*\b', query.lower())
        if not query_tokens:
            return []

        # Get BM25 scores for all documents
        scores = bm25.get_scores(query_tokens)

        # Get top-K indices sorted by score
        import numpy as np
        top_indices = np.argsort(scores)[::-1][:top_k]

        results = []
        for idx in top_indices:
            score = float(scores[idx])
            if score <= 0.0:
                continue

            meta = metadata_list[idx] if idx < len(metadata_list) else {}

            # Normalize BM25 scores to 0-1 range (divide by max score)
            max_score = float(max(scores)) if max(scores) > 0 else 1.0
            normalized_score = min(1.0, score / max_score)

            results.append(RetrievedChunk(
                text=meta.get("text", ""),
                doc_id=meta.get("doc_id", doc_id),
                user_id=meta.get("user_id", user_id),
                page=meta.get("page", 1),
                chunk_id=meta.get("chunk_id", idx),
                score=round(normalized_score, 4),
                source="bm25",
                start_char=meta.get("start_char", 0),
                end_char=meta.get("end_char", 0),
                metadata=meta,
            ))

        logger.info(f"BM25 search returned {len(results)} results for query: '{query[:50]}'")
        return results

    async def _dense_search(
        self, query: str, user_id: str, doc_id: str, top_k: int = 10, min_score: float = 0.15
    ) -> List[RetrievedChunk]:
        """
        Execute FAISS dense vector search via existing vector_db_service.
        Converts VectorSearchResult to unified RetrievedChunk format.
        """
        try:
            search_res = await vector_db_service.search_vectors(
                VectorSearchRequest(
                    query=query,
                    user_id=user_id,
                    doc_id=doc_id,
                    top_k=top_k,
                    min_score=min_score,
                )
            )

            results = []
            for r in (search_res.results or []):
                results.append(RetrievedChunk(
                    text=r.text,
                    doc_id=r.doc_id,
                    user_id=r.user_id,
                    page=r.page,
                    chunk_id=r.chunk_id,
                    score=r.score,
                    source="dense",
                    start_char=getattr(r, "start_char", 0),
                    end_char=getattr(r, "end_char", 0),
                    metadata={
                        "doc_id": r.doc_id,
                        "user_id": r.user_id,
                        "page": r.page,
                        "chunk_id": r.chunk_id,
                        "text": r.text,
                    },
                ))

            return results
        except Exception as exc:
            logger.warning(f"Dense search failed: {exc}")
            return []

    def _reciprocal_rank_fusion(
        self,
        dense_results: List[RetrievedChunk],
        bm25_results: List[RetrievedChunk],
        k: int = 60,
        dense_weight: float = 0.6,
        bm25_weight: float = 0.4,
    ) -> List[RetrievedChunk]:
        """
        Reciprocal Rank Fusion (RRF) to merge dense and sparse ranked lists.
        Formula: RRF_score = Σ weight_i / (k + rank_i) for each result across all lists.

        Parameters:
            k: RRF constant (default 60, standard value from literature)
            dense_weight: Weight for dense retrieval scores
            bm25_weight: Weight for BM25 retrieval scores
        """
        # Create unified key for each chunk (doc_id + chunk_id)
        chunk_scores: Dict[str, Tuple[float, RetrievedChunk]] = {}

        # Score dense results
        for rank, chunk in enumerate(dense_results):
            key = f"{chunk.doc_id}_{chunk.chunk_id}_{chunk.start_char}"
            rrf_score = dense_weight / (k + rank + 1)
            if key in chunk_scores:
                existing_score, existing_chunk = chunk_scores[key]
                chunk_scores[key] = (existing_score + rrf_score, existing_chunk)
            else:
                chunk_scores[key] = (rrf_score, chunk)

        # Score BM25 results
        for rank, chunk in enumerate(bm25_results):
            key = f"{chunk.doc_id}_{chunk.chunk_id}_{chunk.start_char}"
            rrf_score = bm25_weight / (k + rank + 1)
            if key in chunk_scores:
                existing_score, existing_chunk = chunk_scores[key]
                # Merge: keep the chunk with more metadata, sum scores
                merged_chunk = existing_chunk if existing_chunk.source == "dense" else chunk
                merged_chunk.source = "hybrid"
                chunk_scores[key] = (existing_score + rrf_score, merged_chunk)
            else:
                chunk_scores[key] = (rrf_score, chunk)

        # Sort by fused RRF score descending
        sorted_results = sorted(chunk_scores.values(), key=lambda x: -x[0])

        # Update scores to fused scores and normalize
        fused_results = []
        max_fused = sorted_results[0][0] if sorted_results else 1.0
        for fused_score, chunk in sorted_results:
            chunk.score = round(min(1.0, fused_score / max_fused), 4)
            chunk.source = "hybrid" if chunk.source != "dense" or any(
                f"{chunk.doc_id}_{chunk.chunk_id}_{chunk.start_char}" ==
                f"{b.doc_id}_{b.chunk_id}_{b.start_char}" for b in bm25_results
            ) else "dense"
            fused_results.append(chunk)

        return fused_results

    async def hybrid_search(
        self,
        query: str,
        user_id: str,
        doc_id: str,
        top_k: int = 10,
        min_score: float = 0.15,
        queries: Optional[List[str]] = None,
    ) -> List[RetrievedChunk]:
        """
        Execute hybrid retrieval: FAISS dense + BM25 sparse + RRF fusion.

        If `queries` is provided (multi-query expansion), runs dense search for each
        query variant and merges all results before RRF fusion with BM25.
        """
        # 1. Dense search (potentially multi-query)
        all_dense_results: List[RetrievedChunk] = []
        search_queries = queries if queries else [query]

        for q in search_queries:
            dense_results = await self._dense_search(q, user_id, doc_id, top_k=top_k, min_score=min_score)
            all_dense_results.extend(dense_results)

        # Deduplicate dense results by chunk key, keeping highest score
        seen_keys: Dict[str, RetrievedChunk] = {}
        for chunk in all_dense_results:
            key = f"{chunk.doc_id}_{chunk.chunk_id}_{chunk.start_char}"
            if key not in seen_keys or chunk.score > seen_keys[key].score:
                seen_keys[key] = chunk
        deduped_dense = sorted(seen_keys.values(), key=lambda x: -x.score)

        # 2. BM25 sparse search (always on original query for precision)
        bm25_results = self._bm25_search(query, user_id, doc_id, top_k=top_k)

        # 3. RRF Fusion
        if bm25_results:
            fused_results = self._reciprocal_rank_fusion(deduped_dense, bm25_results)
            logger.info(
                f"Hybrid search: {len(deduped_dense)} dense + {len(bm25_results)} BM25 "
                f"→ {len(fused_results)} fused results"
            )
        else:
            # Fallback to dense-only if BM25 unavailable
            fused_results = deduped_dense
            logger.info(f"Dense-only search: {len(fused_results)} results (BM25 unavailable)")

        return fused_results[:top_k]

    def invalidate_bm25_cache(self, user_id: str, doc_id: str) -> None:
        """Invalidate cached BM25 index when a document is re-indexed."""
        cache_key = f"{user_id}_{doc_id}"
        if cache_key in self._bm25_indices:
            del self._bm25_indices[cache_key]
            logger.info(f"BM25 cache invalidated for user='{user_id}', doc='{doc_id}'")


hybrid_retriever_service = HybridRetrieverService()
